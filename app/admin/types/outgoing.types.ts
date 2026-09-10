export type DistributionPurpose = string;

export type OutgoingStatus = string;

export interface OutgoingTransaction {
  id: string;
  transaction_number: string;
  date: string;
  item_id: string;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  purpose: DistributionPurpose;
  target_location: string;
  recipient_name: string;
  recipient_nip?: string;
  officer_name: string;
  status: OutgoingStatus;
  document_number?: string;
  notes?: string | null;
  proof_image_url?: string | null;
  created_at?: string;
}

export interface OutgoingFormData {
  transaction_number: string;
  date: string;
  item_id: string;
  item_code: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  purpose: DistributionPurpose;
  target_location: string;
  recipient_name: string;
  recipient_nip?: string;
  officer_name: string;
  status: OutgoingStatus;
  document_number: string;
  notes: string;
  proofImageFile?: File | null;
  proofImageUrl?: string | null;
}
