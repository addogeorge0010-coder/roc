import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(160, "Title must be at most 160 characters long"),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(10_000, "Content must be at most 10,000 characters long"),
  departmentId: z.string().uuid("Invalid department ID").optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2_000, "Comment must be at most 2,000 characters long"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
