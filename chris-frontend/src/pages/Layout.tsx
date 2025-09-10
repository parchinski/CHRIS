import type React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import HorseEmote from "/7g-horse-emote.svg";

const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={
        active
          ? "text-primary font-semibold"
          : "text-stone-300 hover:text-primary transition-colors"
      }
    >
      {label}
    </Link>
  );
};

const Layout: React.FC = () => {
  const { hasRole } = useAuth();
  const { pathname } = useLocation();
  const isStaffRoute = pathname === "/staff";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40">
        <div className="relative overflow-hidden">
          <div className="header-accent" aria-hidden="true" />
          <div className="relative glass">
            <nav className="mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link to="/" className="shrink-0">
                  <img
                    className="w-9 h-9 rounded-md"
                    src={HorseEmote}
                    alt="7G Horse"
                  />
                </Link>
                <Link
                  to="/"
                  className="text-xl font-extrabold tracking-tight text-primary"
                >
                  IHPL
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <NavLink to="/" label="Profile" />
                <NavLink to="/settings" label="Settings" />
                {hasRole("staff") && <NavLink to="/staff" label="Staff" />}
                <LogoutButton />
              </div>
            </nav>
          </div>
        </div>
      </header>
      {isStaffRoute ? (
        <main className="p-6">
          <Outlet />
        </main>
      ) : (
        <main className="container mx-auto p-4">
          <section className="relative rounded-xl border border-stone-800/60 bg-stone-900/60 p-4 md:p-6 cyber-ring overflow-hidden">
            <Outlet />
          </section>
        </main>
      )}
      <footer className="container mx-auto px-4 pb-4 text-sm text-stone-500">
        <span className="font-mono">
          © {new Date().getFullYear()} HACK@UCF
        </span>
      </footer>
    </div>
  );
};

export default Layout;
