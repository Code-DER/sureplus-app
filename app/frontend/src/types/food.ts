export interface FoodAllergen {
  allergenID: string;
  name: string;
}

export interface FoodItem {
  foodID: string;
  userID: string;
  foodName: string;
  description: string | null;
  picture: string | null;
  isEdible: boolean;
  price: number;
  stockQuantity: number;
  expirationDate: string | null;
  createdAt: string | null;
  allergens: FoodAllergen[];
  isSafeForCurrentUser: boolean | null;
  matchedAllergenIDs: string[];
}
