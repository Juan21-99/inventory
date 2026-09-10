"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface SystemSettingsData {
  id?: string;
  institution_name: string;
  sub_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  head_officer: string;
  head_nip: string;
  head_position: string;
  min_stock_alert: number;
  auto_code_prefix: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettingsData>({
    institution_name: "",
    sub_name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    head_officer: "",
    head_nip: "",
    head_position: "",
    min_stock_alert: 5,
    auto_code_prefix: "INV-",
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        setSettings({
          id: data.id,
          institution_name: data.institution_name || "",
          sub_name: data.sub_name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          head_officer: data.head_officer || "",
          head_nip: data.head_nip || "",
          head_position: data.head_position || "Pejabat Penatausahaan Pengguna Barang",
          min_stock_alert: Number(data.min_stock_alert) || 5,
          auto_code_prefix: data.auto_code_prefix || "INV-",
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (err as any)?.message || JSON.stringify(err);
      console.warn("Notice fetching system settings:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const channelId = `settings-sync-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings" },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return {
    settings,
    loading,
    fetchSettings,
  };
}
