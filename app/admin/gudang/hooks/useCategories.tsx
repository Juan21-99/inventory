import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    // Listen for realtime changes
    const channelId = `categories_changes_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        (payload) => {
          console.log(
            `[REALTIME] ${channelId} - Category Change Detected:`,
            payload,
          );
          fetchCategories();
        },
      )
      .subscribe((status) => {
        console.log(`[REALTIME] ${channelId} - Subscription Status:`, status);
      });

    return () => {
      console.log(`[REALTIME] ${channelId} - Unsubscribing`);
      supabase.removeChannel(channel);
    };
  }, [fetchCategories]);

  const addCategory = async (name: string) => {
    try {
      const { error } = await supabase.from("categories").insert([{ name }]);
      if (error) throw error;
      // Manually trigger fetch for the current user for snappy UX
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Check if any products are using this category
      const { count, error: checkError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", id);

      if (checkError) throw checkError;

      if (count && count > 0) {
        throw new Error(
          `Tidak bisa menghapus: Ada ${count} produk yang masih menggunakan kategori ini.`,
        );
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      // Manually trigger fetch
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
};
