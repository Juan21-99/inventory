import { useState } from "react";
import {
  ProductFormData,
  INITIAL_FORM_DATA,
  Product,
} from "../../types/product.types";
import { validatePrices } from "../../utils/price.utils";
import { useImageUpload } from "./useImageUpload";

export const useProductForm = () => {
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageUpload = useImageUpload();

  const setEditMode = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      originalPrice:
        product.original_price && product.original_price > 0
          ? product.original_price.toString()
          : "",
      category: product.category,
      category_id: product.category_id || "",
      imageUrl: product.image_url,
      imageFile: null,
      stock: product.stock.toString(),
    });
    imageUpload.setExistingImage(product.image_url);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    imageUpload.resetImage();
  };

  const updateField = (
    field: keyof ProductFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value.toString() }));
  };

  const validateForm = (): { valid: boolean; error?: string } => {
    if (!formData.category_id) {
      return { valid: false, error: "Silakan pilih kategori produk" };
    }

    const price = Number(formData.price);
    const originalPrice = formData.originalPrice
      ? Number(formData.originalPrice)
      : 0;

    return validatePrices(price, originalPrice);
  };

  return {
    formData,
    editingId,
    isSubmitting,
    setIsSubmitting,
    setEditMode,
    resetForm,
    updateField,
    validateForm,
    imageUpload,
  };
};
