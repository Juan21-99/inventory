"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Tag,
  ShieldCheck,
  Sliders,
  User,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  MapPin,
  FileText,
  Boxes,
  Key,
  Mail,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  IdCard,
  Upload,
  Camera,
  Check,
  Sparkles,
  Truck,
  Send,
  Briefcase,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useCategories } from "../gudang/hooks/useCategories";
import { useLocations } from "../gudang/hooks/useLocations";
import { useUsers, CreateUserData } from "./hooks/useUsers";
import { useSources } from "../barang-masuk/hooks/useSources";
import { usePurposes } from "../barang-keluar/hooks/usePurposes";
import { useStatuses } from "../barang-keluar/hooks/useStatuses";
import { useUnits } from "../hooks/useUnits";
import Modal from "@/app/components/ui/Modal";

type SettingsTab =
  | "instansi"
  | "pengguna"
  | "ruangan"
  | "kategori"
  | "satuan"
  | "sumber"
  | "tujuan"
  | "status_keluar"
  | "preferensi"
  | "keamanan";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { locations, addLocation, updateLocation, deleteLocation } = useLocations();
  const { users, loading: usersLoading, addUser, updateUser, deleteUser } = useUsers();
  const { sources, addSource, updateSource, deleteSource } = useSources();
  const { purposes, addPurpose, updatePurpose, deletePurpose } = usePurposes();
  const { statuses, addStatus, updateStatus, deleteStatus } = useStatuses();
  const { units, addUnit, updateUnit, deleteUnit } = useUnits();

  const [activeTab, setActiveTab] = useState<SettingsTab>("instansi");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Success / Alert message toast
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Pengaturan berhasil disimpan!");
  const [loading, setLoading] = useState(true);

  // Settings Record ID from Supabase
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // 1. Instansi Profile State (Pure Supabase)
  const [instansiData, setInstansiData] = useState({
    name: "",
    subName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    headOfficer: "",
    headNip: "",
    headPosition: "",
    logisticsOfficer: "",
    logisticsNip: "",
    logisticsPosition: "",
  });

  // 2. Preferences State (Pure Supabase)
  const [prefData, setPrefData] = useState({
    lowStockThreshold: 2,
    codePrefixItem: "INV",
    codePrefixIncoming: "BM",
    codePrefixOutgoing: "BK",
  });

  // 3. Security / Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 4. Modal Tambah Pengguna Baru
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<CreateUserData & { avatarPreview?: string | null }>({
    email: "",
    password: "",
    full_name: "",
    nip: "",
    phone: "",
    avatarFile: null,
    avatarPreview: null,
  });
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const [userFormLoading, setUserFormLoading] = useState(false);

  // 5. Modal Edit Profil Pengguna
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<{
    full_name: string;
    nip: string;
    phone: string;
    email: string;
    avatar_url?: string | null;
    avatarFile?: File | null;
    avatarPreview?: string | null;
  }>({
    full_name: "",
    nip: "",
    phone: "",
    email: "",
    avatar_url: null,
    avatarFile: null,
    avatarPreview: null,
  });
  const [editUserError, setEditUserError] = useState("");
  const [editUserLoading, setEditUserLoading] = useState(false);

  // Modals for Ruangan & Kategori CRUD
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [roomFloorInput, setRoomFloorInput] = useState("");

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catNameInput, setCatNameInput] = useState("");

  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [sourceNameInput, setSourceNameInput] = useState("");
  const [sourceDescInput, setSourceDescInput] = useState("");

  const [purposeModalOpen, setPurposeModalOpen] = useState(false);
  const [editingPurposeId, setEditingPurposeId] = useState<string | null>(null);
  const [purposeNameInput, setPurposeNameInput] = useState("");
  const [purposeDescInput, setPurposeDescInput] = useState("");

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusNameInput, setStatusNameInput] = useState("");
  const [statusDescInput, setStatusDescInput] = useState("");

  // Fetch Settings from Supabase Table 'system_settings'
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        setSettingsId(data.id);
        setInstansiData({
          name: data.institution_name || "",
          subName: data.sub_name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          headOfficer: data.head_officer || "",
          headNip: data.head_nip || "",
          headPosition: data.head_position || "",
          logisticsOfficer: data.logistics_officer || "",
          logisticsNip: data.logistics_nip || "",
          logisticsPosition: data.logistics_position || "",
        });

        setPrefData({
          lowStockThreshold: data.low_stock_threshold ?? 2,
          codePrefixItem: data.code_prefix_item || "INV",
          codePrefixIncoming: data.code_prefix_incoming || "BM",
          codePrefixOutgoing: data.code_prefix_outgoing || "BK",
        });
      }
    } catch (err) {
      console.error("Error fetching system settings from Supabase:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime updates on system_settings
    const channel = supabase
      .channel("realtime-system-settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings" },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const triggerSaveNotification = (msg = "Pengaturan berhasil disimpan!") => {
    setSaveMessage(msg);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Custom Delete Confirmation State (No native browser confirm)
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName: string;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    itemName: "",
    onConfirm: () => { },
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Save Instansi Profile to Supabase
  const handleSaveInstansi = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      institution_name: instansiData.name,
      sub_name: instansiData.subName,
      address: instansiData.address,
      phone: instansiData.phone,
      email: instansiData.email,
      website: instansiData.website,
      head_officer: instansiData.headOfficer,
      head_nip: instansiData.headNip,
      head_position: instansiData.headPosition,
      logistics_officer: instansiData.logisticsOfficer,
      logistics_nip: instansiData.logisticsNip,
      logistics_position: instansiData.logisticsPosition,
      updated_at: new Date().toISOString(),
    };

    try {
      if (settingsId) {
        await supabase.from("system_settings").update(payload).eq("id", settingsId);
      } else {
        const { data } = await supabase.from("system_settings").insert([payload]).select().single();
        if (data) setSettingsId(data.id);
      }
    } catch {
      // Fallback
    }

    triggerSaveNotification("Profil instansi berhasil diperbarui di Supabase!");
  };

  // Save Preferences to Supabase
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      low_stock_threshold: Number(prefData.lowStockThreshold) || 2,
      code_prefix_item: prefData.codePrefixItem,
      code_prefix_incoming: prefData.codePrefixIncoming,
      code_prefix_outgoing: prefData.codePrefixOutgoing,
      updated_at: new Date().toISOString(),
    };

    try {
      if (settingsId) {
        await supabase.from("system_settings").update(payload).eq("id", settingsId);
      } else {
        const { data } = await supabase.from("system_settings").insert([payload]).select().single();
        if (data) setSettingsId(data.id);
      }
    } catch {
      // Fallback
    }

    triggerSaveNotification("Preferensi stok berhasil diperbarui di Supabase!");
  };

  // Handle Tambah Pengguna Baru
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");

    if (!newUserData.email.trim() || !newUserData.password || !newUserData.full_name.trim()) {
      setUserFormError("Email, kata sandi, dan nama lengkap wajib diisi.");
      return;
    }

    if (newUserData.password.length < 6) {
      setUserFormError("Kata sandi minimal 6 karakter.");
      return;
    }

    try {
      setUserFormLoading(true);
      await addUser(newUserData);
      triggerSaveNotification(`Pengguna ${newUserData.full_name} berhasil didaftarkan!`);
      setUserModalOpen(false);
      setNewUserData({
        email: "",
        password: "",
        full_name: "",
        nip: "",
        phone: "",
        avatarFile: null,
        avatarPreview: null,
      });
    } catch (err: unknown) {
      setUserFormError(err instanceof Error ? err.message : "Gagal menambahkan pengguna.");
    } finally {
      setUserFormLoading(false);
    }
  };

  // Handle Buka Modal Edit Pengguna
  const handleOpenEditUser = (u: any) => {
    setEditingUserId(u.id);
    setEditUserData({
      full_name: u.full_name || "",
      nip: u.nip || "",
      phone: u.phone || "",
      email: u.email || "",
      avatar_url: u.avatar_url || null,
      avatarFile: null,
      avatarPreview: u.avatar_url || null,
    });
    setEditUserError("");
    setEditUserModalOpen(true);
  };

  // Handle Simpan Edit Pengguna
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setEditUserError("");

    if (!editUserData.full_name.trim()) {
      setEditUserError("Nama lengkap wajib diisi.");
      return;
    }

    try {
      setEditUserLoading(true);
      await updateUser(
        editingUserId,
        {
          full_name: editUserData.full_name.trim(),
          nip: editUserData.nip?.trim() || null,
          phone: editUserData.phone?.trim() || null,
        },
        editUserData.avatarFile
      );

      if ((editingUserId === user?.id || editUserData.email === user?.email) && refreshProfile) {
        await refreshProfile();
      }

      triggerSaveNotification("Profil pengguna berhasil diperbarui!");
      setEditUserModalOpen(false);
    } catch (err: unknown) {
      setEditUserError(err instanceof Error ? err.message : "Gagal memperbarui profil.");
    } finally {
      setEditUserLoading(false);
    }
  };

  // Update Password via Supabase Auth
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      setPasswordError("Kata sandi baru tidak boleh kosong.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      triggerSaveNotification("Kata sandi akun berhasil diperbarui!");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Gagal memperbarui kata sandi.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Ruangan CRUD (Connected to Supabase via useLocations)
  const handleOpenAddRoom = () => {
    setEditingRoomId(null);
    setRoomNameInput("");
    setRoomFloorInput("Lantai 1");
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: { id: string; name: string; floor?: string }) => {
    setEditingRoomId(room.id);
    setRoomNameInput(room.name);
    setRoomFloorInput(room.floor || "Lantai 1");
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNameInput.trim()) return;

    if (editingRoomId) {
      await updateLocation(editingRoomId, {
        name: roomNameInput.trim(),
        floor: roomFloorInput.trim(),
      });
      triggerSaveNotification("Ruangan berhasil diperbarui!");
    } else {
      await addLocation({
        name: roomNameInput.trim(),
        floor: roomFloorInput.trim(),
      });
      triggerSaveNotification("Ruangan baru berhasil ditambahkan!");
    }
    setRoomModalOpen(false);
  };

  // Kategori CRUD (Connected to Supabase via useCategories)
  const handleOpenAddCat = () => {
    setEditingCatId(null);
    setCatNameInput("");
    setCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: { id: string; name: string }) => {
    setEditingCatId(cat.id);
    setCatNameInput(cat.name);
    setCatModalOpen(true);
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;

    if (editingCatId) {
      await updateCategory(editingCatId, { name: catNameInput.trim() });
      triggerSaveNotification("Kategori berhasil diperbarui!");
    } else {
      await addCategory(catNameInput.trim());
      triggerSaveNotification("Kategori baru berhasil ditambahkan!");
    }
    setCatModalOpen(false);
  };

  // Sumber Pengadaan CRUD (Connected to Supabase via useSources)
  const handleOpenAddSource = () => {
    setEditingSourceId(null);
    setSourceNameInput("");
    setSourceDescInput("");
    setSourceModalOpen(true);
  };

  const handleOpenEditSource = (source: { id: string; name: string; description?: string | null }) => {
    setEditingSourceId(source.id);
    setSourceNameInput(source.name);
    setSourceDescInput(source.description || "");
    setSourceModalOpen(true);
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNameInput.trim()) return;

    if (editingSourceId && !editingSourceId.startsWith("default-")) {
      await updateSource(editingSourceId, {
        name: sourceNameInput.trim(),
        description: sourceDescInput.trim() || null,
      });
      triggerSaveNotification("Sumber pengadaan berhasil diperbarui!");
    } else {
      await addSource(sourceNameInput.trim(), sourceDescInput.trim());
      triggerSaveNotification("Sumber pengadaan baru berhasil ditambahkan!");
    }
    setSourceModalOpen(false);
  };

  // Tujuan Distribusi CRUD (Connected to Supabase via usePurposes)
  const handleOpenAddPurpose = () => {
    setEditingPurposeId(null);
    setPurposeNameInput("");
    setPurposeDescInput("");
    setPurposeModalOpen(true);
  };

  const handleOpenEditPurpose = (purpose: { id: string; name: string; description?: string | null }) => {
    setEditingPurposeId(purpose.id);
    setPurposeNameInput(purpose.name);
    setPurposeDescInput(purpose.description || "");
    setPurposeModalOpen(true);
  };

  const handleSavePurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purposeNameInput.trim()) return;

    if (editingPurposeId) {
      await updatePurpose(editingPurposeId, {
        name: purposeNameInput.trim(),
        description: purposeDescInput.trim() || null,
      });
      triggerSaveNotification("Tujuan distribusi berhasil diperbarui!");
    } else {
      await addPurpose(purposeNameInput.trim(), purposeDescInput.trim());
      triggerSaveNotification("Tujuan distribusi baru berhasil ditambahkan!");
    }
    setPurposeModalOpen(false);
  };

  // Status Distribusi CRUD (Connected to Supabase via useStatuses)
  const handleOpenAddStatus = () => {
    setEditingStatusId(null);
    setStatusNameInput("");
    setStatusDescInput("");
    setStatusModalOpen(true);
  };

  const handleOpenEditStatus = (status: { id: string; name: string; description?: string | null }) => {
    setEditingStatusId(status.id);
    setStatusNameInput(status.name);
    setStatusDescInput(status.description || "");
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusNameInput.trim()) return;

    if (editingStatusId) {
      await updateStatus(editingStatusId, {
        name: statusNameInput.trim(),
        description: statusDescInput.trim() || null,
      });
      triggerSaveNotification("Status distribusi berhasil diperbarui!");
    } else {
      await addStatus(statusNameInput.trim(), statusDescInput.trim());
      triggerSaveNotification("Status distribusi baru berhasil ditambahkan!");
    }
    setStatusModalOpen(false);
  };

  // Satuan Barang CRUD (Connected to Supabase via useUnits)
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitNameInput, setUnitNameInput] = useState("");
  const [unitDescInput, setUnitDescInput] = useState("");

  const handleOpenAddUnit = () => {
    setEditingUnitId(null);
    setUnitNameInput("");
    setUnitDescInput("");
    setUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit: { id: string; name: string; description?: string | null }) => {
    setEditingUnitId(unit.id);
    setUnitNameInput(unit.name);
    setUnitDescInput(unit.description || "");
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNameInput.trim()) return;

    if (editingUnitId) {
      await updateUnit(editingUnitId, {
        name: unitNameInput.trim(),
        description: unitDescInput.trim() || null,
      });
      triggerSaveNotification("Satuan barang berhasil diperbarui!");
    } else {
      await addUnit(unitNameInput.trim(), unitDescInput.trim());
      triggerSaveNotification("Satuan barang baru berhasil ditambahkan!");
    }
    setUnitModalOpen(false);
  };

  const TABS = [
    { id: "instansi" as SettingsTab, label: "Profil Instansi", icon: Building2 },
    { id: "pengguna" as SettingsTab, label: "Kelola Pengguna", icon: Users },
    { id: "ruangan" as SettingsTab, label: "Master Ruangan", icon: MapPin },
    { id: "kategori" as SettingsTab, label: "Master Kategori", icon: Tag },
    { id: "satuan" as SettingsTab, label: "Master Satuan", icon: Boxes },
    { id: "sumber" as SettingsTab, label: "Sumber Pengadaan", icon: Truck },
    { id: "tujuan" as SettingsTab, label: "Tujuan Distribusi", icon: Send },
    { id: "status_keluar" as SettingsTab, label: "Status Distribusi", icon: ShieldCheck },
    { id: "preferensi" as SettingsTab, label: "Preferensi Stok", icon: Sliders },
    { id: "keamanan" as SettingsTab, label: "Akun & Keamanan", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[120] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-2xl shadow-emerald-500/30"
          >
            <CheckCircle2 size={18} strokeWidth={2.5} />
            <span>{saveMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs (Animated Sliding Amber Pill) */}
      <div className="bg-white dark:bg-stone-900/70 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl relative z-30 transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${isActive ? "text-stone-950 font-black" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
              >
                {/* Active Sliding Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTab"
                    className="absolute inset-0 bg-amber-500 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Hover Background */}
                {!isActive && hoveredTab === tab.id && (
                  <motion.div
                    layoutId="hoverSettingsTab"
                    className="absolute inset-0 bg-stone-100 dark:bg-white/5 rounded-2xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PROFIL INSTANSI & PEJABAT */}
      {activeTab === "instansi" && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveInstansi}
          className="space-y-6"
        >
          {/* Identitas Kantor */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Identitas Kantor & Kop Surat Resmi
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Data ini tersimpan di Supabase dan tercetak otomatis pada Berita Acara (BAST) dan Laporan Inventaris.
                </p>
              </div>
            </div>

            {/* Form Fields Instansi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Nama Satuan Kerja / Instansi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Inspektorat Daerah Provinsi Sumatera Utara"
                  value={instansiData.name}
                  onChange={(e) => setInstansiData({ ...instansiData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Pemerintah Daerah
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemerintah Provinsi Sumatera Utara"
                  value={instansiData.subName}
                  onChange={(e) => setInstansiData({ ...instansiData, subName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Alamat Lengkap Kantor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jalan Jenderal A. Yani No. 40, Medan"
                  value={instansiData.address}
                  onChange={(e) => setInstansiData({ ...instansiData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Nomor Telepon Kantor
                </label>
                <input
                  type="text"
                  placeholder="(061) 453-2940"
                  value={instansiData.phone}
                  onChange={(e) => setInstansiData({ ...instansiData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Email Resmi Kantor
                </label>
                <input
                  type="email"
                  placeholder="inspektorat@sumutprov.go.id"
                  value={instansiData.email}
                  onChange={(e) => setInstansiData({ ...instansiData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan Dokumen */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Kepala / Pimpinan Instansi (Penandatangan Laporan)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Nama dan NIP Pimpinan yang dicantumkan pada kolom tanda tangan laporan resmi (KIB / BAST).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Nama Jabatan Pimpinan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Inspektur Provinsi Sumatera Utara"
                  value={instansiData.headPosition}
                  onChange={(e) => setInstansiData({ ...instansiData, headPosition: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-stone-200 outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Nama Lengkap & Gelar Pimpinan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Si"
                  value={instansiData.headOfficer}
                  onChange={(e) => setInstansiData({ ...instansiData, headOfficer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  NIP Pimpinan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19780412 200112 1 002"
                  value={instansiData.headNip}
                  onChange={(e) => setInstansiData({ ...instansiData, headNip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-mono text-stone-900 dark:text-stone-300 outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
              <ShieldCheck size={16} className="shrink-0" />
              <span>
                <strong>Info:</strong> Petugas Pengurus Barang pada laporan otomatis diambil secara dinamis dari akun petugas yang sedang login.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 transition-all"
              >
                <Save size={16} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {/* TAB 2: KELOLA PENGGUNA (MULTI-USER / 4 ORANG PEGANG APLIKASI) */}
      {activeTab === "pengguna" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Daftar Pengguna & Petugas Aktif (Multi-User)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Daftarkan akun login untuk seluruh rekan kerja/petugas yang memegang sistem inventaris.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserFormError("");
                  setUserModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <UserPlus size={16} strokeWidth={2.5} />
                <span>Tambah Pengguna Baru</span>
              </button>
            </div>

            {/* User Cards Grid: Full-Bleed Portrait Glass Profile Cards (Like Reference Image) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((u) => {
                const isCurrentUser = user?.id === u.id || user?.email === u.email;
                const initials = u.full_name
                  ? u.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                  : "U";

                const cleanPhone = u.phone?.replace(/[^0-9]/g, "");
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[2.25rem] bg-stone-900 border border-stone-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.25)] hover:-translate-y-1.5 group aspect-[3/4.2] flex flex-col justify-between p-5"
                  >
                    {/* Background Image or Artistic Studio Portrait Monogram */}
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name}
                        className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 flex flex-col items-center justify-center pointer-events-none">
                        {/* Ambient Lighting Circle */}
                        <div className="w-36 h-36 rounded-full bg-amber-500/10 blur-2xl absolute" />
                        <div className="w-24 h-24 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-3xl flex items-center justify-center shadow-2xl relative z-10">
                          {initials}
                        </div>
                        <span className="text-[10px] font-mono text-amber-500/60 tracking-widest uppercase mt-3 relative z-10">
                          INSPEKTORAT
                        </span>
                      </div>
                    )}

                    {/* Top Floating Badges (Sesi Anda, Edit & Delete Actions) */}
                    <div className="relative z-20 flex items-center justify-between w-full">
                      {isCurrentUser ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[10px] font-black tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Sesi Anda</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-stone-950/60 border border-white/10 text-stone-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Petugas Aktif</span>
                        </span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="w-8 h-8 rounded-full bg-stone-950/70 backdrop-blur-md border border-white/10 text-stone-300 hover:text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                          title="Edit Profil Petugas"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Delete Button (Only for other users) */}
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmState({
                                isOpen: true,
                                title: "Hapus Akun Petugas",
                                description: `Apakah Anda yakin ingin menghapus akun "${u.full_name}" dari sistem inventaris? Akses pengguna ini akan dicabut secara permanen.`,
                                itemName: u.full_name || "Akun Petugas",
                                onConfirm: async () => {
                                  await deleteUser(u.id);
                                  triggerSaveNotification("Akun pengguna berhasil dihapus!");
                                },
                              });
                            }}
                            className="w-8 h-8 rounded-full bg-stone-950/70 backdrop-blur-md border border-white/10 text-stone-400 hover:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 flex items-center justify-center transition-all shadow-lg cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Frosted Glass Gradient Overlay (Matching the reference layout) */}
                    <div className="relative z-20 -mx-5 -mb-5 p-5 pt-20 bg-gradient-to-t from-stone-950 via-stone-950/90 to-transparent flex flex-col gap-2.5 backdrop-blur-[1px]">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                          <span className="truncate">{u.full_name || "Petugas Logistik"}</span>
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black inline-flex items-center justify-center shrink-0 shadow-md" title="Terverifikasi">
                            ✓
                          </span>
                        </h4>
                        <p className="text-[11px] text-stone-400 font-medium line-clamp-1">
                          Petugas Pengelola Aset & Logistik
                        </p>
                      </div>

                      {/* Bottom Floating Glass Action Pills (like '(312) (48) Follow +') */}
                      <div className="flex items-center gap-2 pt-1">
                        {/* Pill 1: NIP */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-stone-200 text-[10px] font-mono font-bold shadow-inner truncate">
                          <IdCard size={12} className="text-amber-400 shrink-0" />
                          <span className="truncate">{u.nip ? `NIP. ${u.nip}` : "NIP -"}</span>
                        </div>

                        {/* Pill 2: WhatsApp Chat Button / Action */}
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 ml-auto shrink-0 cursor-pointer"
                          >
                            <Phone size={11} />
                            <span>Chat</span>
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-stone-500 text-[10px] ml-auto font-medium">
                            <Phone size={10} />
                            <span>No Kontak</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: MASTER DATA RUANGAN */}
      {activeTab === "ruangan" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Master Data Ruangan (Supabase Live)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Tersinkronisasi langsung dengan tabel <code className="text-amber-600 dark:text-amber-400 font-mono">locations</code> di Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddRoom}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Ruangan Baru</span>
              </button>
            </div>

            {/* Room List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 transition-all group flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-stone-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {loc.name}
                    </p>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block">
                      {loc.floor || "Lantai 1"} · Tersinkron
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRoom(loc)}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Ruangan"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Hapus Master Ruangan",
                          description: `Apakah Anda yakin ingin menghapus ruangan "${loc.name}" dari database Supabase?`,
                          itemName: loc.name,
                          onConfirm: async () => {
                            await deleteLocation(loc.id);
                            triggerSaveNotification("Ruangan berhasil dihapus!");
                          },
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Ruangan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: MASTER KATEGORI BARANG */}
      {activeTab === "kategori" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Master Kategori Aset (Supabase Live)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Tersinkronisasi langsung dengan tabel <code className="text-amber-600 dark:text-amber-400 font-mono">categories</code> di Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddCat}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 transition-all group flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-900 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                      <Boxes size={15} />
                    </div>
                    <p className="font-bold text-stone-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {cat.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditCat(cat)}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Kategori"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Hapus Master Kategori",
                          description: `Apakah Anda yakin ingin menghapus kategori "${cat.name}" dari database Supabase?`,
                          itemName: cat.name,
                          onConfirm: async () => {
                            await deleteCategory(cat.id);
                            triggerSaveNotification("Kategori berhasil dihapus!");
                          },
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 5: MASTER SATUAN BARANG (Dinamis Supabase) */}
      {activeTab === "satuan" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Boxes size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Daftar Satuan Kuantitas Barang ({units.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Master pilihan satuan hitung (Unit, Pcs, Set, Rim, Paket, dll.) yang tersinkronisasi di Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddUnit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Satuan Baru</span>
              </button>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {units.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 transition-all group flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-900 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0 font-bold text-xs">
                      #
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {u.name}
                      </p>
                      {u.description && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {u.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditUnit(u)}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Satuan"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Hapus Master Satuan",
                          description: `Apakah Anda yakin ingin menghapus satuan "${u.name}" dari database Supabase?`,
                          itemName: u.name,
                          onConfirm: async () => {
                            await deleteUnit(u.id);
                            triggerSaveNotification("Satuan barang berhasil dihapus!");
                          },
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Satuan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 6: MASTER SUMBER PENGADAAN (Dinamis Supabase) */}
      {activeTab === "sumber" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Daftar Sumber Pengadaan Aset ({sources.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Master metode/sumber dana pengadaan barang masuk yang tersimpan di Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSource}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Sumber Baru</span>
              </button>
            </div>

            {/* Sources Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 transition-all group flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-900 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                      <Truck size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {s.name}
                      </p>
                      {s.description && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSource(s)}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Sumber Pengadaan"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Hapus Sumber Pengadaan",
                          description: `Apakah Anda yakin ingin menghapus sumber pengadaan "${s.name}" dari database Supabase?`,
                          itemName: s.name,
                          onConfirm: async () => {
                            await deleteSource(s.id);
                            triggerSaveNotification("Sumber pengadaan berhasil dihapus!");
                          },
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Sumber Pengadaan"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 7: MASTER TUJUAN DISTRIBUSI (Dinamis Supabase) */}
      {activeTab === "tujuan" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Daftar Tujuan Distribusi Barang ({purposes.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Master alasan/keperluan pengeluaran dan distribusi barang inventaris ke pegawai/ruangan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddPurpose}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Tujuan Baru</span>
              </button>
            </div>

            {/* Purposes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {purposes.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 transition-all group flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-900 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                      <Send size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPurpose(p)}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Tujuan Distribusi"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Hapus Tujuan Distribusi",
                          description: `Apakah Anda yakin ingin menghapus tujuan distribusi "${p.name}" dari database Supabase?`,
                          itemName: p.name,
                          onConfirm: async () => {
                            await deletePurpose(p.id);
                            triggerSaveNotification("Tujuan distribusi berhasil dihapus!");
                          },
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Tujuan Distribusi"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 8: MASTER STATUS DISTRIBUSI (Dinamis Supabase) */}
      {activeTab === "status_keluar" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Daftar Status Pengeluaran Barang ({statuses.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Master status tahapan atau kondisi hukum distribusi barang keluar di Supabase.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddStatus}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Status Baru</span>
              </button>
            </div>

            {/* Statuses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {statuses.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 transition-all group flex items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-200/80 dark:bg-stone-900 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white text-xs truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {s.name}
                      </p>
                      {s.description && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStatus(s)}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Status"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmState({
                          isOpen: true,
                          title: "Hapus Status Distribusi",
                          description: `Apakah Anda yakin ingin menghapus status "${s.name}" dari database Supabase?`,
                          itemName: s.name,
                          onConfirm: async () => {
                            await deleteStatus(s.id);
                            triggerSaveNotification("Status distribusi berhasil dihapus!");
                          },
                        });
                      }}
                      className="p-2 rounded-lg bg-stone-200/80 dark:bg-stone-900 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Hapus Status"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 9: PREFERENSI STOK & AUTO-CODE */}
      {activeTab === "preferensi" && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSavePreferences}
          className="space-y-6"
        >
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sliders size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Preferensi Stok & Format Kode
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Konfigurasi ambang batas peringatan stok kritis dan awalan kode transaksi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Batas Stok Kritis */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-2">
                <label className="text-xs font-bold text-stone-900 dark:text-white block">
                  Batas Peringatan Stok Kritis (Unit)
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Barang dengan sisa stok sama dengan atau di bawah angka ini akan ditandai dengan badge peringatan merah di seluruh sistem.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={prefData.lowStockThreshold}
                    onChange={(e) => setPrefData({ ...prefData, lowStockThreshold: Number(e.target.value) })}
                    className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs font-bold text-amber-600 dark:text-amber-400 text-center outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Unit Fisik</span>
                </div>
              </div>

              {/* Format Prefix Kode */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 space-y-3">
                <label className="text-xs font-bold text-stone-900 dark:text-white block">
                  Awalan Prefix Kode Dokumen
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Data Barang</span>
                    <input
                      type="text"
                      value={prefData.codePrefixItem}
                      onChange={(e) => setPrefData({ ...prefData, codePrefixItem: e.target.value.toUpperCase() })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 text-center outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Barang Masuk</span>
                    <input
                      type="text"
                      value={prefData.codePrefixIncoming}
                      onChange={(e) => setPrefData({ ...prefData, codePrefixIncoming: e.target.value.toUpperCase() })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 text-center outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Barang Keluar</span>
                    <input
                      type="text"
                      value={prefData.codePrefixOutgoing}
                      onChange={(e) => setPrefData({ ...prefData, codePrefixOutgoing: e.target.value.toUpperCase() })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 text-center outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 transition-all"
              >
                <Save size={16} />
                <span>Simpan Preferensi ke Supabase</span>
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {/* TAB 10: KEAMANAN & AKUN ADMIN */}
      {activeTab === "keamanan" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Akun Admin Profile Card */}
          <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Profil Akun yang Sedang Aktif
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Informasi kredensial pengguna yang sedang login saat ini.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-amber-500 text-stone-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-stone-200 dark:border-white/10 shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : profile?.full_name ? (
                  profile.full_name.charAt(0).toUpperCase()
                ) : (
                  "A"
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                    {profile?.full_name || "Administrator Logistik"}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase">
                    Admin Aktif
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {user?.email || "admin@inspektorat.sumutprov.go.id"}
                </p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500">
                  Hak Akses Penuh (Pengelolaan Aset, Mutasi, dan Laporan)
                </p>
              </div>
            </div>
          </div>

          {/* Form Ganti Password */}
          <form
            onSubmit={handleSavePassword}
            className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-5"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-stone-200/80 dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Ganti Kata Sandi Akun
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Perbarui kata sandi akun login admin untuk meningkatkan keamanan data.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 dark:text-red-400 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ketik ulang kata sandi"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                <Lock size={16} />
                <span>{passwordLoading ? "Menyimpan..." : "Perbarui Kata Sandi"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* MODAL: Tambah Pengguna / Petugas Baru */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Tambah Pengguna / Petugas Baru"
        description="Daftarkan akun login baru untuk petugas pengelola inventaris."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateUser} autoComplete="off" className="space-y-4 pt-2">
          {/* Hidden dummy inputs to trick aggressive browser autofill */}
          <input type="text" style={{ display: "none" }} />
          <input type="password" style={{ display: "none" }} />

          {userFormError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 dark:text-red-400 shrink-0" />
              <span>{userFormError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto Profil Pegawai (Opsional) */}
            <div className="sm:col-span-2 flex items-center gap-4 p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-950/70 border border-stone-200 dark:border-white/5">
              <div className="relative w-16 h-20 rounded-2xl bg-stone-200/80 dark:bg-stone-900 border-2 border-dashed border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {newUserData.avatarPreview ? (
                  <img src={newUserData.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} className="text-amber-500/60" />
                )}
              </div>
              <div className="space-y-1.5 min-w-0">
                <label className="text-[10px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  Foto Profil Pegawai (Opsional)
                </label>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 text-xs font-semibold text-stone-800 dark:text-white cursor-pointer transition-colors shadow-xs">
                  <Upload size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>{newUserData.avatarFile ? "Ganti Foto..." : "Pilih Foto Wajah..."}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setNewUserData({ ...newUserData, avatarFile: file, avatarPreview: previewUrl });
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-stone-500">Format JPG, PNG atau WebP (Foto vertikal portrait)</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                name="new_staff_fullname"
                autoComplete="off"
                placeholder="Contoh: Muhammad Rizky, S.E., M.Si"
                value={newUserData.full_name}
                onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Email Login Akun *
              </label>
              <input
                type="email"
                required
                name="new_staff_email"
                autoComplete="off"
                placeholder="nama@sumutprov.go.id"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Kata Sandi Awal *
              </label>
              <div className="relative">
                <input
                  type={showNewUserPassword ? "text" : "password"}
                  required
                  name="new_staff_password"
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                >
                  {showNewUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                NIP Pegawai
              </label>
              <input
                type="text"
                name="new_staff_nip"
                autoComplete="off"
                placeholder="19840715 200903 1 003"
                value={newUserData.nip || ""}
                onChange={(e) => setNewUserData({ ...newUserData, nip: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Nomor WhatsApp / Telepon
              </label>
              <input
                type="text"
                name="new_staff_phone"
                autoComplete="off"
                placeholder="0812-xxxx-xxxx"
                value={newUserData.phone || ""}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={userFormLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {userFormLoading ? "Mendaftarkan..." : "Daftarkan Pengguna"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Profil Pengguna */}
      <Modal
        isOpen={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        title="Edit Profil Petugas"
        description="Perbarui informasi data diri atau foto profil petugas inventaris."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEditUser} className="space-y-4 pt-2">
          {editUserError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 dark:text-red-400 shrink-0" />
              <span>{editUserError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto Profil Pegawai */}
            <div className="sm:col-span-2 flex items-center gap-4 p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-950/70 border border-stone-200 dark:border-white/5">
              <div className="relative w-16 h-20 rounded-2xl bg-stone-200/80 dark:bg-stone-900 border-2 border-dashed border-amber-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {editUserData.avatarPreview ? (
                  <img src={editUserData.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={22} className="text-amber-500/60" />
                )}
              </div>
              <div className="space-y-1.5 min-w-0">
                <label className="text-[10px] font-black text-stone-700 dark:text-stone-300 uppercase tracking-wider block">
                  Perbarui Foto Profil
                </label>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-stone-200 dark:border-white/10 text-xs font-semibold text-stone-800 dark:text-white cursor-pointer transition-colors shadow-xs">
                  <Upload size={13} className="text-amber-600 dark:text-amber-400" />
                  <span>{editUserData.avatarFile || editUserData.avatarPreview ? "Ganti Foto Baru..." : "Pilih Foto Wajah..."}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setEditUserData({ ...editUserData, avatarFile: file, avatarPreview: previewUrl });
                      }
                    }}
                  />
                </label>
                <p className="text-[10px] text-stone-500">Format JPG, PNG atau WebP (Foto vertikal portrait)</p>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Rizky, S.E., M.Si"
                value={editUserData.full_name}
                onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Email Akun (Terkunci)
              </label>
              <input
                type="email"
                disabled
                value={editUserData.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100/60 dark:bg-stone-950/50 border border-stone-200 dark:border-white/5 text-xs sm:text-sm text-stone-400 dark:text-stone-500 font-mono cursor-not-allowed outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                NIP Pegawai
              </label>
              <input
                type="text"
                placeholder="19840715 200903 1 003"
                value={editUserData.nip}
                onChange={(e) => setEditUserData({ ...editUserData, nip: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Nomor WhatsApp / Telepon
              </label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={editUserData.phone}
                onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setEditUserModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={editUserLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {editUserLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah/Edit Ruangan */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={editingRoomId ? "Edit Data Ruangan" : "Tambah Ruangan Baru"}
        description="Masukkan nama ruangan penyimpanan aset di Inspektorat."
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Nama Ruangan / Unit Kerja *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ruang Irban I (Pemerintahan)"
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Lantai / Gedung
            </label>
            <input
              type="text"
              placeholder="Contoh: Lantai 1 / Gedung Utama"
              value={roomFloorInput}
              onChange={(e) => setRoomFloorInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setRoomModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simpan ke Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah/Edit Kategori */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCatId ? "Edit Kategori Aset" : "Tambah Kategori Aset Baru"}
        description="Masukkan nama kategori kelompok barang inventaris."
      >
        <form onSubmit={handleSaveCat} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Nama Kategori *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Elektronik & Komputer"
              value={catNameInput}
              onChange={(e) => setCatNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCatModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simpan ke Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah/Edit Sumber Pengadaan */}
      <Modal
        isOpen={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        title={editingSourceId ? "Edit Sumber Pengadaan" : "Tambah Sumber Pengadaan Baru"}
        description="Masukkan nama metode pengadaan atau sumber dana barang masuk."
      >
        <form onSubmit={handleSaveSource} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Nama Sumber Pengadaan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Dana Alokasi Khusus (DAK)"
              value={sourceNameInput}
              onChange={(e) => setSourceNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Keterangan / Deskripsi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pengadaan bersumber dari dana transfer pusat"
              value={sourceDescInput}
              onChange={(e) => setSourceDescInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setSourceModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simpan ke Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah/Edit Tujuan Distribusi */}
      <Modal
        isOpen={purposeModalOpen}
        onClose={() => setPurposeModalOpen(false)}
        title={editingPurposeId ? "Edit Tujuan Distribusi" : "Tambah Tujuan Distribusi Baru"}
        description="Masukkan nama alasan/keperluan pengeluaran dan distribusi barang inventaris."
      >
        <form onSubmit={handleSavePurpose} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Nama Tujuan Distribusi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Operasional Audit Lapangan / Bimbingan Teknis"
              value={purposeNameInput}
              onChange={(e) => setPurposeNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Keterangan / Deskripsi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Digunakan untuk keperluan dinas luar atau pelatihan"
              value={purposeDescInput}
              onChange={(e) => setPurposeDescInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setPurposeModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simpan ke Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Tambah/Edit Status Pengeluaran */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={editingStatusId ? "Edit Status Pengeluaran" : "Tambah Status Pengeluaran Baru"}
        description="Masukkan nama status alur penyerahan atau kondisi distribusi barang keluar."
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Nama Status Pengeluaran *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Didistribusikan / Dipinjam / Dilelang"
              value={statusNameInput}
              onChange={(e) => setStatusNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Keterangan / Deskripsi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Barang diserahkan secara permanen ke ruangan/pegawai"
              value={statusDescInput}
              onChange={(e) => setStatusDescInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simpan ke Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. MODAL TAMBAH / EDIT MASTER SATUAN BARANG */}
      <Modal
        isOpen={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title={editingUnitId ? "Edit Satuan Barang" : "Tambah Satuan Barang Baru"}
        description="Masukkan nama satuan kuantitas barang (misal: Unit, Pcs, Set, Rim, Lembar, Meter)."
      >
        <form onSubmit={handleSaveUnit} className="space-y-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Nama Satuan Barang *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Unit / Pcs / Set / Rim / Botol"
              value={unitNameInput}
              onChange={(e) => setUnitNameInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
              Keterangan / Penggunaan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Satuan untuk perangkat keras komputer dan laptop"
              value={unitDescInput}
              onChange={(e) => setUnitDescInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setUnitModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simpan ke Supabase
            </button>
          </div>
        </form>
      </Modal>

      {/* GLOBAL CUSTOM DELETE CONFIRMATION MODAL (NO NATIVE BROWSER CONFIRM) */}
      <Modal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
        title={deleteConfirmState.title}
        description="Konfirmasi Penghapusan Data"
      >
        <div className="space-y-5 pt-1">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-600 dark:text-rose-300">
                Tindakan Tidak Dapat Dibatalkan
              </h4>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {deleteConfirmState.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={async () => {
                try {
                  setIsDeleting(true);
                  await deleteConfirmState.onConfirm();
                  setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
                } finally {
                  setIsDeleting(false);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Ya, Hapus Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
