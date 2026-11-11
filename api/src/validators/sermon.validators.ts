import { z } from "zod";

export const createSermonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(160, "Title must be at most 160 characters long"),
  youtubeVideoId: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9_-]{11}$/,
      "YouTube video ID must be 11 characters long",
    ),
  datePreached: z.coerce.date().optional(),
});

export type CreateSermonInput = z.infer<typeof createSermonSchema>;
