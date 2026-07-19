export interface Food {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  healthLabels?: string[];
  dietLabels?: string[];
  type?: string | null;
  ingredients?: Array<{ ingredientId?: number; name: string; quantity: number; unit: string; calories?: number; protein?: number; carbs?: number; fat?: number }> | null;
  description?: string | null;
}
