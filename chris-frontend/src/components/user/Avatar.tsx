import type React from "react";
import { useEffect, useState } from "react";

import { get } from "@/services/api";

interface AvatarProps {
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ className }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      const cacheKey = "user_avatar";
      const cachedData = localStorage.getItem(cacheKey);
      const now = new Date().getTime();

      if (cachedData) {
        try {
          const { url, timestamp } = JSON.parse(cachedData);
          // Reuse cache if it's less than 1 day old
          if (now - timestamp < 24 * 60 * 60 * 1000) {
            setAvatarUrl(url);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached avatar data:", e);
          // Clear corrupted cache
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        const response = await get<{ url: string }>("/users/discord_profile");
        const dataToCache = { url: response.url, timestamp: now };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        setAvatarUrl(response.url);
      } catch (error) {
        console.error("Failed to fetch avatar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, []);

  if (loading) {
    return (
      <div className={`bg-stone-800 rounded-full animate-pulse ${className}`} />
    );
  }

  if (!avatarUrl) {
    return (
      <div
        className={`bg-stone-800 rounded-full flex items-center justify-center ${className}`}
      >
        <span className="text-stone-400 text-xl font-bold">?</span>
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt="User Avatar"
      className={`rounded-full ${className}`}
      loading="lazy"
    />
  );
};

export default Avatar;
