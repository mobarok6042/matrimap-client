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

export interface Service {
  _id: string;
  title: string;
  category: string;
  price: number;
  pricingUnit?: string;
  description: string;
  location: string;
  image?: string;
  images?: string[];
  phone?: string;
  email?: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  rating?: number;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}
