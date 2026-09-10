"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, uploadAvatar, deleteStorageFile } from "@/lib/supabase";

export interface SystemUser {
  id: string;
  full_name: string;
  email: string | null;
  nip: string | null;
  phone: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  nip?: string;
  phone?: string;
  avatar_url?: string | null;
  avatarFile?: File | null;
}

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from Supabase profiles table
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error: sbErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbErr) throw sbErr;
      if (data) {
        setUsers(data);
      }
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to Realtime Postgres Changes on profiles table
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data, error: sbErr } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (sbErr) throw sbErr;
        if (data && !ignore) {
          setUsers(data);
        }
      } catch (err: unknown) {
        console.error("Error fetching users:", err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal memuat data pengguna.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    const channelId = `profiles-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Create new user account via API
  const addUser = async (userData: CreateUserData): Promise<SystemUser> => {
    let uploadedAvatarUrl = userData.avatar_url || null;

    if (userData.avatarFile) {
      const uploaded = await uploadAvatar(userData.avatarFile, `user-${Date.now()}`);
      if (uploaded) uploadedAvatarUrl = uploaded;
    }

    const payload = {
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name,
      nip: userData.nip,
      phone: userData.phone,
      avatar_url: uploadedAvatarUrl,
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Gagal membuat pengguna baru.");
    }

    await fetchUsers();
    return result.user;
  };

  // Update user profile with optional avatar upload
  const updateUser = async (
    id: string,
    updates: Partial<SystemUser>,
    avatarFile?: File | null
  ) => {
    const existingUser = users.find((u) => u.id === id);
    const finalUpdates = { ...updates };

    if (avatarFile) {
      const uploaded = await uploadAvatar(avatarFile, `user-${id}-${Date.now()}`);
      if (uploaded) {
        if (existingUser?.avatar_url && existingUser.avatar_url !== uploaded) {
          await deleteStorageFile(existingUser.avatar_url, "avatars");
        }
        finalUpdates.avatar_url = uploaded;
      }
    }

    const { error: updateErr } = await supabase
      .from("profiles")
      .update(finalUpdates)
      .eq("id", id);

    if (updateErr) throw updateErr;

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...finalUpdates } : u))
    );
    return finalUpdates;
  };

  // Delete user account
  const deleteUser = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.avatar_url) {
      await deleteStorageFile(targetUser.avatar_url, "avatars");
    }

    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Gagal menghapus pengguna.");
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  };
}
