"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "../../types/item.types";

// Helper to clean malformed JSON names if any were stored
export function cleanCategoryName(rawName: unknown): string {
  if (!rawName) return "-";
  if (typeof rawName === "object" && rawName !== null && "name" in rawName) {
    const obj = rawName as { name?: unknown };
    return typeof obj.name === "string" ? obj.name : JSON.stringify(rawName);
  }
  const str = String(rawName).trim();
  if (str.startsWith('{"name":') || (str.startsWith("{") && str.endsWith("}"))) {
    try {
      const parsed: unknown = JSON.parse(str);
      if (parsed && typeof parsed === "object" && "name" in parsed) {
        const nameVal = (parsed as { name?: unknown }).name;
        if (typeof nameVal === "string") return nameVal;
      }
    } catch {
      // Keep as is
    }
  }
  return str;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories directly from Supabase table 'categories'
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) {
        // Clean any accidental JSON-encoded names
        const sanitized = data.map((c) => ({
          ...c,
          name: cleanCategoryName(c.name),
        }));
        setCategories(sanitized);
      }
    } catch (err) {
      console.error("Error fetching categories from Supabase:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (!ignore && data) {
          const sanitized = data.map((c) => ({
            ...c,
            name: cleanCategoryName(c.name),
          }));
          setCategories(sanitized);
        }
      } catch (err) {
        console.error("Error fetching categories from Supabase:", err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    const channelId = `categories-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
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

  // Add category to Supabase (robust against string or object parameter)
  const addCategory = async (nameOrObj: string | { name: string; description?: string }, description?: string) => {
    let cleanName = "";
    let desc: string | null = description?.trim() || null;

    if (typeof nameOrObj === "string") {
      cleanName = cleanCategoryName(nameOrObj);
    } else if (typeof nameOrObj === "object" && nameOrObj !== null) {
      cleanName = cleanCategoryName(nameOrObj.name);
      if (nameOrObj.description) desc = nameOrObj.description.trim();
    }

    if (!cleanName) throw new Error("Nama kategori wajib diisi.");

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: cleanName, description: desc }])
      .select()
      .single();

    if (error) throw error;

    if (data) {
      const sanitized = { ...data, name: cleanCategoryName(data.name) };
      setCategories((prev) => [...prev.filter((c) => c.id !== sanitized.id), sanitized]);
      return sanitized;
    }
  };

  // Update category in Supabase
  const updateCategory = async (id: string, updates: Partial<Category> | { name: string }) => {
    const finalUpdates: Partial<Category> = { ...updates };
    if (finalUpdates.name) {
      finalUpdates.name = cleanCategoryName(finalUpdates.name);
    }

    const { error } = await supabase
      .from("categories")
      .update(finalUpdates)
      .eq("id", id);

    if (error) throw error;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...finalUpdates } : c)));
  };

  // Delete category from Supabase
  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
