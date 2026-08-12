import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2, Package, ImagePlus, AlertCircle } from "lucide-react";
import api from "../../../lib/axios";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const COLORS = ["black", "white", "beige", "cream", "grey", "navy", "olive", "brown", "burgundy", "sky blue", "standard"];
const CATEGORIES = ["polo", "jogger", "t-shirt", "shirt", "jacket", "sweatshirt", "shorts", "dress", "accessories"];

interface Variant {
  size: string;
  color: string;
  stock: number;
}

interface ProductFormData {
  name: string;
  description: string;
  fabricDescription: string;
  fabric: string;
  category: string;
  subCategory: string;
  price: string;
  originalPrice: string;
  images: string[];
  variants: Variant[];
  isNewArrival: boolean;
  isLuxury: boolean;
  isSale: boolean;
  luxuryTier: string;
  sizeChartType: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  description: "",
  fabricDescription: "",
  fabric: "",
  category: "polo",
  subCategory: "",
  price: "",
  originalPrice: "",
  images: [""],
  variants: [{ size: "M", color: "black", stock: 10 }],
  isNewArrival: false,
  isLuxury: false,
  isSale: false,
  luxuryTier: "Gold",
  sizeChartType: "polo",
};

function toForm(product: any): ProductFormData {
  return {
    name: product.name || "",
    description: product.description || "",
    fabricDescription: product.fabricDescription || "",
    fabric: product.fabric || "",
    category: product.category || "polo",
    subCategory: product.subCategory || "",
    price: String(product.price || ""),
    originalPrice: String(product.originalPrice || ""),
    images: product.images?.length ? product.images : [""],
    variants: product.variants?.length ? product.variants.map((v: any) => ({ size: v.size, color: v.color, stock: v.stock })) : [{ size: "M", color: "black", stock: 10 }],
    isNewArrival: !!product.isNewArrival,
    isLuxury: !!product.isLuxury,
    isSale: !!product.isSale,
    luxuryTier: product.luxuryTier || "Gold",
    sizeChartType: product.sizeChartType || "polo",
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product?: any; // null = add mode, object = edit mode
  onSaved: (product: any, isEdit: boolean) => void;
}

export function ProductFormModal({ isOpen, onClose, product, onSaved }: Props) {
  const isEdit = !!product;
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(product ? toForm(product) : EMPTY_FORM);
      setError("");
    }
  }, [isOpen, product]);

  const set = (field: keyof ProductFormData, value: any) => setForm(f => ({ ...f, [field]: value }));

  // Image URL handlers
  const handleImageUpload = (idx: number, file: File) => {
    if (!file) return;
    
    // 3MB limit for Base64 (Vercel payload limit is 4.5MB)
    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be less than 3MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const imgs = [...form.images];
      imgs[idx] = reader.result as string;
      set("images", imgs);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
  };

  const addImage = () => set("images", [...form.images, ""]);
  const removeImage = (idx: number) => set("images", form.images.filter((_, i) => i !== idx));

  // Variant handlers
  const setVariant = (idx: number, field: keyof Variant, val: any) => {
    const vars = [...form.variants];
    vars[idx] = { ...vars[idx], [field]: field === "stock" ? (parseInt(val) || 0) : val };
    set("variants", vars);
  };
  const addVariant = () => set("variants", [...form.variants, { size: "M", color: "black", stock: 0 }]);
  const removeVariant = (idx: number) => set("variants", form.variants.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanImages = form.images.filter(img => img.trim() !== "");
    if (!form.name.trim()) { setError("Product name is required"); return; }
    if (!form.price || isNaN(Number(form.price))) { setError("Valid price is required"); return; }
    if (!form.fabricDescription.trim()) { setError("Fabric description is required"); return; }
    if (cleanImages.length === 0) { setError("At least one image URL is required"); return; }
    if (form.variants.length === 0) { setError("At least one variant is required"); return; }

    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
      images: cleanImages,
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("admin_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const { data } = isEdit
        ? await api.put(`/admin/products/${product._id}`, payload, { headers })
        : await api.post("/admin/products", payload, { headers });

      onSaved(data, isEdit);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h2>
                  <p className="text-xs text-gray-500">{isEdit ? `Editing: ${product.name}` : "Create a new product listing"}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Basic Info */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text" required
                        value={form.name} onChange={e => set("name", e.target.value)}
                        placeholder="e.g. Classic Black Polo"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                      <select value={form.category} onChange={e => set("category", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none capitalize">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sub-Category</label>
                      <input type="text" value={form.subCategory} onChange={e => set("subCategory", e.target.value)}
                        placeholder="e.g. Slim Fit"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹) *</label>
                      <input type="number" required min="0" value={form.price} onChange={e => set("price", e.target.value)}
                        placeholder="2999"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Original Price (₹)</label>
                      <input type="number" min="0" value={form.originalPrice} onChange={e => set("originalPrice", e.target.value)}
                        placeholder="Leave blank to use price"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fabric</label>
                      <input type="text" value={form.fabric} onChange={e => set("fabric", e.target.value)}
                        placeholder="e.g. 100% Pima Cotton"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Size Chart Type</label>
                      <select value={form.sizeChartType} onChange={e => set("sizeChartType", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                        <option value="polo">Polo</option>
                        <option value="jogger">Jogger</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={form.description} onChange={e => set("description", e.target.value)}
                        rows={2} placeholder="Short product description..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fabric Description *</label>
                      <textarea required value={form.fabricDescription} onChange={e => set("fabricDescription", e.target.value)}
                        rows={2} placeholder="Detailed fabric & care instructions..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none resize-none" />
                    </div>
                  </div>
                </section>

                {/* Flags */}
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Product Flags</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "isNewArrival", label: "New Arrival" },
                      { key: "isSale", label: "On Sale" },
                      { key: "isLuxury", label: "Luxury" },
                    ].map(({ key, label }) => (
                      <button key={key} type="button"
                        onClick={() => set(key as keyof ProductFormData, !form[key as keyof ProductFormData])}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                          form[key as keyof ProductFormData]
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {form.isLuxury && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Luxury Tier</label>
                      <select value={form.luxuryTier} onChange={e => set("luxuryTier", e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Black">Black</option>
                      </select>
                    </div>
                  )}
                </section>

                {/* Images */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Product Images *</h3>
                    <button type="button" onClick={addImage}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" /> Add Image
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        {img && <img src={img} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />}
                        {!img && <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 border border-gray-200 flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>}
                        <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(idx, e.target.files[0])}
                          className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 outline-none cursor-pointer" />
                        {form.images.length > 1 && (
                          <button type="button" onClick={() => removeImage(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Variants */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Variants (Size / Color / Stock) *</h3>
                    <button type="button" onClick={addVariant}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Variant
                    </button>
                  </div>
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Size</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Color</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Stock</span>
                      <span />
                    </div>
                    {form.variants.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-center">
                        <select value={v.size} onChange={e => setVariant(idx, "size", e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none">
                          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={v.color} onChange={e => setVariant(idx, "color", e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none capitalize">
                          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="number" min="0" value={v.stock} onChange={e => setVariant(idx, "stock", e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-gray-900 outline-none" />
                        {form.variants.length > 1 ? (
                          <button type="button" onClick={() => removeVariant(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : <div />}
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
                <button type="button" onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg hover:border-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                  {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
