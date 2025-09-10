import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiUser } from "./types";
import StaffAvatar from "./StaffAvatar";

interface TeamCardProps {
  teamName: string;
  members: ApiUser[];
  teamDrafts: Record<number, string>;
  onTeamDraftChange: (userId: number, value: string) => void;
  onSaveTeam: (userId: number, teamName: string) => void;
  onEditingIdChange: (id: number) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  teamName,
  members,
  teamDrafts,
  onTeamDraftChange,
  onSaveTeam,
  onEditingIdChange,
}) => {
  const draftFor = (id: number, fallback?: string | null) =>
    teamDrafts[id] ?? (fallback || "");

  return (
    <div className="rounded-lg border border-stone-800/80 bg-stone-950/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {teamName}{" "}
          <span className="ml-2 text-xs text-stone-400">{members.length}</span>
        </h3>
      </div>
      <ul className="space-y-2">
        {members.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between rounded-md border border-stone-800/70 bg-stone-900/60 px-3 py-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <StaffAvatar userId={user.discord_id} className="w-10 h-10" />
              <div className="min-w-0">
                <div className="text-white truncate">{user.username}</div>
                <div className="text-xs text-stone-400 truncate">
                  {user.email || user.discord_id}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={draftFor(user.id, user.team_name)}
                onChange={(e) => onTeamDraftChange(user.id, e.target.value)}
                placeholder="Team"
                className="h-8 w-48 sm:w-60 bg-stone-950/70 border-stone-800 text-white"
                onFocus={() => {
                  onEditingIdChange(user.id);
                  onTeamDraftChange(user.id, user.team_name || "");
                }}
              />
              <Button
                type="button"
                size="sm"
                className="h-8 px-3 bg-white text-black hover:opacity-90"
                onClick={() =>
                  onSaveTeam(user.id, draftFor(user.id, user.team_name))
                }
                disabled={
                  draftFor(user.id, user.team_name) === (user.team_name || "")
                }
              >
                Assign
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamCard;
