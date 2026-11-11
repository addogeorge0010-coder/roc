import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(80, "Name must be at most 80 characters long"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters long")
    .optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
