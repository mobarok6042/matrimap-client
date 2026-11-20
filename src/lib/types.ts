export interface Profile {
  _id: string;
  userId: string;
  displayName: string;
  bio: string;
  location: string;
  age?: number;
  images: string[];
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}
