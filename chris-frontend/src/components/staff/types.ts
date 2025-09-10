export type Role = "plinktern" | "staff";

export type ApiUser = {
  id: number;
  sub: string;
  username: string;
  discord_id: string;
  email: string | null;
  name: string | null;
  roles: Role[];
  team_name: string | null;
  availability: string[] | null;
  shirt_size: string | null;
  dietary_restrictions: string | null;
  notes: string | null;
  can_take_photos: boolean;
};

export type Tab = "users" | "teams";
