export type ProcurementSource = string;

export interface IncomingTransaction {
  id: string;
  transaction_number: string;
  date: string;
  item_id?: string;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  price_per_unit?: number;
  total_price: number;
  source: ProcurementSource;
  supplier: string;
  target_location: string;
  received_by: string;
  document_number?: string;
  notes?: string | null;
  proof_image_url?: string | null;
  created_at?: string;
}

export interface IncomingFormData {
  transaction_number: string;
  date: string;
  item_id?: string;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  price_per_unit?: number;
  source: ProcurementSource;
  supplier: string;
  target_location: string;
  received_by: string;
  document_number: string;
  notes: string;
  proofImageFile?: File | null;
  proofImageUrl?: string | null;
}
