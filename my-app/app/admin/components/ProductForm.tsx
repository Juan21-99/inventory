import { Loader2, UploadCloud, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect } from "react";
import Modal from "../../components/ui/Modal";
import { CategoryDropdown } from "../products/CategoryDropdown";
import { ProductFormData } from "../types/product.types";
import { formatPrice, parsePrice } from "../utils/price.utils";
import { Category } from "../products/hooks/useCategories";

interface ProductFormProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  formData: ProductFormData;
  imagePreview: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: keyof ProductFormData, value: string | number) => void;
  onFileChange: (file: File | null) => void;
  onRemoveImage: () => void;
  categories: Category[];
  optionGroups: { id: string; name: string }[];
  selectedOptionGroupIds: string[];
  onOptionChange: (ids: string[]) => void;
}

export const ProductForm = ({
  isOpen,
  isEditing,
  isSubmitting,
  formData,
  imagePreview,
  onClose,
  onSubmit,
  onFieldChange,
  onFileChange,
  onRemoveImage,
  categories,
  optionGroups,
  selectedOptionGroupIds,
  onOptionChange,
}: ProductFormProps) => {
  const handleCategoryChange = useCallback(
    (id: string, name: string) => {
      onFieldChange("category_id", id);
      onFieldChange("category", name);
    },
    [onFieldChange],
  );

  useEffect(() => {
    if (!isEditing && !formData.category_id && categories.length > 0) {
      handleCategoryChange(categories[0].id, categories[0].name);
    }
  }, [isEditing, formData.category_id, categories, handleCategoryChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  // Mock-up for Preview
  const previewProduct = {
    name: formData.name || "Nama Produk",
    price: formData.price || 0,
    original_price: formData.originalPrice || 0,
    image_url: imagePreview || "",
    stock: Number(formData.stock) || 0,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Produk" : "Tambah Produk Baru"}
      description="Lengkapi informasi detail produk untuk dipajang di menu."
      isDraggable={false}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr,0.8fr] gap-8 pt-2">
        {/* FORM SIDE */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name & Category */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="product-name"
                className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1 mb-2 block"
              >
                Nama Produk <span className="text-amber-500">*</span>
              </label>
              <input
                id="product-name"
                required
                type="text"
                placeholder="Ex: Kopi Gula Aren"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                className="w-full px-5 py-4 bg-stone-900 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-bold text-white text-sm transition-all placeholder:text-stone-700 shadow-inner"
              />
            </div>

            <div>
              <label
                htmlFor="product-category"
                className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1 mb-2 block"
              >
                Kategori Menu
              </label>
              <div className="relative group" id="product-category">
                <CategoryDropdown
                  value={formData.category_id}
                  options={categories}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-2 gap-4 bg-stone-900/40 p-5 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] -z-10" />

            <div className="space-y-2">
              <label
                htmlFor="product-price"
                className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1"
              >
                Harga Jual
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-black text-xs">
                  Rp
                </span>
                <input
                  id="product-price"
                  required
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatPrice(formData.price)}
                  onChange={(e) =>
                    onFieldChange("price", parsePrice(e.target.value))
                  }
                  className="w-full pl-10 pr-4 py-4 bg-stone-950 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-black text-amber-500 text-base transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-original-price"
                className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1 flex items-center justify-between"
              >
                Normal{" "}
                <span className="text-[8px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-500">
                  Coret
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 font-bold text-xs">
                  Rp
                </span>
                <input
                  id="product-original-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formatPrice(formData.originalPrice)}
                  onChange={(e) =>
                    onFieldChange("originalPrice", parsePrice(e.target.value))
                  }
                  className="w-full pl-10 pr-4 py-4 bg-stone-950 border border-white/5 rounded-2xl focus:border-stone-700 outline-none font-bold text-stone-600 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="product-description"
              className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1"
            >
              Deskripsi Produk
            </label>
            <textarea
              id="product-description"
              rows={3}
              placeholder="Jelaskan cita rasa produk Anda (Contoh: Perpaduan kopi robusta dengan gula aren asli yang legit...)"
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              className="w-full px-5 py-4 bg-stone-900 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-medium text-white text-sm transition-all placeholder:text-stone-700 resize-none"
            />
          </div>

          {/* Image & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1 mb-2 block">
                Foto Produk
              </p>

              {imagePreview ? (
                <div className="relative w-full h-32 bg-stone-900 rounded-2xl overflow-hidden group border border-white/10 shadow-lg">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={onRemoveImage}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-xl active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/10 rounded-2xl cursor-pointer bg-stone-900/30 hover:bg-stone-900/50 hover:border-amber-500/30 transition-all group">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors text-stone-600">
                      <UploadCloud
                        className="w-5 h-5 transition-transform group-hover:-translate-y-1"
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className="text-[9px] text-stone-500 font-black uppercase tracking-widest group-hover:text-amber-500 transition-colors">
                      Upload Gambar
                    </p>
                  </div>
                  <label htmlFor="product-image" className="sr-only">
                    Upload Gambar
                  </label>
                  <input
                    id="product-image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="product-stock"
                className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1 mb-2 block"
              >
                Stok
              </label>
              <input
                id="product-stock"
                required
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => onFieldChange("stock", e.target.value)}
                className="w-full px-5 py-4 bg-stone-900 border border-white/5 rounded-2xl focus:border-amber-500/50 outline-none font-black text-white text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">
              Opsi Tambahan
            </p>
            <div className="bg-stone-900/40 p-5 rounded-[2rem] border border-white/5 space-y-3">
              {optionGroups.length === 0 ? (
                <p className="text-xs text-stone-500 italic">
                  Belum ada grup opsi. Buat di menu &quot;Opsi Menu&quot;.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {optionGroups.map((group) => (
                    <button
                      type="button"
                      key={group.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer w-full text-left ${
                        selectedOptionGroupIds.includes(group.id)
                          ? "bg-amber-500/10 border-amber-500"
                          : "bg-stone-950/50 border-stone-800 hover:border-stone-700"
                      }`}
                      onClick={() => {
                        if (selectedOptionGroupIds.includes(group.id)) {
                          onOptionChange(
                            selectedOptionGroupIds.filter(
                              (id) => id !== group.id,
                            ),
                          );
                        } else {
                          onOptionChange([...selectedOptionGroupIds, group.id]);
                        }
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          selectedOptionGroupIds.includes(group.id)
                            ? "bg-amber-500 border-amber-500"
                            : "border-stone-600"
                        }`}
                      >
                        {selectedOptionGroupIds.includes(group.id) && (
                          <Plus
                            size={10}
                            className="text-stone-950"
                            strokeWidth={4}
                          />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          selectedOptionGroupIds.includes(group.id)
                            ? "text-amber-500"
                            : "text-stone-400"
                        }`}
                      >
                        {group.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[9px] text-stone-600 ml-2">
              Pilih varian yang berlaku untuk produk ini (cth: Level Gula,
              Topping).
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 text-stone-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] mt-2 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-b-4 border-amber-600 active:border-b-0"
          >
            {(() => {
              if (isSubmitting)
                return <Loader2 className="animate-spin mx-auto w-6 h-6" />;
              return isEditing ? "Simpan Perubahan" : "Tambah Produk List";
            })()}
          </button>
        </form>

        {/* PREVIEW SIDE */}
        <div className="hidden md:flex flex-col">
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{" "}
            Live Customer Preview
          </div>

          <div className="sticky top-0 bg-stone-950/50 rounded-[2.5rem] p-6 border border-white/5 flex items-center justify-center min-h-[400px]">
            {/* Reproduced Customer Product Card */}
            <div className="w-[200px] bg-stone-900/50 rounded-3xl p-3 shadow-2xl border border-white/5 relative">
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative bg-stone-950">
                {previewProduct.image_url ? (
                  <Image
                    src={previewProduct.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-800/30">
                    <span className="text-lg font-black tracking-tighter text-stone-700 select-none">
                      ALIN.<span className="text-amber-700/50">CO</span>
                    </span>
                  </div>
                )}

                {previewProduct.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="bg-red-600 text-[8px] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Habis
                    </span>
                  </div>
                )}
              </div>

              <div className="px-1">
                <h3 className="font-bold text-white text-xs leading-snug line-clamp-1 mb-0.5">
                  {previewProduct.name}
                </h3>

                {selectedOptionGroupIds.length > 0 && (
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {selectedOptionGroupIds.slice(0, 2).map((id) => (
                      <span
                        key={id}
                        className="text-[7px] font-bold bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded uppercase tracking-wider"
                      >
                        {optionGroups.find((g) => g.id === id)?.name}
                      </span>
                    ))}
                    {selectedOptionGroupIds.length > 2 && (
                      <span className="text-[7px] font-bold bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        +{selectedOptionGroupIds.length - 2}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    {previewProduct.original_price > previewProduct.price && (
                      <span className="text-[8px] text-stone-600 line-through">
                        Rp{" "}
                        {previewProduct.original_price.toLocaleString("id-ID")}
                      </span>
                    )}
                    <p className="font-black text-amber-400 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                      Rp {previewProduct.price.toLocaleString("id-ID")}
                    </p>
                    {previewProduct.stock > 0 && (
                      <span className="text-[8px] text-stone-500 font-bold">
                        Stok: {previewProduct.stock}
                      </span>
                    )}
                  </div>
                  <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center text-stone-950">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-6 inset-x-6">
              <p className="text-[9px] text-stone-600 font-bold text-center uppercase tracking-widest leading-relaxed">
                Tampilan produk saat dilihat oleh pelanggan Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
