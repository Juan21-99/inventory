export type ItemCondition = "Baik" | "Rusak Ringan" | "Rusak Berat";

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  condition: ItemCondition;
  location: string;
  person_in_charge: string;
  received_at: string;
  price?: number;
  image_url?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface LocationRoom {
  id: string;
  name: string;
  floor?: string;
}

export interface ItemFormData {
  code: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  condition: ItemCondition;
  location: string;
  person_in_charge: string;
  received_at: string;
  price: number;
  notes: string;
  imageFile?: File | null;
  imageUrl?: string | null;
}
