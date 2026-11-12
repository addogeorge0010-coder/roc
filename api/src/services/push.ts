import { prisma } from "../prisma/client.js";

type PreferenceField = "notifyAnnouncements" | "notifySermons";

interface PushNotificationInput {
  title: string;
  body: string;
  url: string;
  preference: PreferenceField;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: { url: string };
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;

export async function sendPushNotification({
  title,
  body,
  url,
  preference,
}: PushNotificationInput): Promise<void> {
  const recipients = await prisma.pushToken.findMany({
    where: {
      user:
        preference === "notifyAnnouncements"
          ? { notifyAnnouncements: true }
          : { notifySermons: true },
    },
    select: { token: true },
  });

  if (recipients.length === 0) {
    return;
  }

  const messages: ExpoPushMessage[] = recipients.map(({ token }) => ({
    to: token,
    title,
    body,
    sound: "default",
    data: { url },
  }));

  for (let index = 0; index < messages.length; index += BATCH_SIZE) {
    const batch = messages.slice(index, index + BATCH_SIZE);

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error(`Expo push request failed with ${response.status}`);
    }
  }
}
