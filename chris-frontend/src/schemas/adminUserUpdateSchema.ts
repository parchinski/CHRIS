import { z } from "zod";
import { AVAILABILITY_OPTIONS, SHIRT_SIZES } from "./userUpdateSchema";
import { TEAM_NAME_MAX } from "./teamSchemas";

// Admin partial update: all fields optional, mirror backend constraints
export const adminUserUpdateSchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    email: z.string().email().optional(),
    team_name: z
      .string()
      .transform((s) => (typeof s === "string" ? s.trim() : s))
      .transform((s) => (s ? s.toLowerCase() : s))
      .refine((s) => (s ? s.length <= TEAM_NAME_MAX : true), {
        message: `Team name cannot exceed ${TEAM_NAME_MAX} characters`,
      })
      .optional(),
    availability: z
      .array(z.enum(AVAILABILITY_OPTIONS))
      .min(1, "Availability cannot be empty")
      .optional(),
    shirt_size: z.enum(SHIRT_SIZES).optional(),
    dietary_restrictions: z.string().max(1024).optional(),
    notes: z.string().max(1024).optional(),
    can_take_photos: z.boolean().optional(),
  })
  .strict();

export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;
