import { z } from "zod";

export const AVAILABILITY_OPTIONS = ["Saturday", "Sunday"] as const;
export type AvailabilityOption = (typeof AVAILABILITY_OPTIONS)[number];

export const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type ShirtSize = (typeof SHIRT_SIZES)[number];

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  team_name: z.string(),
  availability: z
    .array(z.enum(AVAILABILITY_OPTIONS))
    .min(1, "Select at least one day")
    .max(AVAILABILITY_OPTIONS.length, "Too many days selected"),
  shirt_size: z.enum(SHIRT_SIZES),
  dietary_restrictions: z.string().optional(),
  notes: z.string().optional(),
  can_take_photos: z.boolean(),
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
