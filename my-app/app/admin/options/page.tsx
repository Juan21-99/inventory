"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, parsePrice } from "../utils/price.utils";
import { supabase } from "@/lib/supabase";
import Modal from "../../components/ui/Modal";

import { OptionGroupSkeleton } from "../components/OptionGroupSkeleton";

// --- Types ---
interface OptionItem {
  id: string;
  name: string;
  price: number;
}

interface OptionGroup {
  id: string;
  name: string;
  selection_type: "single" | "multiple";
  is_required: boolean;
  items: OptionItem[];
}

export default function OptionsPage() {
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: "",
    selection_type: "single" as "single" | "multiple",
    is_required: false,
  });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: 0,
  });

  // Delete State
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    type: "group" | "item";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "group",
    id: "",
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data
  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Fetch Groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("option_groups")
        .select("*")
        .order("created_at", { ascending: true });

      if (groupsError) throw groupsError;

      // Fetch Items
      const { data: itemsData, error: itemsError } = await supabase
        .from("option_items")
        .select("*")
        .order("price", { ascending: true });

      if (itemsError) throw itemsError;

      // Combine
      const fullGroups = groupsData.map((g) => ({
        ...g,
        items: itemsData.filter((i) => i.group_id === g.id),
      }));

      setGroups(fullGroups);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Gagal memuat opsi: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // --- Group Handlers ---
  const handleSaveGroup = async () => {
    if (!groupForm.name) return toast.error("Nama grup wajib diisi");

    try {
      if (editingGroup) {
        // Update
        const { error } = await supabase
          .from("option_groups")
          .update(groupForm)
          .eq("id", editingGroup.id);
        if (error) throw error;
        toast.success("Grup diperbarui");
      } else {
        // Create
        const { error } = await supabase
          .from("option_groups")
          .insert(groupForm);
        if (error) throw error;
        toast.success("Grup dibuat");
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      setGroupForm({ name: "", selection_type: "single", is_required: false });
      fetchGroups();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleDeleteGroup = (group: OptionGroup) => {
    setDeleteState({
      isOpen: true,
      type: "group",
      id: group.id,
      name: group.name,
    });
  };

  // --- Item Handlers ---
  const handleSaveItem = async () => {
    if (!itemForm.name || !selectedGroupId)
      return toast.error("Nama item wajib diisi");

    try {
      const { error } = await supabase.from("option_items").insert({
        group_id: selectedGroupId,
        name: itemForm.name,
        price: itemForm.price,
      });
      if (error) throw error;
      toast.success("Item ditambahkan");
      setIsItemModalOpen(false);
      setItemForm({ name: "", price: 0 });
      fetchGroups();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = (item: OptionItem) => {
    setDeleteState({
      isOpen: true,
      type: "item",
      id: item.id,
      name: item.name,
    });
  };

  const confirmDelete = async () => {
    if (!deleteState.id) return;

    try {
      setIsDeleting(true);
      const table =
        deleteState.type === "group" ? "option_groups" : "option_items";

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", deleteState.id);

      if (error) throw error;

      toast.success(
        `${deleteState.type === "group" ? "Grup" : "Item"} berhasil dihapus`,
      );
      setDeleteState((prev) => ({ ...prev, isOpen: false }));
      fetchGroups();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Kelola Opsi Menu
          </h1>
          <p className="text-stone-400 mt-1">
            Buat varian rasa, topping, atau ukuran.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingGroup(null);
            setGroupForm({
              name: "",
              selection_type: "single",
              is_required: false,
            });
            setIsGroupModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Plus size={18} strokeWidth={2.5} />
          Buat Grup Baru
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6">
          <OptionGroupSkeleton />
          <OptionGroupSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!loading && groups.length === 0 && (
        <div className="text-center py-20 bg-stone-900/50 rounded-3xl border border-white/5 border-dashed">
          <p className="text-stone-400 font-medium">Belum ada opsi menu.</p>
        </div>
      )}

      {/* Content State */}
      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-stone-900/50 border border-white/5 rounded-3xl overflow-hidden p-6 space-y-6"
            >
              {/* Group Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {group.name}
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-400 uppercase tracking-widest">
                      {group.selection_type === "single"
                        ? "Pilih Satu"
                        : "Pilih Banyak"}
                    </span>
                    {group.is_required && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 uppercase tracking-widest border border-red-500/20">
                        Wajib Diisi
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGroup(group);
                      setGroupForm({
                        name: group.name,
                        selection_type: group.selection_type,
                        is_required: group.is_required,
                      });
                      setIsGroupModalOpen(true);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-stone-950/50 rounded-2xl border border-white/5 p-1">
                {group.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-stone-500 font-medium">
                      Belum ada item di grup ini.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-stone-900 px-4 py-3 rounded-xl border border-white/5 group relative hover:border-amber-500/30 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-sm text-stone-200">
                            {item.name}
                          </p>
                          <p
                            className={`text-xs ${item.price > 0 ? "text-amber-500" : "text-stone-500"}`}
                          >
                            {item.price > 0
                              ? `+Rp ${item.price.toLocaleString("id-ID")}`
                              : "Gratis"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-all cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2 pt-0 mt-2">
                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsItemModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl border border-dashed border-stone-800 text-stone-500 hover:text-amber-500 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer"
                  >
                    <Plus size={14} /> Tambah Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL: CREATE/EDIT GROUP --- */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title={editingGroup ? "Edit Grup Opsi" : "Buat Grup Opsi Baru"}
        description="Contoh: Topping, Level Gula, Ukuran"
        isDraggable={false}
      >
        <div className="space-y-6 pt-4">
          <div>
            <label
              htmlFor="group-name-input"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2 ml-1"
            >
              Nama Grup
            </label>
            <input
              id="group-name-input"
              type="text"
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm({ ...groupForm, name: e.target.value })
              }
              placeholder="Misal: Sugar Level"
              className="w-full px-5 py-4 bg-stone-900 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-bold text-white text-sm transition-all placeholder:text-stone-700 shadow-inner"
            />
          </div>

          <div>
            <div className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2 ml-1">
              Tipe Pilihan
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setGroupForm({ ...groupForm, selection_type: "single" })
                }
                className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-95 cursor-pointer flex flex-col gap-1 ${
                  groupForm.selection_type === "single"
                    ? "bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/10"
                    : "bg-stone-900 border-white/10 text-stone-500 hover:border-amber-500/30"
                }`}
              >
                <span className="font-black text-xs uppercase tracking-widest">
                  Pilih Satu
                </span>
                <span
                  className={`text-[9px] font-medium leading-relaxed ${groupForm.selection_type === "single" ? "text-stone-900/80" : "text-stone-600"}`}
                >
                  Pelanggan hanya bisa memilih 1 opsi (Radio).
                </span>
              </button>

              <button
                onClick={() =>
                  setGroupForm({ ...groupForm, selection_type: "multiple" })
                }
                className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-95 cursor-pointer flex flex-col gap-1 ${
                  groupForm.selection_type === "multiple"
                    ? "bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/10"
                    : "bg-stone-900 border-white/10 text-stone-500 hover:border-amber-500/30"
                }`}
              >
                <span className="font-black text-xs uppercase tracking-widest">
                  Pilih Banyak
                </span>
                <span
                  className={`text-[9px] font-medium leading-relaxed ${groupForm.selection_type === "multiple" ? "text-stone-900/80" : "text-stone-600"}`}
                >
                  Pelanggan bisa centang beberapa opsi (Checkbox).
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer w-full text-left ${
              groupForm.is_required
                ? "bg-red-500/10 border-red-500/30"
                : "bg-stone-900 border-white/5 hover:border-white/10"
            }`}
            onClick={() =>
              setGroupForm({
                ...groupForm,
                is_required: !groupForm.is_required,
              })
            }
          >
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                groupForm.is_required
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-stone-700 bg-stone-950"
              }`}
            >
              {groupForm.is_required && (
                <Plus size={14} className="rotate-45" strokeWidth={4} />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`text-xs font-black uppercase tracking-widest ${groupForm.is_required ? "text-red-500" : "text-stone-400"}`}
              >
                Wajib Diisi
              </p>
              <p className="text-[9px] text-stone-600 mt-0.5">
                Pelanggan tidak bisa lanjut tanpa memilih opsi ini.
              </p>
            </div>
          </button>

          <button
            onClick={handleSaveGroup}
            className="w-full bg-amber-500 text-stone-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] mt-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] border-b-4 border-amber-600 active:border-b-0 cursor-pointer"
          >
            Simpan Grup
          </button>
        </div>
      </Modal>

      {/* --- MODAL: ADD ITEM --- */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Tambah Item Opsi"
        description="Tambahkan pilihan ke dalam grup ini."
        isDraggable={false}
      >
        <div className="space-y-6 pt-4">
          <div>
            <label
              htmlFor="item-name-input"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2 ml-1"
            >
              Nama Item
            </label>
            <input
              id="item-name-input"
              type="text"
              value={itemForm.name}
              onChange={(e) =>
                setItemForm({ ...itemForm, name: e.target.value })
              }
              placeholder="Misal: Less Sugar / Bubble"
              className="w-full px-5 py-4 bg-stone-900 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-bold text-white text-sm transition-all placeholder:text-stone-700 shadow-inner"
            />
          </div>

          <div>
            <label
              htmlFor="item-price-input"
              className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2 ml-1"
            >
              Harga Tambahan
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500 font-black text-xs">
                Rp
              </span>

              <input
                id="item-price-input"
                type="text"
                inputMode="numeric"
                value={formatPrice(String(itemForm.price))}
                onChange={(e) => {
                  const val = parsePrice(e.target.value);
                  setItemForm({ ...itemForm, price: val ? Number(val) : 0 });
                }}
                className="w-full pl-12 pr-5 py-4 bg-stone-950 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-black text-amber-500 text-lg transition-all font-mono"
              />
            </div>
            <p className="text-[9px] text-stone-600 mt-2 ml-1 font-medium">
              *Biarkan 0 jika opsi ini Gratis.
            </p>
          </div>

          <button
            onClick={handleSaveItem}
            className="w-full bg-amber-500 text-stone-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] mt-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] border-b-4 border-amber-600 active:border-b-0 cursor-pointer"
          >
            Tambah Item
          </button>
        </div>
      </Modal>
      {/* --- MODAL: DELETE CONFIRMATION --- */}
      <Modal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState((prev) => ({ ...prev, isOpen: false }))}
        title={`Hapus ${deleteState.type === "group" ? "Grup" : "Item"}?`}
        description="Tindakan ini tidak dapat dibatalkan."
        isDraggable={false}
      >
        <div className="space-y-6 pt-4">
          <div className="bg-stone-950 p-4 rounded-xl border border-white/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                Akan dihapus:
              </p>
              <p className="text-white font-bold text-lg leading-none">
                {deleteState.name}
              </p>
            </div>
          </div>

          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <p className="text-red-400 text-xs font-bold leading-relaxed text-center">
              ⚠️ PERINGATAN:{" "}
              {deleteState.type === "group"
                ? "Semua item di dalam grup ini juga akan ikut terhapus permanen."
                : "Item ini akan hilang dari pilihan menu pelanggan."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() =>
                setDeleteState((prev) => ({ ...prev, isOpen: false }))
              }
              disabled={isDeleting}
              className="px-4 py-3 bg-stone-900 text-stone-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-800 hover:text-white transition-all cursor-pointer disabled:opacity-50 border border-white/5"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="px-4 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Hapus Permanen
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
