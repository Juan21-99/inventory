"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase, uploadAvatar } from "@/lib/supabase";
import { Save, Check, Camera, Loader2, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // State for deferred upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Save states
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync internal state with auth profile
  // Sync internal state with auth profile
  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  };

  const confirmDeleteAvatar = async () => {
    setShowDeleteModal(false);

    // Clear preview immediately
    setPreviewUrl(null);
    setSelectedFile(null);

    // If there's an existing avatar, delete it from database
    if (avatarUrl && user?.id) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", user.id);

        if (error) throw error;
        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error("Error deleting avatar:", error);
        alert("Gagal menghapus foto profil");
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.id && selectedFile) {
        const url = await uploadAvatar(selectedFile, user.id);
        if (url) {
          const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: url })
            .eq("id", user.id);

          if (error) throw error;
          await refreshProfile();
          setSelectedFile(null);
          setPreviewUrl(null);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const displayImage = previewUrl || avatarUrl;

  return (
    <div className="p-8 pb-32 max-w-5xl mx-auto">
      {/* Content */}
      <div className="bg-stone-900/50 rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-8">
          <h2 className="text-xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
            <span className="w-1 h-8 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>{" "}
            Informasi Profil
          </h2>

          {/* Avatar Area */}
          <div className="flex items-start sm:items-center gap-8 mb-10 flex-col sm:flex-row bg-stone-950/50 p-6 rounded-2xl border border-white/5">
            <div className="relative group shrink-0">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayImage}
                  alt="Avatar"
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-white/10 ring-4 ring-black/20 shadow-2xl"
                />
              ) : (
                <div className="w-28 h-28 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 text-4xl font-black border-2 border-white/5 ring-4 ring-black/20 shadow-2xl">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
              )}

              {/* Upload Overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-[2px] border border-white/10">
                <Camera className="w-8 h-8 text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>

              {/* Delete Button (Icon only) */}
              {(avatarUrl || previewUrl) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteModal(true);
                  }}
                  className="absolute -bottom-2 -right-2 p-2.5 bg-stone-900 text-red-500 rounded-xl border border-white/10 shadow-lg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all z-20 cursor-pointer active:scale-95"
                  title="Hapus Foto"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-bold text-white text-lg tracking-tight">
                  Foto Profil
                </p>
                <p className="text-sm text-stone-500 max-w-xs leading-relaxed mt-1">
                  Format: JPG, PNG, GIF. Maksimal 2MB. Gunakan foto rasio 1:1
                  untuk hasil terbaik.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

          {/* Form */}
          <div className="space-y-8 max-w-2xl">
            <div className="grid gap-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1">
                Nama Tampilan
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={user?.email?.split("@")[0] || ""}
                  disabled
                  className="w-full px-5 py-4 border border-white/5 rounded-2xl bg-stone-950 text-stone-400 cursor-not-allowed shadow-inner font-bold"
                />
                <div className="absolute inset-0 bg-stone-950/20 rounded-2xl pointer-events-none" />
              </div>
              <p className="text-[10px] text-stone-600 pl-1 font-medium">
                *Username diambil otomatis dari alamat email.
              </p>
            </div>

            <div className="grid gap-3">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1">
                Email
              </p>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-5 py-4 border border-white/5 rounded-2xl bg-stone-950 text-stone-400 cursor-not-allowed shadow-inner font-bold font-mono text-sm"
                />
                <div className="absolute inset-0 bg-stone-950/20 rounded-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-white/5 bg-stone-950/30 flex justify-between items-center backdrop-blur-md">
          <p className="text-xs text-amber-500/80 font-bold italic tracking-wide">
            {selectedFile ? "* Ada perubahan yang belum disimpan" : ""}
          </p>
          <button
            onClick={handleSave}
            disabled={saving || !selectedFile}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
              saved
                ? "bg-green-500/10 text-green-500 border border-green-500/20 shadow-green-500/10"
                : "bg-amber-500 hover:bg-amber-400 text-stone-950 border border-amber-400 shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:grayscale disabled:cursor-not-allowed disabled:active:scale-100"
            }`}
          >
            {(() => {
              if (saving) {
                return (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                );
              }
              if (saved) {
                return (
                  <>
                    <Check size={18} strokeWidth={3} />
                    <span>Tersimpan!</span>
                  </>
                );
              }
              return (
                <>
                  <Save size={18} strokeWidth={2.5} />
                  <span>Simpan Perubahan</span>
                </>
              );
            })()}
          </button>
        </div>
      </div>

      {/* REUSABLE MODAL: DELETE AVATAR CONFIRMATION */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Foto Profil"
        description="Apakah Anda yakin ingin menghapus foto profil ini? Tindakan ini tidak dapat dibatalkan."
        isDraggable={false}
      >
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-400 bg-stone-900 border border-white/5 hover:bg-stone-800 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={confirmDeleteAvatar}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 border border-red-500 shadow-lg shadow-red-500/20 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Hapus Foto
          </button>
        </div>
      </Modal>
    </div>
  );
}
