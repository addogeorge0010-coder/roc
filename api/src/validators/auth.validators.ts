import { z } from "zod";

const emailSchema = z
  .email("Enter a valid email address")
  .transform((value) => value.trim().toLowerCase());

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long"),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(72, "Password must be at most 72 characters long"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const sessionTokenSchema = z.object({
  sessionToken: z.string().trim().min(1, "Session token is required"),
});

export const googleSignInSchema = z.object({
  idToken: z.string().trim().min(1, "Google ID token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SessionTokenInput = z.infer<typeof sessionTokenSchema>;
export type GoogleSignInInput = z.infer<typeof googleSignInSchema>;
