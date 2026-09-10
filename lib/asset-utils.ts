import { InventoryItem } from "@/app/admin/types/item.types";
import { IncomingTransaction } from "@/app/admin/types/incoming.types";
import { OutgoingTransaction } from "@/app/admin/types/outgoing.types";

export interface ItemBatch {
  id: string;
  sourceType: "initial" | "incoming";
  title: string;
  subtitle?: string;
  date: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  documentNumber?: string | null;
  supplier?: string | null;
  transactionNumber?: string;
}

export interface ItemAssetCalculation {
  totalUnits: number;
  warehouseUnits: number;
  distributedUnits: number;
  totalRealValue: number;
  batches: ItemBatch[];
  hasMultipleBatches: boolean;
}

/**
 * Menghitung rincian batch harga dan akumulasi nilai aset riil per barang
 * berdasarkan saldo awal dan riwayat transaksi Barang Masuk.
 */
export function calculateItemAsset(
  item: InventoryItem,
  incoming: IncomingTransaction[],
  outgoing: OutgoingTransaction[]
): ItemAssetCalculation {
  // 1. Hitung unit terdistribusi
  const distributedUnits = outgoing
    .filter((tx) => tx.item_id === item.id || tx.item_code === item.code)
    .reduce((sum, tx) => sum + (tx.quantity || 0), 0);

  const warehouseUnits = item.stock || 0;
  const totalUnits = warehouseUnits + distributedUnits;

  // 2. Filter transaksi masuk untuk barang ini
  const itemIncoming = incoming
    .filter((tx) => tx.item_id === item.id || tx.item_code === item.code)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const sumIncomingUnits = itemIncoming.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
  const sumIncomingValue = itemIncoming.reduce((sum, tx) => {
    const p = Number(tx.price_per_unit) || 0;
    const q = Number(tx.quantity) || 0;
    const total = Number(tx.total_price) || (p * q);
    return sum + total;
  }, 0);

  // 3. Hitung unit saldo awal (unit yang terdaftar sebelum/di luar transaksi masuk)
  const initialUnits = Math.max(0, totalUnits - sumIncomingUnits);
  const initialPrice = Number(item.price) || 0;
  const initialValue = initialUnits * initialPrice;

  // 4. Bangun daftar batch
  const batches: ItemBatch[] = [];

  if (initialUnits > 0 && initialPrice > 0) {
    batches.push({
      id: "initial",
      sourceType: "initial",
      title: "Saldo Awal / Master Aset",
      subtitle: "Harga perolehan awal tercatat",
      date: item.received_at || "-",
      quantity: initialUnits,
      unit: item.unit || "Unit",
      unitPrice: initialPrice,
      totalPrice: initialValue,
    });
  }

  for (const tx of itemIncoming) {
    const unitPrice = Number(tx.price_per_unit) || 0;
    const qty = Number(tx.quantity) || 0;
    const totalPrice = Number(tx.total_price) || (unitPrice * qty);

    batches.push({
      id: tx.id,
      sourceType: "incoming",
      title: `Pengadaan ${tx.source || "APBD"}`,
      subtitle: tx.supplier ? `Penyedia: ${tx.supplier}` : undefined,
      date: tx.date,
      quantity: qty,
      unit: tx.unit || item.unit || "Unit",
      unitPrice,
      totalPrice,
      documentNumber: tx.document_number,
      supplier: tx.supplier,
      transactionNumber: tx.transaction_number,
    });
  }

  // 5. Total Nilai Riil Aset
  let totalRealValue = 0;
  if (batches.length > 0) {
    totalRealValue = batches.reduce((sum, b) => sum + b.totalPrice, 0);
  } else {
    totalRealValue = initialPrice * totalUnits;
  }

  return {
    totalUnits,
    warehouseUnits,
    distributedUnits,
    totalRealValue,
    batches,
    hasMultipleBatches: batches.length > 1,
  };
}

/**
 * Menghitung Total Nilai Riil Seluruh Aset di Sistem (untuk Dashboard & Laporan)
 */
export function calculateTotalSystemRealValue(
  items: InventoryItem[],
  incoming: IncomingTransaction[],
  outgoing: OutgoingTransaction[]
): number {
  return items.reduce((sum, item) => {
    const calc = calculateItemAsset(item, incoming, outgoing);
    return sum + calc.totalRealValue;
  }, 0);
}
