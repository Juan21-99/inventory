"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface OutgoingStatusItem {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function useStatuses() {
  const [statuses, setStatuses] = useState<OutgoingStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch statuses directly from Supabase table 'outgoing_statuses'
  const fetchStatuses = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("outgoing_statuses")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) {
        setStatuses(data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Notice fetching outgoing statuses from Supabase:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("outgoing_statuses")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (!ignore && data) {
          setStatuses(data);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Notice fetching outgoing statuses from Supabase:", errorMsg);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    const channelId = `statuses-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outgoing_statuses" },
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

  // Add outgoing status to Supabase
  const addStatus = async (name: string, description?: string) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Nama status pengeluaran wajib diisi.");

    const { data, error } = await supabase
      .from("outgoing_statuses")
      .insert([{ name: cleanName, description: description?.trim() || null }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setStatuses((prev) => [...prev.filter((s) => s.id !== data.id), data]);
      return data;
    }
  };

  // Update status in Supabase
  const updateStatus = async (id: string, updates: Partial<OutgoingStatusItem>) => {
    const { error } = await supabase
      .from("outgoing_statuses")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    setStatuses((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Delete status from Supabase
  const deleteStatus = async (id: string) => {
    const { error } = await supabase
      .from("outgoing_statuses")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setStatuses((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    statuses,
    loading,
    fetchStatuses,
    addStatus,
    updateStatus,
    deleteStatus,
  };
}
