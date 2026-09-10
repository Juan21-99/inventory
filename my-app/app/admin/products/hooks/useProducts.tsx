import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Product } from "../../types/product.types";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat produk");
    } else {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (
    data: Omit<Product, "id" | "created_at">,
  ): Promise<void> => {
    try {
      const { error } = await supabase.from("products").insert([data]);
      if (error) throw error;
      toast.success("Produk berhasil ditambahkan");
      fetchProducts(); // Auto refresh
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Gagal menambahkan produk");
      throw error;
    }
  };

  const updateProduct = async (
    id: string,
    data: Partial<Product>,
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("products")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      toast.success("Produk berhasil diperbarui");
      fetchProducts(); // Auto refresh
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Gagal memperbarui produk");
      throw error;
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Produk berhasil dihapus");
      fetchProducts(); // Auto refresh
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Gagal menghapus produk");
      throw error;
    }
  };

  const toggleProductStatus = async (
    id: string,
    currentStatus: boolean,
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Produk ${currentStatus ? "dinonaktifkan" : "diaktifkan"}`);
      fetchProducts(); // Auto refresh
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast.error("Gagal mengubah status produk");
      throw error;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
  };
};
