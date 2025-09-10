import type React from "react";

import type { ApiUser } from "./types";
import TeamCard from "./TeamCard";

interface TeamsGridProps {
  teamsGrouped: [string, ApiUser[]][];
  teamDrafts: Record<number, string>;
  onTeamDraftChange: (userId: number, value: string) => void;
  onSaveTeam: (userId: number, teamName: string) => void;
  onEditingIdChange: (id: number) => void;
}

const TeamsGrid: React.FC<TeamsGridProps> = ({
  teamsGrouped,
  teamDrafts,
  onTeamDraftChange,
  onSaveTeam,
  onEditingIdChange,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {teamsGrouped.map(([teamName, members]) => (
        <TeamCard
          key={teamName}
          teamName={teamName}
          members={members}
          teamDrafts={teamDrafts}
          onTeamDraftChange={onTeamDraftChange}
          onSaveTeam={onSaveTeam}
          onEditingIdChange={onEditingIdChange}
        />
      ))}
    </div>
  );
};

export default TeamsGrid;
