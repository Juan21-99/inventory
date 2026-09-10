"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface ItemUnit {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
}

export function useUnits() {
  const [units, setUnits] = useState<ItemUnit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch item units directly from Supabase table 'item_units'
  const fetchUnits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("item_units")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) {
        setUnits(data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn("Notice fetching item units from Supabase:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("item_units")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (!ignore && data) {
          setUnits(data);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Notice fetching item units from Supabase:", errorMsg);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    const channelId = `units-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "item_units" },
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

  // Add item unit to Supabase
  const addUnit = async (name: string, description?: string) => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Nama satuan barang wajib diisi.");

    const { data, error } = await supabase
      .from("item_units")
      .insert([{ name: cleanName, description: description?.trim() || null }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setUnits((prev) => [...prev.filter((u) => u.id !== data.id), data]);
      return data;
    }
  };

  // Update unit in Supabase
  const updateUnit = async (id: string, updates: Partial<ItemUnit>) => {
    const { error } = await supabase
      .from("item_units")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  // Delete unit from Supabase
  const deleteUnit = async (id: string) => {
    const { error } = await supabase
      .from("item_units")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  return {
    units,
    loading,
    fetchUnits,
    addUnit,
    updateUnit,
    deleteUnit,
  };
}
