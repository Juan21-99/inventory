import { useState, useEffect } from "react";
import { uploadPromoImage } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Promo,
  PromoFormData,
  INITIAL_PROMO_DATA,
} from "../../types/promo.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const usePromoForm = () => {
  const [formData, setFormData] = useState<PromoFormData>(INITIAL_PROMO_DATA);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const setEditMode = (promo: Promo) => {
    setEditingId(promo.id);
    setFormData({
      title: promo.title,
      description: promo.description,
      badge: promo.badge,
      color_gradient: promo.color_gradient,
      image_url: promo.image_url,
      imageFile: null,
    });
    setImagePreview(promo.image_url);
  };

  const resetForm = () => {
    setFormData(INITIAL_PROMO_DATA);
    setEditingId(null);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const updateField = (
    field: keyof PromoFormData,
    value: PromoFormData[keyof PromoFormData],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(editingId ? formData.image_url : null);
      updateField("imageFile", null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    updateField("imageFile", file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!formData.imageFile) return formData.image_url;

    try {
      const uploadedUrl = await uploadPromoImage(formData.imageFile);
      return uploadedUrl;
    } catch (error) {
      console.error("Error uploading promo image:", error);
      toast.error("Gagal mengupload gambar");
      return null;
    }
  };

  return {
    formData,
    editingId,
    isSubmitting,
    setIsSubmitting,
    imagePreview,
    setEditMode,
    resetForm,
    updateField,
    handleFileSelect,
    uploadImage,
  };
};
