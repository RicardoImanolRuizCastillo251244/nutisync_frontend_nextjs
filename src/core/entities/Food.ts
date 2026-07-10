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
}
