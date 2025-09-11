import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { get } from "@/services/api";

interface TeamMember {
  id: number;
  username: string;
  discord_id: string;
  name: string;
}

interface TeamMembersData {
  team_name: string;
  members: TeamMember[];
  created_by: string;
}

interface TeamMembersProps {
  teamName: string;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ teamName }) => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState<TeamMembersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await get<TeamMembersData>(
          `/teams/members/${encodeURIComponent(teamName)}`,
        );
        setTeamData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load team members",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (teamName) {
      fetchTeamMembers();
    }
  }, [teamName]);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl border border-stone-800/80 bg-stone-900/60">
        <p className="text-stone-400">Loading team members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-stone-800/80 bg-stone-900/60">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!teamData || teamData.members.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-stone-800/80 bg-stone-900/60">
        <h4 className="text-lg font-medium text-stone-200 mb-2">
          Team Members
        </h4>
        <p className="text-stone-400">You are not currently in a team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 rounded-xl border border-stone-800/80 bg-stone-900/60">
      <h3 className="text-lg font-semibold text-stone-300">
        Team: {teamData.team_name} ({teamData.members.length}/4)
      </h3>
      <div className="grid gap-3">
        {teamData.members.map((member) => (
          <div
            key={member.discord_id}
            className="flex items-center justify-between p-3 bg-stone-900/50 hover:bg-stone-950/50 border border-stone-800 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="text-stone-200 font-medium truncate">
                {member.name}
              </div>
              <div className="text-stone-400 text-sm truncate">
                @{member.username}
              </div>
            </div>
            {user?.discord_id === teamData.created_by &&
              user?.discord_id === member.discord_id && (
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/50 px-2 py-1 rounded-md">
                  Leader
                </span>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers;
