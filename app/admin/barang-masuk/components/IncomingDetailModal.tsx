"use client";

import React from "react";
import Image from "next/image";
import {
  Boxes,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  Printer,
  Truck,
  ArrowDownToLine,
  CheckCircle2,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { IncomingTransaction } from "../../types/incoming.types";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "../../hooks/useSettings";

interface IncomingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: IncomingTransaction | null;
}

export const IncomingDetailModal: React.FC<IncomingDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { profile } = useAuth();
  const { settings } = useSettings();

  if (!transaction) return null;

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    // Create temporary hidden iframe for printing
    const existingIframe = document.getElementById("print-bast-masuk-sandbox");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.id = "print-bast-masuk-sandbox";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Collect all stylesheets from current document
    const headElements = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((el) => el.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title></title>
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
            .bast-container {
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
              margin: 14px 0;
            }
            th, td {
              border: 1px solid #d6d3d1;
              padding: 8px 12px;
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
          <div class="bast-container">
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
              <h1 style="margin: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: underline;">
                BERITA ACARA SERAH TERIMA BARANG (BAST)
              </h1>
              <p style="margin: 3px 0 0 0; font-size: 11px; font-family: monospace; font-weight: 700; color: #1c1917;">
                Nomor: ${transaction.document_number || transaction.transaction_number}
              </p>
            </div>

            <p style="font-size: 11px; line-height: 1.6; color: #292524; margin-bottom: 12px;">
              Pada hari ini, tanggal <strong>${transaction.date}</strong>, bertempat di lingkungan kantor <strong>${settings.sub_name || "Inspektorat Daerah"}</strong>, telah dilaksanakan serah terima penerimaan barang pengadaan inventaris dengan rincian data sebagai berikut:
            </p>

            <!-- 3. TABEL DATA BARANG MASUK -->
            <table>
              <tbody>
                <tr>
                  <th>No. Transaksi Sistem</th>
                  <td style="font-family: monospace; font-weight: 700; color: #b45309;">${transaction.transaction_number}</td>
                </tr>
                <tr>
                  <th>No. BAST / SPK / Faktur</th>
                  <td style="font-weight: 700;">${transaction.document_number || "-"}</td>
                </tr>
                <tr>
                  <th>Nama Barang / Aset</th>
                  <td style="font-weight: 800; font-size: 12px; color: #1c1917;">${transaction.item_name}</td>
                </tr>
                <tr>
                  <th>Kode Barang & Kategori</th>
                  <td><span style="font-family: monospace; font-weight: 700;">${transaction.item_code}</span> (${transaction.category || "-"})</td>
                </tr>
                <tr>
                  <th>Jumlah Barang Diterima</th>
                  <td style="font-weight: 800; font-size: 12px; color: #15803d;">+${transaction.quantity} ${transaction.unit}</td>
                </tr>
                <tr>
                  <th>Sumber Pengadaan</th>
                  <td style="font-weight: 600;">${transaction.source || "-"}</td>
                </tr>
                <tr>
                  <th>Penyedia / Rekanan</th>
                  <td style="font-weight: 700;">${transaction.supplier || "-"}</td>
                </tr>
                <tr>
                  <th>Ruangan / Lokasi Tujuan</th>
                  <td>${transaction.target_location || "-"}</td>
                </tr>
                <tr>
                  <th>Harga Satuan / Per Unit</th>
                  <td>${transaction.unit_price ? `Rp ${transaction.unit_price.toLocaleString("id-ID")}` : "-"}</td>
                </tr>
                <tr>
                  <th>Total Nilai Pengadaan</th>
                  <td style="font-weight: 800; color: #b45309;">${transaction.total_price ? `Rp ${transaction.total_price.toLocaleString("id-ID")}` : "-"}</td>
                </tr>
                <tr>
                  <th>Catatan / Keterangan</th>
                  <td>${transaction.notes || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p style="font-size: 10px; line-height: 1.5; color: #57534e; margin-top: 10px; margin-bottom: 20px;">
              Demikian Berita Acara Serah Terima Barang ini dibuat dengan sebenarnya dalam keadaan baik dan cukup untuk dipergunakan sebagaimana mestinya.
            </p>

            <!-- 4. TANDA TANGAN 3 PIHAK -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; font-size: 11px; margin-bottom: 24px;">
              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100px;">
                <div>
                  <p style="margin: 0; color: #78716c;">Pihak Pertama (Penyedia / Rekanan)</p>
                  <p style="margin: 2px 0 0 0; font-weight: 700; color: #1c1917;">Yang Menyerahkan,</p>
                </div>
                <div>
                  <p style="margin: 0; font-weight: 800; color: #1c1917; text-decoration: underline;">
                    ${transaction.supplier || "Pihak Rekanan / Penyedia"}
                  </p>
                  <p style="margin: 2px 0 0 0; color: #57534e;">Cap & Tanda Tangan</p>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100px;">
                <div>
                  <p style="margin: 0; color: #78716c;">Pihak Kedua (Pengurus Barang)</p>
                  <p style="margin: 2px 0 0 0; font-weight: 700; color: #1c1917;">Yang Menerima,</p>
                </div>
                <div>
                  <p style="margin: 0; font-weight: 800; color: #1c1917; text-decoration: underline;">
                    ${transaction.received_by || profile?.full_name || "-"}
                  </p>
                  <p style="margin: 2px 0 0 0; color: #57534e;">
                    ${profile?.nip ? `NIP. ${profile.nip}` : "Pengurus Barang Pengguna"}
                  </p>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 10px; font-size: 11px;">
              <div style="display: inline-block; width: 280px;">
                <p style="margin: 0; color: #78716c;">Mengetahui,</p>
                <p style="margin: 2px 0 0 0; font-weight: 700; color: #1c1917;">
                  ${settings.head_position || "Pejabat Penatausahaan Pengguna Barang"}
                </p>
                <div style="height: 60px;"></div>
                <p style="margin: 0; font-weight: 800; color: #1c1917; text-decoration: underline;">
                  ${settings.head_officer || "-"}
                </p>
                <p style="margin: 2px 0 0 0; color: #57534e;">
                  ${settings.head_nip ? `NIP. ${settings.head_nip}` : "NIP. -"}
                </p>
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
      title="Bukti Penerimaan Barang (BAST)"
      description={`No. Transaksi: ${transaction.transaction_number}`}
    >
      <div className="space-y-4 pt-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-200/80 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownToLine size={28} />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
                {transaction.transaction_number}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 size={11} /> Diterima & Terverifikasi
              </span>
            </div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">
              {transaction.item_name}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Kode: <span className="font-mono text-amber-600 dark:text-amber-400">{transaction.item_code}</span> · {transaction.category}
            </p>
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Tanggal & No Dokumen */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <Calendar size={13} className="text-amber-500" />
              Tanggal Penerimaan
            </div>
            <p className="font-semibold text-stone-900 dark:text-white">{transaction.date}</p>
            {transaction.document_number && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400">No BAST: {transaction.document_number}</p>
            )}
          </div>

          {/* Kuantitas & Total Nilai */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <Boxes size={13} className="text-amber-500" />
              Jumlah Masuk
            </div>
            <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
              +{transaction.quantity} {transaction.unit}
            </p>
            {transaction.total_price > 0 && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Total: Rp {transaction.total_price.toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* Sumber & Penyedia */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <Truck size={13} className="text-amber-500" />
              Sumber Pengadaan & Rekanan
            </div>
            <p className="font-semibold text-stone-900 dark:text-white">{transaction.source}</p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">{transaction.supplier}</p>
          </div>

          {/* Ruangan & Pegawai Penerima */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <Building2 size={13} className="text-amber-500" />
              Tujuan & Penerima (PJ)
            </div>
            <p className="font-semibold text-stone-900 dark:text-white">{transaction.target_location}</p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">PJ: {transaction.received_by}</p>
          </div>
        </div>

        {/* Catatan */}
        {transaction.notes && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 text-xs space-y-1">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Catatan Pengadaan</p>
            <p className="text-stone-700 dark:text-stone-300">{transaction.notes}</p>
          </div>
        )}

        {/* Bukti Lampiran Foto (if any) */}
        {transaction.proof_image_url && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-2">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Lampiran Foto Bukti Serah Terima
            </p>
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-stone-200 dark:border-white/10 bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
              <Image
                src={transaction.proof_image_url}
                alt="Bukti BAST Masuk"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="no-print flex items-center justify-between pt-3 border-t border-stone-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Printer size={15} />
            <span>Cetak Berita Acara (BAST)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
