import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  teamCreateSchema,
  teamJoinSchema,
  teamNameSchema,
} from "@/schemas/teamSchemas";
import { get, post } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface TeamCheck {
  name: string;
  exists: boolean;
}

interface TeamManagementProps {
  onTeamJoined: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ onTeamJoined }) => {
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [teamExists, setTeamExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkAuthStatus } = useAuth();

  const checkTeam = async () => {
    // Local validation to avoid HTTP errors
    const parsed = teamNameSchema.safeParse(teamName);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid team name");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await get<TeamCheck>(
        `/teams/check/${encodeURIComponent(parsed.data)}`,
      );
      setTeamExists(result.exists);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamAction = async () => {
    // Validate inputs before HTTP
    const schema = teamExists ? teamJoinSchema : teamCreateSchema;
    const parsed = schema.safeParse({ name: teamName, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = teamExists ? "/teams/join" : "/teams/create";
      await post(endpoint, parsed.data);

      await checkAuthStatus();
      onTeamJoined();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Team operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setTeamName("");
    setPassword("");
    setTeamExists(null);
    setError(null);
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-stone-800/80 bg-stone-900/60">
      <h3 className="text-lg font-semibold text-stone-300">Team Select</h3>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <Label
            htmlFor="teamName"
            className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono"
          >
            Team Name
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="flex-1 bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
              maxLength={64}
            />
            <Button
              onClick={checkTeam}
              disabled={isLoading || !teamName.trim()}
              variant="outline"
              className="text-stone-300 border-stone-800 bg-stone-900/50 hover:bg-stone-950/50"
            >
              Check
            </Button>
          </div>
        </div>

        {teamExists !== null && (
          <>
            <div className="p-3 bg-stone-900/50 border border-stone-800 rounded">
              <p className="text-stone-300">
                {teamExists ? (
                  <>
                    Team <strong>{teamName}</strong> exists. Enter the password
                    to join.
                  </>
                ) : (
                  <>
                    Team <strong>{teamName}</strong> doesn't exist. Enter a
                    password to create it.
                  </>
                )}
              </p>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono"
              >
                Team Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  teamExists ? "Enter team password" : "Create team password"
                }
                className="mt-1 bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTeamAction}
                disabled={isLoading || !password.trim()}
                className="flex-1 font-semibold text-stone-300 border-stone-800 bg-stone-900/50 hover:bg-stone-950/50"
                variant="outline"
              >
                {isLoading
                  ? "Processing..."
                  : teamExists
                    ? "Join Team"
                    : "Create Team"}
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="text-stone-300 border-stone-800 bg-stone-900/50 hover:bg-stone-950/50"
              >
                Reset
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
