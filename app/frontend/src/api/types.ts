/**
 * Shared API Types for Charity, CharityPost, and SocialImpact
 */

export interface UserProfile {
  userID: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: 'buyer' | 'seller' | 'charity' | 'admin';
  phoneNumber?: string;
  street?: string;
  residentialName?: string;
  barangay?: string;
  city?: string;
}

export interface CharityProfile extends UserProfile {
  organizationName: string;
}

export interface CharityResponse {
  userID: string;
  organizationName: string;
}

export interface CharityPost {
  charityID: string;
  userID: string;
  title: string;
  description?: string;
  currentAmount: number;
  amountNeeded: number;
  createdAt: string;
}

export interface SocialImpactRecord {
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

export interface CharityApplication {
  applicationID: string;
  userID: string;
  purpose: string;
  govID: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CharityApplicationResponse extends CharityApplication {}
