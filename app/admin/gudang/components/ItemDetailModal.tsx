"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Boxes,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  Printer,
  Edit,
  Tag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Truck,
  FileSpreadsheet,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { InventoryItem } from "../../types/item.types";
import { IncomingTransaction } from "../../types/incoming.types";
import { OutgoingTransaction } from "../../types/outgoing.types";
import { getConditionBadge } from "./ItemCard";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "../../hooks/useSettings";
import { calculateItemAsset } from "@/lib/asset-utils";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onEdit: (item: InventoryItem) => void;
  incoming?: IncomingTransaction[];
  outgoing?: OutgoingTransaction[];
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  incoming = [],
  outgoing = [],
}) => {
  const { profile } = useAuth();
  const { settings } = useSettings();
  const [showBatchDetails, setShowBatchDetails] = useState(true);

  if (!item) return null;

  const calc = calculateItemAsset(item, incoming, outgoing);

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    const existingIframe = document.getElementById("print-kib-sandbox");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.id = "print-kib-sandbox";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const headElements = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((el) => el.outerHTML)
      .join("\n");

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const verificationUrl = `${baseUrl}/scan/${encodeURIComponent(item.code)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
      verificationUrl
    )}`;

    const batchRowsHtml = calc.batches
      .map(
        (b, idx) => `
        <tr>
          <td style="text-align: center; font-size: 10px;">${idx + 1}</td>
          <td style="font-size: 10px;"><strong>${b.title}</strong>${b.supplier ? `<br/><span style="color:#78716c;">${b.supplier}</span>` : ""}</td>
          <td style="text-align: center; font-size: 10px;">${b.date}</td>
          <td style="text-align: center; font-size: 10px;">${b.quantity} ${b.unit}</td>
          <td style="text-align: right; font-size: 10px;">Rp ${b.unitPrice.toLocaleString("id-ID")}</td>
          <td style="text-align: right; font-weight: 700; font-size: 10px;">Rp ${b.totalPrice.toLocaleString("id-ID")}</td>
        </tr>
      `
      )
      .join("");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>KIB - ${item.name} (${item.code})</title>
          ${headElements}
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @page {
              size: auto;
              margin: 0mm !important;
            }
            html, body {
              background: #ffffff !important;
              color: #1c1917 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            }
            .kib-container {
              background: #ffffff !important;
              color: #1c1917 !important;
              padding: 15mm 20mm !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            th, td {
              border: 1px solid #d6d3d1;
              padding: 7px 10px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #f5f5f4;
              font-weight: 700;
              width: 28%;
            }
          </style>
        </head>
        <body>
          <div class="kib-container">
            <!-- 1. KOP SURAT RESMI -->
            <div style="display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #1c1917; padding-bottom: 12px; margin-bottom: 16px;">
              <img src="/logo.png" alt="Logo" style="width: 56px; height: 56px; object-fit: contain;" />
              <div>
                <h3 style="margin: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1c1917;">
                  ${settings.institution_name || "Pemerintah Provinsi Sumatera Utara"}
                </h3>
                <h2 style="margin: 2px 0 0 0; font-size: 15px; font-weight: 900; text-transform: uppercase; color: #1c1917;">
                  ${settings.sub_name || "Inspektorat Daerah Provinsi Sumatera Utara"}
                </h2>
                <p style="margin: 2px 0 0 0; font-size: 10px; color: #57534e;">
                  ${settings.address || "Jalan Jenderal A. Yani No. 40, Medan"} | Telp: ${settings.phone || "(061) 453-2940"} | Email: ${settings.email || "inspektorat@sumutprov.go.id"}
                </p>
              </div>
            </div>

            <!-- 2. JUDUL DOKUMEN -->
            <div style="text-align: center; margin-bottom: 16px;">
              <h1 style="margin: 0; font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline;">
                KARTU INVENTARIS BARANG (KIB)
              </h1>
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #78716c; font-weight: 600;">
                Nomor Registrasi Aset: <span style="font-family: monospace; font-weight: 800; color: #1c1917;">${item.code}</span>
              </p>
            </div>

            <!-- 3. IDENTITAS & QR CODE HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fafaf9; border: 1px solid #e7e5e4; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              <div>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #b45309;">${item.category}</span>
                <h2 style="margin: 2px 0 0 0; font-size: 16px; font-weight: 900; color: #1c1917;">${item.name}</h2>
                <p style="margin: 3px 0 0 0; font-size: 11px; color: #57534e;">
                  Kondisi Fisik: <strong>${item.condition}</strong> | Total Aset: <strong>${calc.totalUnits} ${item.unit}</strong> (${calc.warehouseUnits} di Gudang · ${calc.distributedUnits} Terdistribusi)
                </p>
              </div>
              <div style="text-align: center;">
                <img src="${qrUrl}" alt="QR Verification" style="width: 70px; height: 70px; border: 1px solid #d6d3d1; padding: 2px; background: white;" />
                <div style="font-size: 8px; font-weight: 700; color: #78716c; margin-top: 2px;">SCAN UNTUK VERIFIKASI</div>
              </div>
            </div>

            <!-- 4. TABEL SPESIFIKASI BUKU INDUK -->
            <table>
              <tbody>
                <tr>
                  <th>Kode Registrasi Barang</th>
                  <td style="font-family: monospace; font-weight: 800; color: #1c1917;">${item.code}</td>
                </tr>
                <tr>
                  <th>Nama Barang / Merk / Tipe</th>
                  <td style="font-weight: 700;">${item.name}</td>
                </tr>
                <tr>
                  <th>Kategori Klasifikasi</th>
                  <td>${item.category}</td>
                </tr>
                <tr>
                  <th>Lokasi / Ruangan Penempatan</th>
                  <td style="font-weight: 600;">${item.location || "-"}</td>
                </tr>
                <tr>
                  <th>Penanggung Jawab Ruangan (PJ)</th>
                  <td>${item.person_in_charge || "-"}</td>
                </tr>
                <tr>
                  <th>Tanggal Perolehan Awal</th>
                  <td>${item.received_at || "-"}</td>
                </tr>
                <tr>
                  <th>Total Nilai Realisasi Perolehan</th>
                  <td style="font-weight: 900; color: #b45309; font-size: 12px;">
                    Rp ${calc.totalRealValue.toLocaleString("id-ID")}
                  </td>
                </tr>
                <tr>
                  <th>Keterangan / Nomor Seri</th>
                  <td>${item.notes || "-"}</td>
                </tr>
              </tbody>
            </table>

            <!-- 5. RINCIAN BATCH PENGADAAN (JIKA MULTI-BATCH) -->
            ${
              calc.batches.length > 0
                ? `
              <div style="margin-top: 14px;">
                <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #1c1917;">
                  Rincian Riwayat Batch Pengadaan & Harga Satuan:
                </h4>
                <table>
                  <thead>
                    <tr style="background-color: #f5f5f4;">
                      <th style="width: 30px; text-align: center; font-size: 10px;">No</th>
                      <th style="font-size: 10px;">Sumber / Batch</th>
                      <th style="text-align: center; font-size: 10px; width: 85px;">Tanggal</th>
                      <th style="text-align: center; font-size: 10px; width: 70px;">Jumlah</th>
                      <th style="text-align: right; font-size: 10px; width: 100px;">Harga Satuan</th>
                      <th style="text-align: right; font-size: 10px; width: 110px;">Subtotal Realisasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${batchRowsHtml}
                    <tr style="background-color: #fffbeb; font-weight: 800;">
                      <td colspan="3" style="text-align: right; font-size: 10px;">TOTAL NILAI REALISASI KESELURUHAN:</td>
                      <td style="text-align: center; font-size: 10px;">${calc.totalUnits} ${item.unit}</td>
                      <td></td>
                      <td style="text-align: right; font-size: 11px; color: #b45309;">Rp ${calc.totalRealValue.toLocaleString("id-ID")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `
                : ""
            }

            <!-- 6. TANDA TANGAN PEJABAT -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 20px; text-align: center; font-size: 11px;">
              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100px;">
                <div>
                  <p style="margin: 0; color: #78716c;">Mengetahui,</p>
                  <p style="margin: 2px 0 0 0; font-weight: 700; color: #1c1917;">
                    ${settings.head_position || "Pejabat Penatausahaan Pengguna Barang"}
                  </p>
                </div>
                <div>
                  <p style="margin: 0; font-weight: 800; color: #1c1917; text-decoration: underline;">
                    ${settings.head_officer || "-"}
                  </p>
                  <p style="margin: 2px 0 0 0; color: #57534e;">
                    ${settings.head_nip ? `NIP. ${settings.head_nip}` : "NIP. -"}
                  </p>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100px;">
                <div>
                  <p style="margin: 0; color: #78716c;">Medan, ${todayStr}</p>
                  <p style="margin: 2px 0 0 0; font-weight: 700; color: #1c1917;">Pengurus Barang Pengguna</p>
                </div>
                <div>
                  <p style="margin: 0; font-weight: 800; color: #1c1917; text-decoration: underline;">
                    ${profile?.full_name || "-"}
                  </p>
                  <p style="margin: 2px 0 0 0; color: #57534e;">
                    ${profile?.nip ? `NIP. ${profile.nip}` : "NIP. -"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.frameElement && window.frameElement.remove();
                }, 1000);
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kartu Identitas Barang / Aset"
      description={`Kode Aset: ${item.code}`}
      maxWidth="3xl"
    >
      <div className="space-y-4 pt-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-xs">
          {/* Photo or Visual Icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 relative overflow-hidden shrink-0 flex items-center justify-center">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <Boxes size={36} className="text-amber-600 dark:text-amber-500/70" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
                {item.code}
              </span>
              {getConditionBadge(item.condition)}
              {calc.hasMultipleBatches && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1">
                  <Layers size={12} />
                  {calc.batches.length} Batch Pengadaan
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white tracking-tight">
              {item.name}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Kategori: <span className="text-stone-800 dark:text-stone-200 font-semibold">{item.category}</span>
            </p>
          </div>
        </div>

        {/* Spec Grid Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Lokasi Ruangan */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <Building2 size={13} className="text-amber-600 dark:text-amber-500" />
              Lokasi Penyimpanan
            </div>
            <p className="font-semibold text-stone-900 dark:text-white text-xs truncate">{item.location}</p>
          </div>

          {/* Penanggung Jawab */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <User size={13} className="text-amber-600 dark:text-amber-500" />
              Penanggung Jawab
            </div>
            <p className="font-semibold text-stone-900 dark:text-white text-xs truncate">{item.person_in_charge}</p>
          </div>

          {/* Jumlah Stok & Satuan */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <Boxes size={13} className="text-amber-600 dark:text-amber-500" />
              Ketersediaan Fisik
            </div>
            <p className="font-black text-stone-900 dark:text-white text-xs">
              {calc.warehouseUnits} <span className="font-normal text-stone-500">di gudang</span>
              {calc.distributedUnits > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px] block">
                  +{calc.distributedUnits} terdistribusi
                </span>
              )}
            </p>
          </div>

          {/* Total Nilai Riil */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px]">
              <DollarSign size={13} className="text-amber-600 dark:text-amber-500" />
              Total Nilai Riil Aset
            </div>
            <p className="font-black text-amber-800 dark:text-amber-300 text-sm">
              Rp {calc.totalRealValue.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* ================= RINCIAN RIWAYAT BATCH PENGADAAN & HARGA ================= */}
        {calc.batches.length > 0 && (
          <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-950/40 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowBatchDetails((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Layers size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                    Rincian Riwayat Batch Pengadaan & Nilai Perolehan
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Tersedia {calc.batches.length} catatan pengadaan dengan total nilai Rp {calc.totalRealValue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="text-stone-400">
                {showBatchDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showBatchDetails && (
              <div className="p-3.5 pt-0 border-t border-stone-200/60 dark:border-white/5 space-y-2">
                <div className="space-y-2 pt-2">
                  {calc.batches.map((batch, idx) => (
                    <div
                      key={batch.id || idx}
                      className="p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900 dark:text-white">
                            {batch.title}
                          </span>
                          {batch.sourceType === "initial" ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                              Master Awal
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              Barang Masuk
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 flex-wrap">
                          <span>Tgl: {batch.date}</span>
                          {batch.supplier && <span>· Penyedia: {batch.supplier}</span>}
                          {batch.documentNumber && <span>· BAST: {batch.documentNumber}</span>}
                        </p>
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-white/5">
                        <div className="text-[11px] text-stone-600 dark:text-stone-400">
                          <strong className="text-stone-900 dark:text-white">{batch.quantity} {batch.unit}</strong> @ Rp {batch.unitPrice.toLocaleString("id-ID")}
                        </div>
                        <div className="font-black text-amber-700 dark:text-amber-400 text-xs">
                          Rp {batch.totalPrice.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catatan / Keterangan */}
        {item.notes && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <FileText size={13} className="text-amber-600 dark:text-amber-500" />
              Catatan / Riwayat / No. Seri
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs">{item.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="no-print flex items-center justify-between pt-3 border-t border-stone-200 dark:border-white/10">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Printer size={15} />
            <span>Cetak Kartu Aset (KIB)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold uppercase tracking-wider transition-all border border-stone-300 dark:border-white/5 cursor-pointer shadow-xs active:scale-95"
            >
              <Edit size={14} />
              <span>Edit Data</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
