import { Loader2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { CancellationReasonDropdown } from "../../components/ui/CancellationReasonDropdown";

interface CancellationModalProps {
  isOpen: boolean;
  isCancelling: boolean;
  cancellationReason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancellationModal = ({
  isOpen,
  isCancelling,
  cancellationReason,
  onReasonChange,
  onClose,
  onConfirm,
}: CancellationModalProps) => {
  const isReasonTooShort =
    cancellationReason.trim().length > 0 &&
    cancellationReason.trim().length < 10;

  const isValid = cancellationReason.trim().length >= 10 && !isCancelling;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batalkan Pesanan?"
      description="Pesanan akan dibatalkan, stok dikembalikan, dan notifikasi otomatis terkirim ke customer."
      isDraggable={false}
    >
      <div className="space-y-6">
        <CancellationReasonDropdown
          value={cancellationReason}
          onChange={(value) => {
            if (value !== "custom") {
              onReasonChange(value);
            }
          }}
          label="Pilih Alasan Cepat"
          showLabel={true}
        />

        <div className="space-y-4">
          <label
            htmlFor="cancellation-reason"
            className="block text-xs font-bold uppercase tracking-wider text-stone-400"
          >
            Alasan Pembatalan <span className="text-red-500">*</span>
            <span className="text-[10px] text-stone-600 ml-2 normal-case font-normal">
              (akan dikirim ke customer)
            </span>
          </label>
          <div className="relative group">
            <textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Contoh: Stok habis mendadak, mohon maaf atas ketidaknyamanannya"
              className="w-full bg-stone-900/50 border border-white/5 rounded-xl px-4 py-4 text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 min-h-[120px] resize-none transition-all group-hover:bg-stone-900 shadow-inner"
              required
              minLength={10}
              aria-invalid={isReasonTooShort}
              aria-describedby="reason-error reason-hint"
              disabled={isCancelling}
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-medium text-stone-600">
              {cancellationReason.trim().length}/10
            </div>
          </div>

          {isReasonTooShort && (
            <div
              id="reason-error"
              className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/10"
            >
              <span>⚠️</span> Alasan terlalu singkat (minimal 10 karakter)
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-stone-900 border border-white/5 text-stone-400 py-3.5 rounded-xl font-bold hover:bg-stone-800 hover:text-white transition-all cursor-pointer text-sm uppercase tracking-wider"
            disabled={isCancelling}
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isValid}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-bold hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-red-700 disabled:active:scale-100 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            {isCancelling && <Loader2 size={16} className="animate-spin" />}
            {isCancelling ? "Memproses..." : "Ya, Batalkan"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
