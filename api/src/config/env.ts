import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  DATABASE_SCHEMA: z.string().default("public"),
  NEON_AUTH_BASE_URL: z.string().url("NEON_AUTH_BASE_URL must be a valid URL"),
  NEON_AUTH_JWKS_URL: z.string().url("NEON_AUTH_JWKS_URL must be a valid URL"),
  NEON_AUTH_COOKIE_SECRET: z
    .string()
    .min(32, "NEON_AUTH_COOKIE_SECRET must be at least 32 characters long"),
  CORS_ORIGIN: z.string().default("*"),
  SEED_ADMIN_NAME: z.string().default("Ama Mensah"),
  SEED_ADMIN_EMAIL: z.string().default("admin@rpc.church"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("Admin123!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;

export const neonAuthIssuer = new URL(env.NEON_AUTH_BASE_URL).origin;
