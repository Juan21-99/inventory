"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, uploadProductImage } from "@/lib/supabase";
import { OutgoingTransaction, OutgoingFormData } from "../../types/outgoing.types";

export function useOutgoing() {
  const [outgoing, setOutgoing] = useState<OutgoingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions directly from Supabase table 'outgoing_transactions'
  const fetchOutgoing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from("outgoing_transactions")
        .select("*")
        .order("date", { ascending: false });

      if (sbError) {
        throw sbError;
      }

      if (data) {
        setOutgoing(data);
      }
    } catch (err: unknown) {
      console.error("Error fetching outgoing transactions from Supabase:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data barang keluar.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to Realtime Postgres Changes
  useEffect(() => {
    fetchOutgoing();

    const channelId = `outgoing-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "outgoing_transactions" },
        () => {
          fetchOutgoing();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOutgoing]);

  // Add new outgoing transaction to Supabase
  const addOutgoing = async (formData: OutgoingFormData): Promise<OutgoingTransaction> => {
    let proofImageUrl = formData.proofImageUrl || null;

    if (formData.proofImageFile) {
      const uploaded = await uploadProductImage(formData.proofImageFile);
      if (uploaded) proofImageUrl = uploaded;
    }

    const payload = {
      transaction_number: formData.transaction_number.trim().toUpperCase(),
      date: formData.date || new Date().toISOString().split("T")[0],
      item_id: formData.item_id || null,
      item_code: formData.item_code.trim(),
      item_name: formData.item_name.trim(),
      category: formData.category,
      quantity: Number(formData.quantity) || 1,
      unit: formData.unit || "Unit",
      purpose: formData.purpose,
      target_location: formData.target_location,
      recipient_name: formData.recipient_name.trim(),
      recipient_nip: formData.recipient_nip?.trim() || null,
      officer_name: formData.officer_name.trim(),
      status: formData.status,
      document_number: formData.document_number?.trim() || null,
      notes: formData.notes?.trim() || null,
      proof_image_url: proofImageUrl,
    };

    const { data, error: insertErr } = await supabase
      .from("outgoing_transactions")
      .insert([payload])
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    // Stock is automatically synchronized via Supabase database trigger (tr_on_outgoing_transaction)
    setOutgoing((prev) => [data, ...prev.filter((i) => i.id !== data.id)]);
    return data;
  };

  // Delete transaction from Supabase and restore stock
  const deleteOutgoing = async (id: string): Promise<boolean> => {
    const targetTx = outgoing.find((t) => t.id === id);

    // Restore stock in `items` table if item_id exists
    if (targetTx && (targetTx.item_id || targetTx.item_code)) {
      const { data: it } = await supabase
        .from("items")
        .select("id, stock")
        .or(targetTx.item_id ? `id.eq.${targetTx.item_id},code.eq.${targetTx.item_code}` : `code.eq.${targetTx.item_code}`)
        .maybeSingle();

      if (it) {
        await supabase
          .from("items")
          .update({
            stock: (it.stock || 0) + (targetTx.quantity || 0),
            updated_at: new Date().toISOString(),
          })
          .eq("id", it.id);
      }
    }

    const { error: delErr } = await supabase.from("outgoing_transactions").delete().eq("id", id);
    if (delErr) {
      throw delErr;
    }
    setOutgoing((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  return {
    outgoing,
    loading,
    error,
    fetchOutgoing,
    addOutgoing,
    deleteOutgoing,
  };
}
