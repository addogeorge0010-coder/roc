import { randomBytes } from "node:crypto";

export function createTransactionReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `DON-${timestamp}-${suffix}`;
}
