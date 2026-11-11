import { z } from "zod";
import { DonationMethod } from "../generated/prisma/enums.js";

const donationMethods = [
  DonationMethod.MOBILE_MONEY,
  DonationMethod.CARD,
] as const;

export const initiateDonationSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .max(1_000_000, "Amount is too large"),
  method: z.enum(donationMethods),
});

export type InitiateDonationInput = z.infer<typeof initiateDonationSchema>;
