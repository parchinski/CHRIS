import type React from "react";

import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/user/Avatar";
import UserDataCard from "@/components/user/UserDataCard";
import UserSetupModal from "@/components/user/UserSetupModal";
import TeamManagement from "@/components/user/TeamManagement";
import TeamMembers from "@/components/user/TeamMembers";

const UserProfile: React.FC = () => {
  const { user, checkAuthStatus } = useAuth();

  const handleTeamJoined = () => {
    checkAuthStatus();
  };

  if (!user) {
    return <p className="text-center text-stone-400">Loading user data...</p>;
  }

  if (!user.availability?.length || !user.shirt_size) {
    return <UserSetupModal username={user.username} />;
  }

  return (
    <div className="min-h-[75vh] mx-auto max-w-2xl flex flex-col align-center gap-6">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-3xl font-bold text-stone-300">PROFILE</h2>
      </div>

      <div className="flex items-center justify-center">
        <Avatar className="w-40 h-40" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <UserDataCard label="Username" value={user.username} />
        <UserDataCard label="Full Name" value={user.name} />
        <UserDataCard label="Email" value={user.email} />
        <UserDataCard label="Team" value={user.team_name || "Not in a team"} />
        {user.availability && (
          <UserDataCard
            label="Availability"
            value={user.availability.join(" & ")}
          />
        )}
        {user.shirt_size && (
          <UserDataCard label="Shirt Size" value={user.shirt_size} />
        )}
        {user.dietary_restrictions && (
          <UserDataCard
            label="Dietary Restrictions"
            value={user.dietary_restrictions}
          />
        )}
        {user.notes && <UserDataCard label="Notes" value={user.notes} />}
      </div>

      {!user.team_name ? (
        <TeamManagement onTeamJoined={handleTeamJoined} />
      ) : (
        <TeamMembers teamName={user.team_name} />
      )}
    </div>
  );
};

export default UserProfile;
