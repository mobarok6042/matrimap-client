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
  approvalStatus?: "pending" | "approved" | "declined";
  rating?: number;
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  _id: string;
  vendorId: string;
  plan: "basic" | "max";
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId: string | null;
  status: "pending" | "paid" | "failed" | "expired";
  createdAt: string;
}
