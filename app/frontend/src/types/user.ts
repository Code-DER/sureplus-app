export interface User {
  userID: string;
  email: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'charity' | 'admin';
  phoneNumber?: string;
  deliveryAddress?: string;
}
