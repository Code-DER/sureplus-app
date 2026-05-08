import type { Food } from './product';

export interface PurchaseItem {
  purchaseID: string;
  foodID: string;
  quantity: number;
  totalPerItem: number;
  Food?: Food;
}

export interface Purchase {
  purchaseID: string;
  userID: string;
  purchaseDate: string;
  paymentMethod?: string;
  totalPrice: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  PurchaseItems?: PurchaseItem[];
}

export interface Rating {
  ratingID: string;
  purchaseID: string;
  buyerID: string;
  sellerID: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SocialImpact {
  impactID: string;
  purchaseID: string;
  carbonOffset: number;
  rescuedKilos: number;
  peopleFed: number;
}

export interface SocialImpactSummary {
  totalCarbonOffset: number;
  totalRescuedKilos: number;
  totalPeopleFed: number;
  purchaseCount: number;
}
