import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { DonationStatus } from "../generated/prisma/enums.js";
import { prisma } from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import { createTransactionReference } from "../utils/transactionReference.js";
import type { InitiateDonationInput } from "../validators/donation.validators.js";

export async function initiateDonation(
  req: Request,
  res: Response,
): Promise<void> {
  const user = req.user;

  if (!user) {
    throw new HttpError(401, "Authentication required");
  }

  const { amount, method } = req.body as InitiateDonationInput;

  const donation = await prisma.donation.create({
    data: {
      amount: new Prisma.Decimal(amount.toFixed(2)),
      userId: user.id,
      method,
      status: DonationStatus.PENDING,
      transactionReference: createTransactionReference(),
    },
  });

  res.status(201).json({
    ...donation,
    amount: donation.amount.toFixed(2),
  });
}
