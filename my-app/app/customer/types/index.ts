// Unified Supabase Types
export interface SupabaseTimestamp {
  seconds: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  is_active: boolean;
  stock: number;
  original_price?: number;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  note?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  order_type: string;
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  payment_method?: string;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  color: string;
  product_id?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string; // Optional icon name if we want to store it later
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  detail: string;
  is_default: boolean;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: "customer" | "admin";
  avatar_url: string | null;
}
