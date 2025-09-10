"""
Discord's api has a dynamic ratelimit systen, which causes some headache to handle.
Most API responses have a handful of headers listing info about ratelimits, including
but not limited to how many more requests can be made to the route and how long until
more requests are available.


Routes are grouped not just by the path, but also by two extra identifiers:

- The "top-level resources", which are currently guilds, channels, and webhooks.
  Ratelimits on one channel are independent from ratelimits on another

- The "bucket" that a route falls into. To quote Discord's docs, "In some cases,
  per-route limits will be shared across a set of similar endpoints, indicated in the
  X-RateLimit-Bucket header".


Discord docs on ratelimits: https://discord.com/developers/docs/topics/rate-limits

Rate limit code from `interactions.py` was used as a reference:
https://github.com/interactions-py/interactions.py/blob/stable/interactions/api/http/http_client.py
"""

import logging
import threading
import time
from typing import ClassVar, Mapping

import requests

from chris.core.config import settings

logger = logging.getLogger("discord")


class GlobalLock:
    """
    A global lock for the total amount of Discord requests per second.
    Discord enforces a limit of 50/second, but our limit should be just
    underneath that to avoid accidentally hitting it when possible.
    """

    available_requests: int
    """The number of requests that can be made before the next reset period."""

    reset_at: float
    """The Unix timestamp when the requests per second refreshes."""

    _lock: threading.Lock
    """
    A lock to keep the available requests consistent across threads.
    """

    MAX_REQUESTS: ClassVar[int] = 45
    """
    The maximum amount of requests that can be made per second.
    This should always be under 50, otherwise global ratelimits
    will be very frequent.
    """

    def __init__(self) -> None:
        self.available_requests = self.MAX_REQUESTS
        self.reset_at = time.time()
        self._lock = threading.Lock()

    def _reset(self):
        """Restore the available requests for this second."""
        self.available_requests = self.MAX_REQUESTS
        self.reset_at = time.time() + 1

    def set_reset_time(self, delta: float):
        """
        Wait for `delta` time before resuming requests. This should be called
        whenever a global 429 is received.

        Args:
            delta (float): The time in seconds to wait.
        """
        self.reset_at = time.time() + delta
        self.available_requests = 0

    def wait(self):
        """Check that we have more requests available before sending a new one."""
        with self._lock:
            # Enough time has passed to give us more calls
            if self.reset_at <= time.time():
                self._reset()

            # All the available calls have been spent,
            # so we need to wait for more
            if self.available_requests <= 0:
                time.sleep(self.reset_at - time.time())
                self._reset()

        # Use up a call
        self.available_requests -= 1


class Bucket:
    """A group of routes that share a single ratelimit."""

    hash: str | None
    """The unique hash of the bucket. Multiple routes use the same bucket if the hash is shared."""

    limit: int
    """The max amount of requests that the bucket can do before requiring a cooldown."""

    remaining: int
    """The current amount of requests that the bucket can do before requiring a cooldown."""

    resets_at: int
    """The Unix timestamp when the bucket will finish cooling down."""

    routes: list[str]
    """All of the routes that this bucket applies to. This should be empty if a temporary bucket is made."""

    DEFAULT_LIMIT = 1
    DEFAULT_REMAINING = 1
    DEFAULT_RESETS_AT = 0

    def __init__(
        self,
        hash: str | None = None,
        limit: int = DEFAULT_LIMIT,
        remaining: int = DEFAULT_REMAINING,
        resets_at: int = DEFAULT_RESETS_AT,
    ) -> None:
        self.hash = hash
        self.limit = limit
        self.remaining = remaining
        self.resets_at = resets_at

        self.routes = []

        self._lock = threading.Lock()
        """A lock to enforce the cooldown for a ratelimit. While it is held, all requests for this route are blocked."""

        self._semaphor = threading.Semaphore(limit) if limit else None
        """
        A semaphor to prevent having more requests in flight than a bucket can support.
        Without this, a bucket with a limit of 5 could send 6 requests before recieving a response,
        which would hit a 429.
        """

    @classmethod
    def from_headers(cls, headers: Mapping[str, str], route: str | None = None):
        """
        Create a new bucket from discord headers.

        For information on what headers we get, see
        https://discord.com/developers/docs/topics/rate-limits#header-format
        """
        bucket = cls(
            hash=headers.get("X-RateLimit-Bucket"),
            limit=int(headers.get("X-RateLimit-Limit", cls.DEFAULT_LIMIT)),
            remaining=int(headers.get("X-RateLimit-Remaining", cls.DEFAULT_REMAINING)),
            resets_at=int(headers.get("X-RateLimit-Reset", cls.DEFAULT_RESETS_AT)),
        )

        if route:
            bucket.routes.append(route)

        return bucket

    def update_from_headers(self, headers: Mapping[str, str], route: str | None = None):
        """
        Update the current bucker from discord headers.

        For information on what headers we get, see
        https://discord.com/developers/docs/topics/rate-limits#header-format
        """

        self.hash = headers.get("X-RateLimit-Bucket", self.hash)

        self.remaining = int(headers.get("X-RateLimit-Remaining", self.remaining))

        self.resets_at = int(headers.get("X-RateLimit-Reset", self.resets_at))

        # Limit is special since we need to update the semaphor
        limit = int(headers.get("X-RateLimit-Limit", self.limit))

        if not self._semaphor or limit != self.limit:
            self._semaphor = threading.Semaphore(limit)
            self.limit = limit

        if route and route not in self.routes:
            self.routes.append(route)

    def aquire(self):
        """
        Aquire the internal semaphor. This blocks until a request is ready to be made.

        Using `with bucket:` is preferred, as that will guarantee the semaphor is released.
        """

        if self._semaphor is None:
            # We don't have a limit on requests yet
            return

        # Check if we're on cooldown. If so, wait for it to end
        if self._lock.locked():
            with self._lock:
                pass

        self._semaphor.acquire()

    def release(self):
        """Release the internal semaphor. This will not affect the cooldown lock."""

        if self._semaphor is None:
            return

        self._semaphor.release()

    def lock_for(self, delta: float, block: bool = False):
        """
        Stop requests made from this bucket until after some seconds have passed.
        This is used when we're out of requests on a ratelimit and need to cool down.

        Args:
            delta (int): How many seconds to wait.
            block (bool): Whether to wait until the lock is released.
        """

        if self._lock.locked():
            # Another thread already started the cooldown
            if block:
                # We still want to wait for it to finish
                with self._lock:
                    pass

        self._lock.acquire()

        def _unlock():
            logger.debug(f"Unlocking bucket {self.hash}")
            self._lock.release()

        if block:
            time.sleep(delta)
            _unlock()
        else:
            threading.Timer(delta, _unlock).start()

    def __enter__(self):
        self.aquire()

    def __exit__(self, exc_type, exc_value, traceback):
        self.release()

    def __repr__(self):
        return f"<{self.__class__.__name__}(hash={self.hash}, limit={self.limit}, remaining={self.remaining})>"


class DiscordRequester:
    """
    Sending requests to discord requires some hoops for ratelimits,
    so the majority of the logic is done here. This class is effectively
    a singleton so instances can be made
    """

    DISCORD_API_BASE = "https://discord.com/api"
    """
    The base of the discord api path.
    """

    DISCORD_CDN_BASE = "https://cdn.discordapp.com"
    """
    The base of the discord CDN path.
    """

    buckets: ClassVar[list[Bucket]] = []
    """
    All of the current buckets that have been encountered.
    This is a class attribute, since we should be tracking it
    even across different threads.
    """

    _global_lock: ClassVar[GlobalLock] = GlobalLock()
    """
    The global lock to stay within the global ratelimit.
    """

    @classmethod
    def get_bucket(cls, route: str):
        for bucket in cls.buckets:
            if route in bucket.routes:
                return bucket

        # If we don't have a bucket for a route, we create a temporary one
        return Bucket()

    @classmethod
    def update_bucket(cls, route: str, headers: Mapping[str, str]) -> Bucket:
        for bucket in cls.buckets:
            if route in bucket.routes:
                # There's an existing bucket we should use
                bucket.update_from_headers(headers, route)
                return bucket

        # Otherwise we make a new one
        bucket = Bucket.from_headers(headers, route)
        cls.buckets.append(bucket)
        return bucket

    @classmethod
    def request(
        cls,
        endpoint: str,
        method: str = "GET",
        headers={},
        json: dict | None = None,
        params: dict | None = None,
        **kwargs,
    ):
        """
        Make a request to discord.

        Args:
            endpoint (str): The endpoint to request. This should contain placeholders for
                            other values, e.x. `/guilds/{guild_id}/emojis/{emoji_id}`.
            method (str): The HTTP method to request with.
            headers (dict[str, str]): Any extra headers to send. The Authorization and
                                      User-Agent headers are automatically included on any request.
            json (dict): JSON data to send with the request.
            params (dict): Parameters to send with the request.

            kwargs: The parameters to format the endpoint with. See the note below

        Note:
            Guilds (aka servers) and Channels are considered "top-level resources", and as
            such have special considerations when tracking ratelimits. Because of this,
            any endpoints for guilds and channels MUST use `guild_id` and `channel_id` in
            keyword arguments. Other data contained in the endpoint is recommended to also
            be passed through keyword arguments for style consistency.
        """

        headers_with_auth = {
            "Authorization": f"Bot {settings.discord_bot_token}",
            "User-Agent": "DiscordBot (https://github.com/HackUCF/chris-backend v1.0.0)",
            **headers,
        }

        # We account for "top-level" resources by tacking the ids onto the end of the endpoints.
        # This is why we specifically need `guild_id` and `channel_id` spelled like that
        route = f"{endpoint}:{kwargs.get('guild_id')}:{kwargs.get('channel_id')}"

        bucket = cls.get_bucket(route)

        # We keep trying requests until they work
        while True:
            # Make sure the bucket isn't on cooldown
            with bucket:
                # Make sure we're under the global rate limit
                cls._global_lock.wait()

                # The star of the show, the one we've all been waiting for,
                # the actual request to discord
                response = requests.request(
                    method=method,
                    url=cls.DISCORD_API_BASE + endpoint.format(**kwargs),
                    headers=headers_with_auth,
                    json=json,
                    params=params,
                )

                logging.debug(
                    f"Requested {endpoint.format(**kwargs)}, received code {response.status_code}"
                )

                # Update the bucket
                bucket = cls.update_bucket(route, response.headers)

                # Handle any possible ratelimits
                if response.status_code == 429:
                    body: dict[str, bool | float | str] = response.json()

                    if body.get("global", False):
                        # We hit a global rate limit (bad)
                        logger.warning(
                            f"A global ratelimit was reached! Locking all requests for {body.get('retry_after')} seconds."
                        )
                        cls._global_lock.set_reset_time(body.get("retry_after"))  # type: ignore

                    elif body.get("message") == "The resource is being rate limited.":
                        # We hit a resource limit
                        logger.warning(
                            f"A resource ratelimit was reached! Locking route `{route}` for {body.get('retry_after')} seconds."
                        )
                        bucket.lock_for(body.get("retry_after"), block=True)  # type: ignore

                    else:
                        # We hit an endpoint ratelimit
                        logger.warning(
                            f"An endpoint ratelimit was reached! Locking route `{route}` (bucket {bucket.hash}) for {body.get('retry_after')} seconds."
                        )
                        bucket.lock_for(body.get("retry_after"), block=True)  # type: ignore

                    # Retry the request
                    continue

                if bucket.remaining == 0:
                    # We just did the last request before the cooldown,
                    # so we pause future requests until it's ready again.
                    # However, we don't need to wait for it ourselves
                    logging.info(
                        f"Exhausted the ratelimit for `{route}` (bucket {bucket.hash}, limit {bucket.limit}). Cooling down for {response.headers.get('X-RateLimit-Reset-After')} seconds."
                    )

                    bucket.lock_for(
                        int(response.headers.get("X-RateLimit-Reset-After", 0))
                    )

                # We got the data, so we return it
                return response
