-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notify_announcements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_sermons" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "sermon_saves" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sermon_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sermon_saves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sermon_saves_user_id_created_at_idx" ON "sermon_saves"("user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "sermon_saves_user_id_sermon_id_key" ON "sermon_saves"("user_id", "sermon_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_user_id_idx" ON "push_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "sermon_saves" ADD CONSTRAINT "sermon_saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_saves" ADD CONSTRAINT "sermon_saves_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
