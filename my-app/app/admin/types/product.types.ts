export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  category: string;
  image_url: string;
  is_active: boolean;
  stock: number;
  description?: string;
  category_id?: string;
  created_at?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  category_id: string;
  imageUrl: string;
  imageFile: File | null;
  stock: string;
}

export const INITIAL_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "",
  category_id: "",
  imageUrl: "",
  imageFile: null,
  stock: "",
};

export const CATEGORIES = [
  { id: "all", label: "Semua", icon: "Store" },
  { id: "coffee", label: "Coffee", icon: "Coffee" },
  { id: "non-coffee", label: "Non-Coffee", icon: "CupSoda" },
  { id: "food", label: "Makanan", icon: "UtensilsCrossed" },
] as const;
