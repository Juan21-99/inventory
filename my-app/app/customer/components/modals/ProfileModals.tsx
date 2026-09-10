"use client";

import React from "react";
import { User, Plus } from "lucide-react";
import Image from "next/image";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { Profile, Address } from "../../types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onUpdate: () => Promise<void>;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdate,
}: Readonly<EditProfileModalProps>) {
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Form states
  const [fullName, setFullName] = React.useState(profile?.full_name || "");
  const [phone, setPhone] = React.useState(profile?.phone || "");
  const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatar_url || "");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update form when profile changes
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (!profile) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Update State (Optimistic update)
      setAvatarUrl(publicUrl);
      toast.success("Foto berhasil diupload!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Gagal upload foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl, // Include avatar_url in update
        })
        .eq("id", profile.id);

      if (error) throw error;

      await onUpdate(); // Refresh context
      toast.success("Profil berhasil diperbarui!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profil"
      description="Perbarui informasi profil kamu."
    >
      <div className="space-y-5 pt-1">
        <div className="flex flex-col items-center mb-4">
          <div className="relative group">
            <div className="w-24 h-24 bg-stone-900 rounded-full flex items-center justify-center shadow-2xl shadow-black/50 border-2 border-amber-500 overflow-hidden relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={40} className="text-stone-500" strokeWidth={2} />
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-stone-800 border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform cursor-pointer hover:bg-stone-700 hover:scale-105"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-3">
            Ganti Foto Profil
          </p>
          {avatarUrl && (
            <button
              onClick={() => setAvatarUrl("")}
              className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-red-400 transition-colors"
            >
              Hapus Foto
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="full-name"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2.5 ml-1"
            >
              Nama Lengkap
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-stone-950/50 border border-stone-800 text-white text-base font-medium focus:border-amber-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="phone-number"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2.5 ml-1"
            >
              Nomor WhatsApp
            </label>
            <input
              id="phone-number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-stone-950/50 border border-stone-800 text-white text-base font-medium focus:border-amber-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2.5 ml-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-5 py-3.5 rounded-2xl bg-stone-950/50 border border-stone-800 text-stone-600 text-base font-medium cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="w-full bg-amber-500 text-stone-950 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface AddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNew: () => void;
  addresses: Address[];
  loading: boolean;
  onEdit: (address: Address) => void;
  onRefresh: () => void;
  userId?: string;
}

export function AddressesModal({
  isOpen,
  onClose,
  onAddNew,
  addresses,
  loading,
  onEdit,
  onRefresh,
  userId,
}: Readonly<AddressesModalProps>) {
  const [deleteConfirmationId, setDeleteConfirmationId] = React.useState<
    string | null
  >(null);

  const confirmDelete = async () => {
    if (!userId || !deleteConfirmationId) return;

    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", deleteConfirmationId);
      if (error) throw error;
      toast.success("Alamat berhasil dihapus");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus alamat");
    } finally {
      setDeleteConfirmationId(null);
    }
  };
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-stone-500 py-4">Memuat alamat...</div>
      );
    }

    if (addresses.length === 0) {
      return (
        <div className="text-center text-stone-500 py-4">
          Belum ada alamat tersimpan.
        </div>
      );
    }

    return addresses.map((addr) => (
      <div
        key={addr.id}
        className="p-5 rounded-3xl bg-stone-950/50 border border-stone-800 group hover:border-amber-500/30 transition-all relative"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">
              {addr.label}
            </span>
            {addr.is_default && (
              <span className="text-[10px] font-black bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md uppercase tracking-widest">
                Utama
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(addr)}
              className="text-stone-500 hover:text-amber-500 transition-colors p-1"
            >
              <span className="text-[10px] font-bold uppercase">Edit</span>
            </button>
            <button
              onClick={() => setDeleteConfirmationId(addr.id)}
              className="text-stone-500 hover:text-red-500 transition-colors p-1"
            >
              <span className="text-[10px] font-bold uppercase">Hapus</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-stone-400 leading-relaxed pr-8">
          {addr.detail}
        </p>
      </div>
    ));
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Daftar Alamat"
        description="Simpan alamat untuk pemesanan lebih cepat."
      >
        <div className="space-y-6 pt-2">
          <div className="space-y-4">{renderContent()}</div>

          <button
            onClick={onAddNew}
            className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-stone-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Plus
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
            Tambah Alamat Baru
          </button>
        </div>
      </Modal>

      <DeleteAddressModal
        isOpen={!!deleteConfirmationId}
        onClose={() => setDeleteConfirmationId(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

interface DeleteAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAddressModal({
  isOpen,
  onClose,
  onConfirm,
}: Readonly<DeleteAddressModalProps>) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    onConfirm();
    setIsDeleting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Alamat?"
      description="Tindakan ini tidak dapat dibatalkan."
    >
      <div className="space-y-6 pt-2">
        <p className="text-sm text-stone-400 leading-relaxed text-center">
          Apakah Anda yakin ingin menghapus alamat ini dari daftar tersimpan?
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-stone-900/50 border border-white/5 text-stone-400 py-4 rounded-2xl font-black text-xs hover:bg-stone-800 hover:text-white transition-all active:scale-95 cursor-pointer uppercase tracking-[0.2em]"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-gradient-to-br from-red-500 to-red-600 text-white py-4 rounded-2xl font-black text-xs hover:from-red-400 hover:to-red-500 transition-all shadow-xl shadow-red-500/20 active:scale-95 cursor-pointer uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSuccess: () => Promise<void>;
  userId?: string;
  addressToEdit?: Address | null;
}

export function AddAddressModal({
  isOpen,
  onClose,
  onBack,
  onSuccess,
  userId,
  addressToEdit,
}: Readonly<AddAddressModalProps>) {
  const [loading, setLoading] = React.useState(false);
  const [label, setLabel] = React.useState("Rumah");
  const [fullAddress, setFullAddress] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);

  // Pre-fill if editing
  React.useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        setLabel(addressToEdit.label);
        setFullAddress(addressToEdit.detail);
        setIsDefault(addressToEdit.is_default);
      } else {
        // Reset if adding new
        setLabel("Rumah");
        setFullAddress("");
        setIsDefault(false);
      }
    }
  }, [isOpen, addressToEdit]);

  const handleSubmit = async () => {
    if (!userId || !fullAddress) {
      toast.error("Mohon lengkapi alamat.");
      return;
    }
    setLoading(true);

    try {
      // If setting as default, unset other defaults first
      if (isDefault) {
        const { error: resetError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);

        if (resetError) throw resetError;
      }
      // For simplicity, we just insert.

      let error;
      if (addressToEdit) {
        const { error: updateError } = await supabase
          .from("addresses")
          .update({
            label,
            detail: fullAddress,
            is_default: isDefault,
          })
          .eq("id", addressToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("addresses").insert({
          user_id: userId,
          label,
          detail: fullAddress,
          is_default: isDefault,
        });
        error = insertError;
      }

      if (error) throw error;

      toast.success("Alamat berhasil ditambahkan!");
      await onSuccess(); // Refresh list
      setFullAddress(""); // Reset form
      setIsDefault(false);
      onBack();
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Gagal menambahkan alamat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={addressToEdit ? "Edit Alamat" : "Alamat Baru"}
      description={
        addressToEdit
          ? "Perbarui detail alamat ini."
          : "Tambahkan alamat pengiriman baru."
      }
    >
      <div className="space-y-5 pt-1">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="address-label"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2.5 ml-1"
            >
              Label Alamat
            </label>
            <div id="address-label" className="flex gap-2">
              {["Rumah", "Kantor", "Apartemen"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`px-4 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    label === l
                      ? "bg-amber-500 border-amber-500 text-stone-950"
                      : "bg-stone-950/50 border-stone-800 text-stone-400 hover:border-amber-500/30 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="full-address"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2.5 ml-1"
            >
              Alamat Lengkap
            </label>
            <textarea
              id="full-address"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap & patokan..."
              rows={3}
              className="w-full px-5 py-3.5 rounded-2xl bg-stone-950/50 border border-stone-800 text-white text-base font-medium focus:border-amber-500/50 outline-none transition-all resize-none placeholder:text-stone-700"
            />
          </div>

          <button
            onClick={() => setIsDefault(!isDefault)}
            className={`flex items-center gap-3 w-full p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isDefault
                ? "bg-amber-500/10 border-amber-500/50"
                : "bg-stone-900/30 border-white/5 hover:border-amber-500/30"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isDefault ? "border-amber-500" : "border-stone-800"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 bg-amber-500 rounded-sm transition-opacity ${
                  isDefault ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            <span
              className={`text-xs font-bold transition-colors ${
                isDefault ? "text-amber-500" : "text-stone-400"
              }`}
            >
              Jadikan Alamat Utama
            </span>
          </button>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-stone-900/50 border border-white/5 text-stone-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-stone-800 hover:text-white transition-all active:scale-95 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-amber-500 text-stone-950 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(() => {
              if (loading) return "Menyimpan...";
              if (addressToEdit) return "Update Alamat";
              return "Simpan Alamat";
            })()}
          </button>
        </div>
      </div>
    </Modal>
  );
}
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: Readonly<LogoutModalProps>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keluar Akun"
      description="Apakah kamu yakin ingin keluar dari Alin Coffee?"
    >
      <div className="space-y-6 pt-2">
        <p className="text-sm text-stone-400 leading-relaxed text-center">
          Kamu harus login kembali untuk melakukan pemesanan dan melihat riwayat
          transaksi kamu.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-stone-900/50 border border-white/5 text-stone-400 py-4 rounded-2xl font-black text-xs hover:bg-stone-800 hover:text-white transition-all active:scale-95 cursor-pointer uppercase tracking-[0.2em]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-br from-red-500 to-red-600 text-white py-4 rounded-2xl font-black text-xs hover:from-red-400 hover:to-red-500 transition-all shadow-xl shadow-red-500/20 active:scale-95 cursor-pointer uppercase tracking-[0.2em]"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </Modal>
  );
}
