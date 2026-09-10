"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface DistributionPurposeItem {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function usePurposes() {
  const [purposes, setPurposes] = useState<DistributionPurposeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch purposes directly from Supabase table 'distribution_purposes'
  const fetchPurposes = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("distribution_purposes")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) {
        setPurposes(data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Notice fetching distribution purposes from Supabase:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("distribution_purposes")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (!ignore && data) {
          setPurposes(data);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Notice fetching distribution purposes from Supabase:", errorMsg);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    const channelId = `purposes-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "distribution_purposes" },
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

  // Add distribution purpose to Supabase
  const addPurpose = async (name: string, description?: string) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Nama tujuan distribusi wajib diisi.");

    const { data, error } = await supabase
      .from("distribution_purposes")
      .insert([{ name: cleanName, description: description?.trim() || null }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setPurposes((prev) => [...prev.filter((p) => p.id !== data.id), data]);
      return data;
    }
  };

  // Update distribution purpose in Supabase
  const updatePurpose = async (id: string, updates: Partial<DistributionPurposeItem>) => {
    const { error } = await supabase
      .from("distribution_purposes")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    setPurposes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Delete distribution purpose from Supabase
  const deletePurpose = async (id: string) => {
    const { error } = await supabase
      .from("distribution_purposes")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setPurposes((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    purposes,
    loading,
    fetchPurposes,
    addPurpose,
    updatePurpose,
    deletePurpose,
  };
}
