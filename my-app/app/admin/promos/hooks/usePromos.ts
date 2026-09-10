import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Promo } from "../../types/promo.types";

export const usePromos = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching promos:", error);
        toast.error("Gagal memuat promo");
      } else {
        setPromos(data as Promo[]);
      }
      setLoading(false);
    };

    fetchPromos();

    const channel = supabase
      .channel("promos_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promos" },
        () => {
          fetchPromos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const togglePromoStatus = async (
    id: string,
    currentStatus: boolean,
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("promos")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Promo ${currentStatus ? "dinonaktifkan" : "diaktifkan"}`);
    } catch (error) {
      console.error("Error toggling promo status:", error);
      toast.error("Gagal mengubah status promo");
      throw error;
    }
  };

  const deletePromo = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("promos").delete().eq("id", id);
      if (error) throw error;
      toast.success("Promo berhasil dihapus");
    } catch (error) {
      console.error("Error deleting promo:", error);
      toast.error("Gagal menghapus promo");
      throw error;
    }
  };

  return {
    promos,
    loading,
    togglePromoStatus,
    deletePromo,
  };
};
