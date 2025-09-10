import type React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tab } from "./types";

interface SearchAndTabsProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  q: string;
  setQ: (q: string) => void;
}

const SearchAndTabs: React.FC<SearchAndTabsProps> = ({
  tab,
  setTab,
  q,
  setQ,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Admin sections"
      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          onClick={() => setTab("users")}
          className={
            "h-8 px-3 rounded-md border transition-colors " +
            (tab === "users"
              ? "bg-stone-950/70 border-stone-800 text-white"
              : "bg-transparent border-stone-800/60 text-stone-300 hover:bg-stone-950/40")
          }
        >
          Users
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={tab === "teams"}
          onClick={() => setTab("teams")}
          className={
            "h-8 px-3 rounded-md border transition-colors " +
            (tab === "teams"
              ? "bg-stone-950/70 border-stone-800 text-white"
              : "bg-transparent border-stone-800/60 text-stone-300 hover:bg-stone-950/40")
          }
        >
          Teams
        </Button>
      </div>
      <div className="relative w-full md:w-96">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search username, email, name, discord, team, notes…"
          className="pl-9 bg-stone-950/70 border-stone-800 text-white placeholder:text-stone-500"
        />
      </div>
    </div>
  );
};

export default SearchAndTabs;
