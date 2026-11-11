import { neonAuth } from "../src/auth/neonAuth.js";
import { env } from "../src/config/env.js";
import { Role } from "../src/generated/prisma/enums.js";
import { prisma } from "../src/prisma/client.js";

const hoursAgo = (hours: number): Date =>
  new Date(Date.now() - hours * 60 * 60 * 1000);

const daysAgo = (days: number): Date => hoursAgo(days * 24);

async function ensureAdminIdentity(): Promise<string | undefined> {
  try {
    const result = await neonAuth.signUp.email({
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
    });

    return result.data?.user?.id;
  } catch {
    return undefined;
  }
}

async function main(): Promise<void> {
  const neonAuthId = await ensureAdminIdentity();

  const admin = await prisma.user.upsert({
    where: { email: env.SEED_ADMIN_EMAIL },
    update: {
      name: env.SEED_ADMIN_NAME,
      role: Role.ADMIN,
      neonAuthId,
    },
    create: {
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      neonAuthId,
      role: Role.ADMIN,
    },
  });

  if ((await prisma.announcement.count()) === 0) {
    await prisma.announcement.createMany({
      data: [
        {
          title: "Christmas Carol Night is here",
          content:
            "Join the whole church family on December 20 at 6:00 PM for an evening of carols, scripture, and candlelight. Bring a friend and come expectant.",
          authorId: admin.id,
          createdAt: hoursAgo(2),
        },
        {
          title: "Advent devotionals now available",
          content:
            "Our 2026 Advent devotional is available at the welcome desk and as a digital download. Let's prepare our hearts together over the next four weeks.",
          authorId: admin.id,
          createdAt: hoursAgo(7),
        },
        {
          title: "Midweek prayer & fasting",
          content:
            "We gather every Wednesday at noon in the Upper Room. This week we are praying for families, healing, and our community outreach.",
          authorId: admin.id,
          createdAt: hoursAgo(26),
        },
        {
          title: "Community outreach volunteers needed",
          content:
            "We are packing food hampers for 120 families on December 13. Sign up at the welcome desk or reach out to the outreach team to serve.",
          authorId: admin.id,
          createdAt: daysAgo(3),
        },
      ],
    });
  }

  if ((await prisma.sermon.count()) === 0) {
    await prisma.sermon.createMany({
      data: [
        {
          title: "The Hope of Christmas",
          youtubeVideoId: "M7lc1UVf-VE",
          datePreached: daysAgo(6),
        },
        {
          title: "Walking in Faith When Life Is Uncertain",
          youtubeVideoId: "aqz-KE-bpKQ",
          datePreached: daysAgo(13),
        },
        {
          title: "A Heart of Gratitude",
          youtubeVideoId: "LXb3EKWsInQ",
          datePreached: daysAgo(20),
        },
        {
          title: "The Power of Together",
          youtubeVideoId: "jNQXAC9IVRw",
          datePreached: daysAgo(27),
        },
        {
          title: "Preparing the Way",
          youtubeVideoId: "ScMzIvxBSi4",
          datePreached: daysAgo(34),
        },
      ],
    });
  }

  if ((await prisma.department.count()) === 0) {
    const choir = await prisma.department.create({
      data: {
        name: "Choir",
        description:
          "Leading the congregation in worship through music and song.",
        members: { connect: { id: admin.id } },
      },
    });

    const youth = await prisma.department.create({
      data: {
        name: "Youth Ministry",
        description:
          "Walking with the next generation through faith, friendship, and fun.",
      },
    });

    await prisma.department.createMany({
      data: [
        {
          name: "Women's Ministry",
          description:
            "Building community, faith, and friendship among the women of the church.",
        },
        {
          name: "Men's Ministry",
          description:
            "Equipping men to grow in faith, leadership, and service.",
        },
        {
          name: "Ushering Ministry",
          description:
            "Welcoming every person and helping services run smoothly.",
        },
      ],
    });

    await prisma.announcement.create({
      data: {
        title: "Choir rehearsal",
        content:
          "Choir rehearsal this Saturday at 4:00 PM in the main sanctuary. Please arrive early to help set up.",
        authorId: admin.id,
        departmentId: choir.id,
        createdAt: hoursAgo(5),
      },
    });

    await prisma.announcement.create({
      data: {
        title: "Youth game night",
        content:
          "Join us this Friday at 6:30 PM for games, food, and a short devotional. Bring a friend!",
        authorId: admin.id,
        departmentId: youth.id,
        createdAt: hoursAgo(9),
      },
    });
  }

  console.log(`Seed complete. Admin: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
