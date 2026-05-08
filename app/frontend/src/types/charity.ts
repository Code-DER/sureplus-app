export interface Charity {
  userID: string;
  organizationName: string;
}

export interface CharityProfile extends Charity {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  role: string;
  street?: string;
  barangay?: string;
  city?: string;
  residentialName?: string;
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

export interface CharityApplication {
  applicationID: string;
  userID: string;
  purpose: string;
  govID: string;
  status: "pending" | "approved" | "rejected";
}
