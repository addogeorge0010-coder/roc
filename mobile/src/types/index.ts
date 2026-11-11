export type UserRole = "member" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  avatarUrl?: string;
}

export type PostCategory = "Announcement" | "Event" | "Prayer" | "Ministry";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface AnnouncementComment {
  id: string;
  content: string;
  userId: string;
  announcementId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isMember: boolean;
  _count: {
    members: number;
    announcements: number;
  };
}

export interface Post {
  id: string;
  title: string;
  body: string;
  category: PostCategory;
  author: string;
  authorRole: string;
  publishedAt: string;
  pinned?: boolean;
  likes: number;
  comments: number;
  liked?: boolean;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  series: string;
  description: string;
  date: string;
  duration: string;
  youtubeId: string;
  thumbnailUrl: string;
}

export interface SermonRecord {
  id: string;
  title: string;
  youtubeVideoId: string;
  datePreached: string;
  createdAt: string;
}

export type PaymentMethod = "momo" | "card";

export interface Donation {
  amount: number;
  method: PaymentMethod;
  note?: string;
}
