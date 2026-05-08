export interface Allergen {
  allergenID: string;
  name: string;
}

export interface Food {
  foodID: string;
  userID: string;
  foodName: string;
  description?: string;
  picture?: string;
  isEdible: boolean;
  price: number;
  stockQuantity: number;
  expirationDate?: string;
  createdAt: string;
  category: string;
  allergens: Allergen[];
  isSafeForCurrentUser?: boolean;
  matchedAllergenIDs: string[];
}
