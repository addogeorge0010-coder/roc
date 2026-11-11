-- Link local users to Neon Auth identities.
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "neon_auth_id" TEXT;

CREATE UNIQUE INDEX "users_neon_auth_id_key" ON "users"("neon_auth_id");
