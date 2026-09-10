"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface ProcurementSourceItem {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function useSources() {
  const [sources, setSources] = useState<ProcurementSourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sources directly from Supabase table 'procurement_sources'
  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("procurement_sources")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) {
        setSources(data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (err as any)?.message || JSON.stringify(err);
      console.warn("Notice fetching procurement sources from Supabase:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();

    const channelId = `sources-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "procurement_sources" },
        () => {
          fetchSources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSources]);

  // Add procurement source to Supabase
  const addSource = async (name: string, description?: string) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Nama sumber pengadaan wajib diisi.");

    const { data, error } = await supabase
      .from("procurement_sources")
      .insert([{ name: cleanName, description: description?.trim() || null }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setSources((prev) => [...prev.filter((s) => s.id !== data.id), data]);
      return data;
    }
  };

  // Update source in Supabase
  const updateSource = async (id: string, updates: Partial<ProcurementSourceItem>) => {
    const { error } = await supabase
      .from("procurement_sources")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Delete source from Supabase
  const deleteSource = async (id: string) => {
    const { error } = await supabase
      .from("procurement_sources")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    sources,
    loading,
    fetchSources,
    addSource,
    updateSource,
    deleteSource,
  };
}
