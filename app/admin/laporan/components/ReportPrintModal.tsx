"use client";

import React from "react";
import Image from "next/image";
import { Printer, X, Download, ShieldCheck, Building2, Calendar, FileText } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "../../hooks/useSettings";

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  reportTitle: string;
  startDate: string;
  endDate: string;
  data: any[];
  summaryStats: {
    totalItems: number;
    totalUnits: number;
    totalValue: number;
    goodConditionRatio: number;
  };
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  isOpen,
  onClose,
  reportType,
  reportTitle,
  startDate,
  endDate,
  data,
  summaryStats,
}) => {
  const { profile } = useAuth();
  const { settings } = useSettings();

  const handlePrint = () => {
    const reportElement = document.getElementById("printable-report");
    if (!reportElement) return;

    // Create a temporary hidden iframe for printing
    const existingIframe = document.getElementById("print-iframe-sandbox");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.id = "print-iframe-sandbox";
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
            #printable-report {
              background: #ffffff !important;
              color: #1c1917 !important;
              padding: 15mm 20mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              border: none !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
          </style>
        </head>
        <body>
          <div id="printable-report">
            ${reportElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.frameElement && window.frameElement.remove();
                }, 1000);
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Dokumen Laporan Resmi"
      description={`Format dokumen standar pelaporan inventaris ${settings.sub_name || "Pemerintah Provinsi Sumatera Utara"}.`}
      maxWidth="5xl"
    >
      <div className="space-y-4 pt-1">
        {/* Printable Paper Canvas */}
        <div
          id="printable-report"
          className="bg-white text-stone-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-200 overflow-x-auto text-xs"
        >
          {/* 1. Official Government Header (Kop Surat) */}
          <div className="flex items-center gap-4 border-b-2 border-stone-900 pb-4 mb-4 text-center sm:text-left">
            <div className="w-16 h-16 relative shrink-0 mx-auto sm:mx-0">
              <Image
                src="/logo.png"
                alt="Logo Instansi"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-stone-900">
                {settings.institution_name}
              </h3>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-stone-900">
                {settings.sub_name}
              </h2>
              <p className="text-[11px] text-stone-600">
                {settings.address} | Telp: {settings.phone} | Email: {settings.email}
              </p>
            </div>
          </div>

          {/* 2. Report Document Title & Metadata */}
          <div className="text-center my-4 space-y-1">
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wider underline">
              {reportTitle}
            </h1>
            <p className="text-[11px] font-semibold text-stone-600">
              Periode: {startDate || "Awal Tahun"} s/d {endDate || "Sekarang"}
            </p>
          </div>

          {/* 3. Summary KPI Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase">Total Baris Aset</p>
              <p className="text-sm font-black text-stone-900">{summaryStats.totalItems} Barang</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase">Total Fisik Unit</p>
              <p className="text-sm font-black text-stone-900">{summaryStats.totalUnits} Unit</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase">Total Nilai Perolehan</p>
              <p className="text-sm font-black text-stone-900">
                Rp {summaryStats.totalValue.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-500 font-bold uppercase">Kondisi Baik</p>
              <p className="text-sm font-black text-emerald-700">{summaryStats.goodConditionRatio}%</p>
            </div>
          </div>

          {/* 4. Dynamic Data Table */}
          <div className="overflow-x-auto my-4 border border-stone-300 rounded-lg">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-stone-100 font-bold text-stone-800 border-b border-stone-300 uppercase text-[10px]">
                {reportType === "rekap_mutasi" && (
                  <tr>
                    <th className="p-2 border-r border-stone-300">No</th>
                    <th className="p-2 border-r border-stone-300">Kode & Nama Barang</th>
                    <th className="p-2 border-r border-stone-300">Kategori</th>
                    <th className="p-2 border-r border-stone-300 text-center">Stok Awal</th>
                    <th className="p-2 border-r border-stone-300 text-center">Masuk (+)</th>
                    <th className="p-2 border-r border-stone-300 text-center">Keluar (-)</th>
                    <th className="p-2 border-r border-stone-300 text-center">Sisa Stok</th>
                    <th className="p-2 text-right">Nilai Aset (Rp)</th>
                  </tr>
                )}
                {reportType === "buku_induk" && (
                  <tr>
                    <th className="p-2 border-r border-stone-300">No</th>
                    <th className="p-2 border-r border-stone-300">Kode Barang</th>
                    <th className="p-2 border-r border-stone-300">Nama Aset</th>
                    <th className="p-2 border-r border-stone-300">Kategori</th>
                    <th className="p-2 border-r border-stone-300 text-center">Jumlah</th>
                    <th className="p-2 border-r border-stone-300">Kondisi</th>
                    <th className="p-2 border-r border-stone-300">Ruangan</th>
                    <th className="p-2 text-right">Nilai Perolehan</th>
                  </tr>
                )}
                {reportType === "barang_masuk" && (
                  <tr>
                    <th className="p-2 border-r border-stone-300">No. BAST</th>
                    <th className="p-2 border-r border-stone-300">Tanggal</th>
                    <th className="p-2 border-r border-stone-300">Nama Barang</th>
                    <th className="p-2 border-r border-stone-300 text-center">Jumlah</th>
                    <th className="p-2 border-r border-stone-300">Sumber / Rekanan</th>
                    <th className="p-2 border-r border-stone-300">Ruangan Tujuan</th>
                    <th className="p-2 text-right">Total Nilai (Rp)</th>
                  </tr>
                )}
                {reportType === "barang_keluar" && (
                  <tr>
                    <th className="p-2 border-r border-stone-300">No. Bukti</th>
                    <th className="p-2 border-r border-stone-300">Tanggal</th>
                    <th className="p-2 border-r border-stone-300">Nama Barang</th>
                    <th className="p-2 border-r border-stone-300 text-center">Kuantitas</th>
                    <th className="p-2 border-r border-stone-300">Keperluan</th>
                    <th className="p-2 border-r border-stone-300">Ruangan</th>
                    <th className="p-2">Penerima (PJ)</th>
                  </tr>
                )}
                {reportType === "stok_kritis" && (
                  <tr>
                    <th className="p-2 border-r border-stone-300">No</th>
                    <th className="p-2 border-r border-stone-300">Kode Barang</th>
                    <th className="p-2 border-r border-stone-300">Nama Logistik</th>
                    <th className="p-2 border-r border-stone-300">Kategori</th>
                    <th className="p-2 border-r border-stone-300 text-center">Sisa Stok</th>
                    <th className="p-2 border-r border-stone-300">Ruangan</th>
                    <th className="p-2">Status Peringatan</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-stone-200">
                {data.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-stone-50" : ""}>
                    {reportType === "rekap_mutasi" && (
                      <>
                        <td className="p-2 border-r border-stone-200 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-stone-200 font-bold">{row.name} ({row.code})</td>
                        <td className="p-2 border-r border-stone-200">{row.category}</td>
                        <td className="p-2 border-r border-stone-200 text-center">{row.initial_stock || row.stock} {row.unit}</td>
                        <td className="p-2 border-r border-stone-200 text-center font-bold text-emerald-700">+{row.incoming_qty || 0}</td>
                        <td className="p-2 border-r border-stone-200 text-center font-bold text-amber-700">-{row.outgoing_qty || 0}</td>
                        <td className="p-2 border-r border-stone-200 text-center font-bold">{row.stock} {row.unit}</td>
                        <td className="p-2 text-right">Rp {(row.price * row.stock).toLocaleString("id-ID")}</td>
                      </>
                    )}
                    {reportType === "buku_induk" && (
                      <>
                        <td className="p-2 border-r border-stone-200 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-stone-200 font-mono font-bold">{row.code}</td>
                        <td className="p-2 border-r border-stone-200 font-bold">{row.name}</td>
                        <td className="p-2 border-r border-stone-200">{row.category}</td>
                        <td className="p-2 border-r border-stone-200 text-center">{row.stock} {row.unit}</td>
                        <td className="p-2 border-r border-stone-200">{row.condition}</td>
                        <td className="p-2 border-r border-stone-200">{row.location}</td>
                        <td className="p-2 text-right">Rp {(row.price || 0).toLocaleString("id-ID")}</td>
                      </>
                    )}
                    {reportType === "barang_masuk" && (
                      <>
                        <td className="p-2 border-r border-stone-200 font-mono font-bold">{row.transaction_number}</td>
                        <td className="p-2 border-r border-stone-200">{row.date}</td>
                        <td className="p-2 border-r border-stone-200 font-bold">{row.item_name}</td>
                        <td className="p-2 border-r border-stone-200 text-center font-bold">+{row.quantity} {row.unit}</td>
                        <td className="p-2 border-r border-stone-200">{row.source} - {row.supplier}</td>
                        <td className="p-2 border-r border-stone-200">{row.target_location}</td>
                        <td className="p-2 text-right">Rp {(row.total_price || 0).toLocaleString("id-ID")}</td>
                      </>
                    )}
                    {reportType === "barang_keluar" && (
                      <>
                        <td className="p-2 border-r border-stone-200 font-mono font-bold">{row.transaction_number}</td>
                        <td className="p-2 border-r border-stone-200">{row.date}</td>
                        <td className="p-2 border-r border-stone-200 font-bold">{row.item_name}</td>
                        <td className="p-2 border-r border-stone-200 text-center font-bold">-{row.quantity} {row.unit}</td>
                        <td className="p-2 border-r border-stone-200">{row.purpose}</td>
                        <td className="p-2 border-r border-stone-200">{row.target_location}</td>
                        <td className="p-2">{row.recipient_name}</td>
                      </>
                    )}
                    {reportType === "stok_kritis" && (
                      <>
                        <td className="p-2 border-r border-stone-200 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-stone-200 font-mono font-bold">{row.code}</td>
                        <td className="p-2 border-r border-stone-200 font-bold">{row.name}</td>
                        <td className="p-2 border-r border-stone-200">{row.category}</td>
                        <td className="p-2 border-r border-stone-200 text-center font-bold text-rose-700">{row.stock} {row.unit}</td>
                        <td className="p-2 border-r border-stone-200">{row.location}</td>
                        <td className="p-2 font-bold text-rose-700">Perlu Pengadaan Ulang Segera</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Official Signatures Footer (Kolom Tanda Tangan Pejabat Dinamis) */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 text-center text-[11px]">
            <div className="space-y-16">
              <div>
                <p className="text-stone-500">Mengetahui,</p>
                <p className="font-bold text-stone-900">
                  {settings.head_position || "Pejabat Penatausahaan Pengguna Barang"}
                </p>
              </div>
              <div>
                <p className="font-bold text-stone-900 underline">
                  {settings.head_officer || "-"}
                </p>
                <p className="text-stone-600">
                  {settings.head_nip ? `NIP. ${settings.head_nip}` : "NIP. -"}
                </p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="text-stone-500">Medan, {todayStr}</p>
                <p className="font-bold text-stone-900">Pengurus Barang Pengguna</p>
              </div>
              <div>
                <p className="font-bold text-stone-900 underline">
                  {profile?.full_name || "-"}
                </p>
                <p className="text-stone-600">
                  {profile?.nip ? `NIP. ${profile.nip}` : "NIP. -"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="no-print flex items-center justify-between pt-3 border-t border-stone-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Printer size={16} />
            <span>Cetak Dokumen Sekarang (PDF)</span>
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
