import type { Request, Response } from "express";
import type { DonationStatus } from "../generated/prisma/enums.js";
import { prisma } from "../prisma/client.js";

const donationStatuses: DonationStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
] as DonationStatus[];

function emptyBreakdown(): Record<
  DonationStatus,
  { total: number; count: number }
> {
  return {
    PENDING: { total: 0, count: 0 },
    SUCCESS: { total: 0, count: 0 },
    FAILED: { total: 0, count: 0 },
  };
}

export async function listMembers(
  _req: Request,
  res: Response,
): Promise<void> {
  const members = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          announcements: true,
          donations: true,
          departments: true,
        },
      },
    },
  });

  res.json(members);
}

export async function getDonationSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  const [grouped, recent] = await Promise.all([
    prisma.donation.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const byStatus = emptyBreakdown();

  for (const status of donationStatuses) {
    const row = grouped.find((entry) => entry.status === status);

    byStatus[status] = {
      total: Number(row?._sum.amount?.toFixed(2) ?? 0),
      count: row?._count._all ?? 0,
    };
  }

  res.json({
    totalRaised: byStatus.SUCCESS.total,
    totalDonations:
      byStatus.PENDING.count +
      byStatus.SUCCESS.count +
      byStatus.FAILED.count,
    byStatus,
    recent: recent.map((donation) => ({
      id: donation.id,
      amount: donation.amount.toFixed(2),
      method: donation.method,
      status: donation.status,
      transactionReference: donation.transactionReference,
      createdAt: donation.createdAt,
      user: donation.user,
    })),
  });
}
