export interface Promo {
  id: string;
  title: string;
  description: string;
  image_url: string;
  badge: string;
  color_gradient: string;
  is_active: boolean;
  product_id?: string; // Optional link to product
  created_at?: string;
}

export interface PromoFormData {
  title: string;
  description: string;
  badge: string;
  color_gradient: string;
  image_url: string;
  imageFile: File | null;
  product_id?: string;
}

export const INITIAL_PROMO_DATA: PromoFormData = {
  title: "",
  description: "",
  badge: "PROMO",
  color_gradient: "from-amber-400 to-amber-600",
  image_url: "",
  imageFile: null,
  product_id: "", // Initialize as empty string
};

export const COLOR_PRESETS = [
  { label: "Amber Glow", value: "from-amber-400 to-amber-600" },
  { label: "Emerald Fresh", value: "from-emerald-400 to-teal-600" },
  { label: "Rose Sweet", value: "from-rose-400 to-pink-600" },
  { label: "Indigo Night", value: "from-indigo-400 to-purple-600" },
  { label: "Slate Dark", value: "from-stone-600 to-stone-900" },
];
