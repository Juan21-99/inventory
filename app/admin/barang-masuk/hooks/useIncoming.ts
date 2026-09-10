"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, uploadProductImage } from "@/lib/supabase";
import { IncomingTransaction, IncomingFormData } from "../../types/incoming.types";

export function useIncoming() {
  const [incoming, setIncoming] = useState<IncomingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions directly from Supabase table 'incoming_transactions'
  const fetchIncoming = useCallback(async () => {
    try {
      const { data, error: sbError } = await supabase
        .from("incoming_transactions")
        .select("*")
        .order("date", { ascending: false });

      if (sbError) {
        throw sbError;
      }

      if (data) {
        setIncoming(data);
      }
    } catch (err: unknown) {
      console.error("Error fetching incoming transactions from Supabase:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data barang masuk.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to Realtime Postgres Changes
  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const { data, error: sbError } = await supabase
          .from("incoming_transactions")
          .select("*")
          .order("date", { ascending: false });

        if (sbError) throw sbError;

        if (data && !ignore) {
          setIncoming(data);
        }
      } catch (err: unknown) {
        console.error("Error fetching incoming transactions from Supabase:", err);
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Gagal memuat data barang masuk.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    const channelId = `incoming-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incoming_transactions" },
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

  // Add new incoming transaction to Supabase
  const addIncoming = async (formData: IncomingFormData): Promise<IncomingTransaction> => {
    let proofImageUrl = formData.proofImageUrl || null;

    if (formData.proofImageFile) {
      const uploaded = await uploadProductImage(formData.proofImageFile);
      if (uploaded) proofImageUrl = uploaded;
    }

    const pricePerUnit = Number(formData.unit_price ?? formData.price_per_unit) || 0;
    const quantity = Number(formData.quantity) || 1;
    const totalPrice = pricePerUnit * quantity;

    let itemId = formData.item_id || null;

    // 1. If no item_id selected (user input a new item in Barang Masuk via Input Manual),
    // automatically create master item in `items` table so it immediately appears in Inventaris Gudang
    if (!itemId && formData.item_code.trim()) {
      const { data: existingItem } = await supabase
        .from("items")
        .select("id, stock")
        .eq("code", formData.item_code.trim())
        .maybeSingle();

      if (existingItem) {
        itemId = existingItem.id;
      } else {
        const itemPayload: Record<string, unknown> = {
          code: formData.item_code.trim().toUpperCase(),
          name: formData.item_name.trim(),
          category_name: formData.category,
          category: formData.category,
          stock: 0,
          unit: formData.unit || "Unit",
          condition: "Baik",
          location_name: formData.target_location,
          location: formData.target_location,
          person_in_charge: formData.received_by.trim(),
          price: pricePerUnit,
          received_at: formData.date || new Date().toISOString().split("T")[0],
          description: formData.notes?.trim() || null,
          image_url: proofImageUrl || null,
        };

        const { data: newItem, error: newItemErr } = await supabase
          .from("items")
          .insert([itemPayload])
          .select()
          .single();

        if (newItemErr) {
          console.warn("Retrying item insertion with standard schema columns:", newItemErr.message);
          const fallbackPayload = {
            code: formData.item_code.trim().toUpperCase(),
            name: formData.item_name.trim(),
            category_name: formData.category,
            stock: 0,
            unit: formData.unit || "Unit",
            condition: "Baik",
            location_name: formData.target_location,
            person_in_charge: formData.received_by.trim(),
            price: pricePerUnit,
            received_at: formData.date || new Date().toISOString().split("T")[0],
            description: formData.notes?.trim() || null,
            image_url: proofImageUrl || null,
          };
          const { data: retryItem, error: retryErr } = await supabase
            .from("items")
            .insert([fallbackPayload])
            .select()
            .single();

          if (!retryErr && retryItem) {
            itemId = retryItem.id;
          } else if (retryErr) {
            console.error("Critical: Failed to auto-create item in items table:", retryErr);
          }
        } else if (newItem) {
          itemId = newItem.id;
        }
      }
    }

    // 2. Insert incoming transaction record
    const payload = {
      transaction_number: formData.transaction_number.trim().toUpperCase(),
      date: formData.date || new Date().toISOString().split("T")[0],
      item_id: itemId,
      item_code: formData.item_code.trim(),
      item_name: formData.item_name.trim(),
      category: formData.category,
      quantity,
      unit: formData.unit || "Unit",
      price_per_unit: pricePerUnit,
      total_price: totalPrice,
      source: formData.source,
      supplier: formData.supplier.trim(),
      target_location: formData.target_location,
      received_by: formData.received_by.trim(),
      document_number: formData.document_number?.trim() || null,
      notes: formData.notes?.trim() || null,
      proof_image_url: proofImageUrl,
    };

    const { data, error: insertErr } = await supabase
      .from("incoming_transactions")
      .insert([payload])
      .select()
      .single();

    if (insertErr) {
      throw insertErr;
    }

    // Stock is automatically synchronized via Supabase database trigger (tr_on_incoming_transaction).
    // Master item price in Gudang remains fixed; transaction purchase price is preserved in incoming_transactions.
    setIncoming((prev) => [data, ...prev.filter((i) => i.id !== data.id)]);
    return data;
  };

  // Delete transaction from Supabase and rollback stock
  const deleteIncoming = async (id: string): Promise<boolean> => {
    const targetTx = incoming.find((t) => t.id === id);

    // Rollback stock in `items` table if item_id exists
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
            stock: Math.max(0, (it.stock || 0) - (targetTx.quantity || 0)),
            updated_at: new Date().toISOString(),
          })
          .eq("id", it.id);
      }
    }

    const { error: delErr } = await supabase.from("incoming_transactions").delete().eq("id", id);
    if (delErr) {
      throw delErr;
    }
    setIncoming((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  return {
    incoming,
    loading,
    error,
    fetchIncoming,
    addIncoming,
    deleteIncoming,
  };
}
