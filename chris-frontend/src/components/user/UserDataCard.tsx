import type React from "react";

interface UserDataCardProps {
  label: string;
  value?: React.ReactNode;
}

const UserDataCard: React.FC<UserDataCardProps> = ({ label, value }) => (
  <div className="rounded-lg border border-stone-800 bg-stone-900/50 hover:bg-stone-950/50 p-4 transition-colors">
    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
      {label}
    </p>
    <p className="mt-1.5 text-lg text-stone-300">{value ?? "—"}</p>
  </div>
);

export default UserDataCard;
