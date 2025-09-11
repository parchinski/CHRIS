import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { get, del } from "@/services/api";

interface TeamMember {
  id: number;
  username: string;
  name: string;
}

interface AdminTeam {
  id: number;
  name: string;
  created_by: string;
  members: TeamMember[];
}

const AdminTeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const data = await get<AdminTeam[]>("/staff/teams");
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteTeam = async (teamId: number) => {
    const t = toast.loading("Deleting team...");
    try {
      await del(`/staff/teams/${teamId}`);
      toast.success("Team deleted", { id: t });
      fetchTeams(); // Refresh the list
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete team",
        {
          id: t,
        },
      );
    }
  };

  if (isLoading) {
    return <p>Loading teams...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 bg-stone-900/50 rounded-lg border border-stone-800">
      <h2 className="text-2xl font-bold text-stone-300 mb-4">
        Team Administration
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="font-medium">{team.name}</TableCell>
              <TableCell>
                {team.members.map((m) => m.name).join(", ")}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {team.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the team and remove all
                        members.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminTeamManagement;
