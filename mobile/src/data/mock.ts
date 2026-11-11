import type { Post, Sermon } from "@/types";

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const daysAgo = (days: number) => hoursAgo(days * 24);

const youtubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export const mockPosts: Post[] = [
  {
    id: "post-christmas-carols",
    title: "Christmas Carol Night is here",
    body: "Join the whole church family on December 20 at 6:00 PM for an evening of carols, scripture, and candlelight. Bring a friend and come expectant.",
    category: "Event",
    author: "Rev. Daniel Osei",
    authorRole: "Senior Pastor",
    publishedAt: hoursAgo(2),
    pinned: true,
    likes: 128,
    comments: 24,
  },
  {
    id: "post-advent",
    title: "Advent devotionals now available",
    body: "Our 2026 Advent devotional is available at the welcome desk and as a digital download. Let's prepare our hearts together over the next four weeks.",
    category: "Announcement",
    author: "Pastor Grace Adjei",
    authorRole: "Discipleship",
    publishedAt: hoursAgo(7),
    likes: 86,
    comments: 11,
  },
  {
    id: "post-prayer",
    title: "Midweek prayer & fasting",
    body: "We gather every Wednesday at noon in the Upper Room. This week we are praying for families, healing, and our community outreach.",
    category: "Prayer",
    author: "Elder Kwesi Mensah",
    authorRole: "Prayer Ministry",
    publishedAt: hoursAgo(26),
    likes: 64,
    comments: 8,
  },
  {
    id: "post-youth",
    title: "Youth Bible study: the book of James",
    body: "High school and university students, join us Friday at 6:30 PM as we dig into James and what it means to live out our faith in everyday life.",
    category: "Ministry",
    author: "Ama Boateng",
    authorRole: "Youth Leader",
    publishedAt: daysAgo(2),
    likes: 52,
    comments: 15,
  },
  {
    id: "post-outreach",
    title: "Community outreach volunteers needed",
    body: "We are packing food hampers for 120 families on December 13. Sign up at the welcome desk or reach out to the outreach team to serve.",
    category: "Announcement",
    author: "Rev. Daniel Osei",
    authorRole: "Senior Pastor",
    publishedAt: daysAgo(3),
    likes: 95,
    comments: 31,
  },
  {
    id: "post-welcome",
    title: "New members welcome lunch",
    body: "If you have recently made Royal Palace Chapel your home, join us after service this Sunday for lunch and a short introduction to the life of the church.",
    category: "Event",
    author: "Pastor Grace Adjei",
    authorRole: "Discipleship",
    publishedAt: daysAgo(5),
    likes: 41,
    comments: 6,
  },
];

const sermonSeeds = [
  {
    id: "sermon-hope-of-christmas",
    title: "The Hope of Christmas",
    speaker: "Rev. Daniel Osei",
    series: "Advent 2026",
    description:
      "In a world that is constantly changing, the hope of Christmas anchors us. Rev. Daniel walks through Isaiah 9 and the promise of a light that breaks into our darkness.",
    date: daysAgo(6),
    duration: "38 min",
    youtubeId: "M7lc1UVf-VE",
  },
  {
    id: "sermon-walking-in-faith",
    title: "Walking in Faith When Life Is Uncertain",
    speaker: "Pastor Grace Adjei",
    series: "Faith in the Everyday",
    description:
      "What does it look like to trust God when the next step is not clear? A practical message from Hebrews 11 on faith, patience, and faithful obedience.",
    date: daysAgo(13),
    duration: "42 min",
    youtubeId: "aqz-KE-bpKQ",
  },
  {
    id: "sermon-heart-of-gratitude",
    title: "A Heart of Gratitude",
    speaker: "Rev. Daniel Osei",
    series: "Faith in the Everyday",
    description:
      "Gratitude is more than a feeling. It is a discipline that reshapes how we see God, our circumstances, and the people around us.",
    date: daysAgo(20),
    duration: "35 min",
    youtubeId: "LXb3EKWsInQ",
  },
  {
    id: "sermon-power-of-together",
    title: "The Power of Together",
    speaker: "Elder Kwesi Mensah",
    series: "One Body",
    description:
      "God never intended for us to walk the journey alone. This message explores the beauty and strength of a church family that serves together.",
    date: daysAgo(27),
    duration: "31 min",
    youtubeId: "jNQXAC9IVRw",
  },
  {
    id: "sermon-preparing-the-way",
    title: "Preparing the Way",
    speaker: "Pastor Grace Adjei",
    series: "Advent 2026",
    description:
      "As we prepare for Christmas, we are invited to make room for Jesus. A reflective message on repentance, anticipation, and joyful preparation.",
    date: daysAgo(34),
    duration: "36 min",
    youtubeId: "ScMzIvxBSi4",
  },
];

export const mockSermons: Sermon[] = sermonSeeds.map((sermon) => ({
  ...sermon,
  thumbnailUrl: youtubeThumbnail(sermon.youtubeId),
}));

export const quickGivingAmounts = [50, 100, 200, 500];

export const adminTools = [
  {
    id: "admin-announcements",
    title: "Post an announcement",
    description: "Share updates with the church feed",
    icon: "megaphone-outline" as const,
  },
  {
    id: "admin-moderation",
    title: "Moderate the feed",
    description: "Review flagged posts and comments",
    icon: "shield-checkmark-outline" as const,
  },
  {
    id: "admin-members",
    title: "Member directory",
    description: "View and manage member profiles",
    icon: "people-outline" as const,
  },
  {
    id: "admin-giving",
    title: "Giving reports",
    description: "Track tithes and offerings",
    icon: "stats-chart-outline" as const,
  },
];
