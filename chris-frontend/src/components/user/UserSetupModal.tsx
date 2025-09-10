import type React from "react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import ArrowIcon from "@/components/ArrowIcon";

interface UserSetupModalProps {
  username?: string | null;
}

const UserSetupModal: React.FC<UserSetupModalProps> = ({ username }) => {
  const initialFocusRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    initialFocusRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <section className="relative w-full max-w-lg rounded-2xl border border-stone-800/80 bg-stone-900/95 p-6 shadow-2xl cyber-ring">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-10 -z-10 opacity-50 blur-2xl"
          >
            <div className="h-full w-full rounded-[28px] bg-[linear-gradient(135deg,hsl(var(--primary)/.18),hsl(var(--secondary)/.15),hsl(var(--accent)/.14))]" />
          </div>

          <header className="space-y-2 flex flex-col gap-4">
            <h2
              id="setup-title"
              className="text-xl font-semibold text-stone-300"
            >
              Finish setting up your profile
            </h2>
            <p className="text-sm text-stone-300">
              {username ? (
                <>
                  <span className="font-semibold text-stone-300">
                    {username}
                  </span>
                  , you still need to add your team, availability, and shirt
                  size.
                </>
              ) : (
                "You still need to add your team, availability, and shirt size."
              )}
            </p>
          </header>

          <p className="mt-3 text-xs text-stone-400">
            Completing these helps us organize the event and get your gear
            right. It only takes a moment.
          </p>

          <div className="mt-5 flex justify-end">
            <Link
              ref={initialFocusRef}
              to="/settings"
              className="group inline-flex items-center justify-center gap-2 rounded-md border border-stone-700/80 bg-stone-900/90 px-4 py-2 text-sm font-medium text-stone-300 hover:bg-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
              aria-label="Edit Profile"
            >
              Edit Profile
              <ArrowIcon className="text-stone-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserSetupModal;
