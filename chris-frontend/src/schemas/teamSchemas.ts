import { z } from "zod";

export const TEAM_NAME_MAX = 64 as const;

export const teamNameSchema = z
  .string()
  .transform((s) => (typeof s === "string" ? s.trim() : s))
  .pipe(
    z
      .string()
      .min(1, "Team name is required")
      .max(
        TEAM_NAME_MAX,
        `Team name must be ${TEAM_NAME_MAX} characters or fewer`,
      ),
  );

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be at most 128 characters");

export const teamCreateSchema = z.object({
  name: teamNameSchema,
  password: passwordSchema,
});

export const teamJoinSchema = z.object({
  name: teamNameSchema,
  password: passwordSchema,
});

export type TeamCreateInput = z.infer<typeof teamCreateSchema>;
export type TeamJoinInput = z.infer<typeof teamJoinSchema>;
