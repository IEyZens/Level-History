import { z } from "zod";

export const updateMeSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  avatar: z.string().url().optional().nullable(),
});
