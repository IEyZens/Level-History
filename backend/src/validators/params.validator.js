import { z } from "zod";

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "ID must be greater than 0" }),
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, "Page must be at least 1")
    .default(1)
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val >= 1 && val <= 100, {
      message: "Limit must be between 1 and 100",
    })
    .default(10)
    .optional(),
  sortBy: z.enum(["createdAt", "date", "title", "name"]).optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});
