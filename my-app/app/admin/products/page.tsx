"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useProducts } from "./hooks/useProducts";
import { useProductForm } from "./hooks/useProductForm";
import { useCategories } from "./hooks/useCategories";
import { ProductFilters } from "../components/ProductFilters";
import { ProductGrid } from "../components/ProductGrid";
import { ProductForm } from "../components/ProductForm";
import { CategoryManagementModal } from "../components/CategoryManagementModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { Product } from "../types/product.types";

import { supabase } from "@/lib/supabase";

export default function ProductsPage() {
  const {
    products,
    loading,
    fetchProducts,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
  } = useProducts();

  const { categories, addCategory, deleteCategory } = useCategories();

  const productForm = useProductForm();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter products with useMemo
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeTab === "all" || product.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeTab]);

  // --- Option Groups Logic ---
  const [optionGroups, setOptionGroups] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedOptionGroupIds, setSelectedOptionGroupIds] = useState<
    string[]
  >([]);

  // Fetch Option Groups on Mount
  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase.from("option_groups").select("id, name");
      if (data) setOptionGroups(data);
    };
    fetchGroups();
  });

  // Handlers
  const handleEdit = async (product: Product) => {
    productForm.setEditMode(product);
    // Fetch existing options for this product
    const { data } = await supabase
      .from("product_options")
      .select("group_id")
      .eq("product_id", product.id);

    if (data) {
      setSelectedOptionGroupIds(data.map((d) => d.group_id));
    } else {
      setSelectedOptionGroupIds([]);
    }

    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    productForm.resetForm();
    setSelectedOptionGroupIds([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    productForm.resetForm();
    setSelectedOptionGroupIds([]);
  };

  // --- Helper Functions for Submit ---
  const resolveImageUrl = async (): Promise<string | null> => {
    if (productForm.imageUpload.imageFile) {
      const uploadedUrl = await productForm.imageUpload.uploadImage();
      if (!uploadedUrl) return null;
      return uploadedUrl;
    }
    return productForm.imageUpload.imagePreview || "";
  };

  const upsertProduct = async (imageUrl: string, editingId: string | null) => {
    const productData = {
      name: productForm.formData.name,
      description: productForm.formData.description,
      price: Number(productForm.formData.price),
      original_price: productForm.formData.originalPrice
        ? Number(productForm.formData.originalPrice)
        : 0,
      category: productForm.formData.category,
      category_id: productForm.formData.category_id,
      image_url: imageUrl,
      stock: Number(productForm.formData.stock),
      is_active: true,
    };

    if (editingId) {
      await updateProduct(editingId, productData);
      return editingId;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();
      if (error) throw error;
      return data.id;
    }
  };

  const saveOptions = async (productId: string) => {
    // 1. Delete old links
    await supabase.from("product_options").delete().eq("product_id", productId);

    // 2. Insert new links
    if (selectedOptionGroupIds.length > 0) {
      const links = selectedOptionGroupIds.map((groupId) => ({
        product_id: productId,
        group_id: groupId,
      }));
      const { error: optError } = await supabase
        .from("product_options")
        .insert(links);
      if (optError) console.error("Failed to save options", optError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = productForm.validateForm();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    productForm.setIsSubmitting(true);

    try {
      const finalImageUrl = await resolveImageUrl();
      if (finalImageUrl === null) {
        productForm.setIsSubmitting(false);
        return;
      }

      const productId = await upsertProduct(
        finalImageUrl,
        productForm.editingId,
      );

      if (productId) {
        await saveOptions(productId);
      }

      toast.success(
        productForm.editingId
          ? "Produk berhasil diperbarui"
          : "Produk berhasil dibuat",
      );

      setIsModalOpen(false);
      productForm.resetForm();
      setSelectedOptionGroupIds([]);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Gagal menyimpan produk");
    } finally {
      productForm.setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      handleCloseDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-6 pt-2 pb-32 max-w-7xl mx-auto">
      <ProductFilters
        categories={categories}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleOpenAddModal}
        onManageCategoriesClick={() => setIsCategoryModalOpen(true)}
      />

      <ProductGrid
        products={filteredProducts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleOpenDeleteModal}
        onToggleStatus={toggleProductStatus}
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        addCategory={addCategory}
        deleteCategory={deleteCategory}
      />

      <ProductForm
        isOpen={isModalOpen}
        isEditing={!!productForm.editingId}
        isSubmitting={productForm.isSubmitting}
        formData={productForm.formData}
        imagePreview={productForm.imageUpload.imagePreview}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFieldChange={productForm.updateField}
        onFileChange={productForm.imageUpload.handleFileSelect}
        onRemoveImage={productForm.imageUpload.resetImage}
        categories={categories}
        optionGroups={optionGroups}
        selectedOptionGroupIds={selectedOptionGroupIds}
        onOptionChange={setSelectedOptionGroupIds}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        product={productToDelete}
        isDeleting={isDeleting}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
