"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { LocationRoom } from "../../types/item.types";

export function useLocations() {
  const [locations, setLocations] = useState<LocationRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch locations directly from Supabase table 'locations'
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) setLocations(data);
    } catch (err) {
      console.error("Error fetching locations from Supabase:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();

    const channelId = `locations-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locations" },
        () => {
          fetchLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLocations]);

  // Add location to Supabase
  const addLocation = async (dataOrName: string | { name: string; floor?: string; description?: string }, floor?: string) => {
    const name = typeof dataOrName === "string" ? dataOrName.trim() : dataOrName.name.trim();
    const fl = typeof dataOrName === "string" ? floor?.trim() : dataOrName.floor?.trim();
    const desc = typeof dataOrName === "string" ? "" : dataOrName.description?.trim();

    const { data, error } = await supabase
      .from("locations")
      .insert([{ name, floor: fl || "Lantai 1", description: desc || null }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      setLocations((prev) => [...prev.filter((l) => l.id !== data.id), data]);
      return data;
    }
  };

  // Update location in Supabase
  const updateLocation = async (id: string, updates: Partial<LocationRoom>) => {
    const { error } = await supabase
      .from("locations")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  // Delete location from Supabase
  const deleteLocation = async (id: string) => {
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  return {
    locations,
    loading,
    fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
  };
}
