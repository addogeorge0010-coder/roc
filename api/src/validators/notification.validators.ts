import { z } from "zod";

export const updateNotificationPreferencesSchema = z
  .object({
    notifyAnnouncements: z.boolean().optional(),
    notifySermons: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.notifyAnnouncements !== undefined ||
      value.notifySermons !== undefined,
    {
      message: "At least one preference is required",
    },
  );

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;

export const registerPushTokenSchema = z.object({
  token: z.string().trim().min(1, "Push token is required").max(500),
  platform: z.enum(["ios", "android", "web"]),
});

export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;

export const unregisterPushTokenSchema = z.object({
  token: z.string().trim().min(1, "Push token is required").max(500),
});

export type UnregisterPushTokenInput = z.infer<
  typeof unregisterPushTokenSchema
>;
