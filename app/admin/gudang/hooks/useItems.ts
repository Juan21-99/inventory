"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, uploadProductImage } from "@/lib/supabase";
import { InventoryItem, ItemFormData } from "../../types/item.types";

export function useItems() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items directly from Supabase table 'items'
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (sbError) {
        throw sbError;
      }

      if (data) {
        // Map database fields to application state
        const mappedItems: InventoryItem[] = data.map((item: any) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          category: item.category_name || item.category || "Elektronik",
          stock: item.stock || 0,
          unit: item.unit || "Unit",
          condition: item.condition || "Baik",
          location: item.location_name || item.location || "Ruang Inspektur",
          person_in_charge: item.person_in_charge || "",
          received_at: item.received_at || new Date().toISOString().split("T")[0],
          price: Number(item.price) || 0,
          image_url: item.image_url || null,
          notes: item.description || null,
          created_at: item.created_at,
        }));
        setItems(mappedItems);
      }
    } catch (err: unknown) {
      console.error("Error fetching items from Supabase:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data aset.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to Realtime Postgres Changes
  useEffect(() => {
    fetchItems();

    const channelId = `items-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  // Add new item to Supabase
  const addItem = async (formData: ItemFormData): Promise<InventoryItem> => {
    let imageUrl = formData.imageUrl || null;

    if (formData.imageFile) {
      const uploaded = await uploadProductImage(formData.imageFile);
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      category_name: formData.category,
      stock: Number(formData.stock) || 1,
      unit: formData.unit || "Unit",
      condition: formData.condition,
      location_name: formData.location,
      person_in_charge: formData.person_in_charge.trim(),
      received_at: formData.received_at || new Date().toISOString().split("T")[0],
      price: Number(formData.price) || 0,
      image_url: imageUrl,
      description: formData.notes?.trim() || null,
    };

    const { data, error: insertErr } = await supabase
      .from("items")
      .insert([payload])
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    const createdItem: InventoryItem = {
      id: data.id,
      code: data.code,
      name: data.name,
      category: data.category_name || formData.category,
      stock: data.stock,
      unit: data.unit,
      condition: data.condition,
      location: data.location_name || formData.location,
      person_in_charge: data.person_in_charge,
      received_at: data.received_at,
      price: data.price,
      image_url: data.image_url,
      notes: data.description,
      created_at: data.created_at,
    };

    setItems((prev) => [createdItem, ...prev.filter((i) => i.id !== createdItem.id)]);
    return createdItem;
  };

  // Update existing item in Supabase
  const updateItem = async (id: string, formData: ItemFormData): Promise<InventoryItem> => {
    let imageUrl = formData.imageUrl || null;

    if (formData.imageFile) {
      const uploaded = await uploadProductImage(formData.imageFile);
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      category_name: formData.category,
      stock: Number(formData.stock) || 0,
      unit: formData.unit || "Unit",
      condition: formData.condition,
      location_name: formData.location,
      person_in_charge: formData.person_in_charge.trim(),
      received_at: formData.received_at || new Date().toISOString().split("T")[0],
      price: Number(formData.price) || 0,
      image_url: imageUrl,
      description: formData.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error: updateErr } = await supabase
      .from("items")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      throw updateErr;
    }

    const updatedItem: InventoryItem = {
      id: data.id,
      code: data.code,
      name: data.name,
      category: data.category_name || formData.category,
      stock: data.stock,
      unit: data.unit,
      condition: data.condition,
      location: data.location_name || formData.location,
      person_in_charge: data.person_in_charge,
      received_at: data.received_at,
      price: data.price,
      image_url: data.image_url,
      notes: data.description,
    };

    setItems((prev) => prev.map((it) => (it.id === id ? updatedItem : it)));
    return updatedItem;
  };

  // Delete item from Supabase
  const deleteItem = async (id: string): Promise<boolean> => {
    const { error: delErr } = await supabase.from("items").delete().eq("id", id);
    if (delErr) {
      throw delErr;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
    return true;
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
  };
}
