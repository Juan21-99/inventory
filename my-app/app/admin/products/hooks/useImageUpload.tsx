import { useState, useEffect } from "react";
import { uploadProductImage } from "@/lib/supabase";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const useImageUpload = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      resetImage();
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (!uploadedUrl) {
        toast.error("Gagal mengupload gambar");
        return null;
      }
      return uploadedUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload gambar");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const resetImage = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
  };

  const setExistingImage = (url: string) => {
    setImagePreview(url);
    setImageFile(null);
  };

  return {
    imagePreview,
    imageFile,
    uploading,
    handleFileSelect,
    uploadImage,
    resetImage,
    setExistingImage,
  };
};
