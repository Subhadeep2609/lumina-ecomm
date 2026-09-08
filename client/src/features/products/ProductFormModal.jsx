import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct } from './productSlice.js';
import { closeModal, showToast } from '../ui/uiSlice.js';
import { apiCall } from '../../utils/api.js';
import { X, UploadCloud, Sparkles, Tag, DollarSign, Package, Layers, FileText, Loader2, CheckCircle2, Image as ImageIcon, Store, ArrowRight, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Audio',
  'Fashion',
  'Home & Living',
  'Gadgets',
  'Books',
  'Accessories'
];

const PRESET_BRANDS = ['Lumina', 'Sony', 'Nike', 'Apple', 'Samsung', 'Bose'];

const SAMPLE_IMAGES = [
  { label: 'Wireless Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' },
  { label: 'Urban Sneakers', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
  { label: 'Premium Camera', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80' }
];

const ProductFormModal = () => {
  const dispatch = useDispatch();
  const { activeModal, selectedProductForEdit } = useSelector((state) => state.ui);

  const isEditMode = Boolean(selectedProductForEdit);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    price: '',
    mrp: '',
    stock: 15,
    brand: 'Lumina',
    description: '',
    imageUrl: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [polishingAi, setPolishingAi] = useState(false);

  useEffect(() => {
    if (selectedProductForEdit) {
      const p = selectedProductForEdit;
      setFormData({
        title: p.title || '',
        category: p.category || 'Electronics',
        price: p.price || '',
        mrp: p.mrp || (Number(p.price) * 1.2).toFixed(2),
        stock: p.stock !== undefined ? p.stock : 15,
        brand: p.brand || 'Lumina',
        description: p.description || '',
        imageUrl: (p.images && p.images.length > 0) ? p.images[0].url : ''
      });
    } else {
      setFormData({
        title: '',
        category: 'Electronics',
        price: '',
        mrp: '',
        stock: 15,
        brand: 'Lumina',
        description: '',
        imageUrl: ''
      });
    }
  }, [selectedProductForEdit]);

  if (activeModal !== 'PRODUCT_FORM') return null;

  // Cloudinary Direct Upload Handler
  const handleCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await apiCall('/upload', {
        method: 'POST',
        body: data
      });

      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      dispatch(showToast({ message: 'Image uploaded to Cloudinary CDN successfully!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Image upload failed: ' + err.message, type: 'error' }));
    } finally {
      setUploadingImage(false);
    }
  };

  // AI Copilot Auto-Fill Generator
  const handleAiGenerate = async () => {
    const query = aiPrompt.trim() || formData.title.trim();
    if (!query) {
      dispatch(showToast({ message: 'Please enter a product concept or title first for AI generation.', type: 'info' }));
      return;
    }

    setGeneratingAi(true);
    try {
      const res = await apiCall('/ai/generate-product', {
        method: 'POST',
        body: JSON.stringify({
          prompt: query,
          category: formData.category,
          brand: formData.brand
        })
      });

      if (res.product) {
        setFormData((prev) => ({
          ...prev,
          title: res.product.title || prev.title,
          category: res.product.category || prev.category,
          brand: res.product.brand || prev.brand,
          price: res.product.suggestedPrice !== undefined ? res.product.suggestedPrice : prev.price,
          mrp: res.product.suggestedMrp !== undefined ? res.product.suggestedMrp : prev.mrp,
          stock: res.product.stock !== undefined ? res.product.stock : prev.stock,
          description: res.product.description || prev.description
        }));
        dispatch(showToast({ message: '✨ Merchant AI Copilot auto-generated listing!', type: 'success' }));
      }
    } catch (err) {
      dispatch(showToast({ message: 'AI Copilot failed: ' + err.message, type: 'error' }));
    } finally {
      setGeneratingAi(false);
    }
  };

  // AI Description Polish
  const handlePolishDescription = async () => {
    const targetText = formData.description.trim() || formData.title.trim();
    if (!targetText) {
      dispatch(showToast({ message: 'Please enter a title or draft description to polish.', type: 'info' }));
      return;
    }

    setPolishingAi(true);
    try {
      const res = await apiCall('/ai/generate-product', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `Enhance description for: ${formData.title || 'Product'}. Notes: ${targetText}`,
          category: formData.category,
          brand: formData.brand
        })
      });

      if (res.product && res.product.description) {
        setFormData((prev) => ({ ...prev, description: res.product.description }));
        dispatch(showToast({ message: '✨ Description polished with AI!', type: 'success' }));
      }
    } catch (err) {
      dispatch(showToast({ message: 'AI Polish failed: ' + err.message, type: 'error' }));
    } finally {
      setPolishingAi(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.description) {
      dispatch(showToast({ message: 'Please fill in product title, price, and description.', type: 'error' }));
      return;
    }

    const defaultImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

    const productPayload = {
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      brand: formData.brand || 'Lumina',
      description: formData.description,
      images: [
        {
          url: formData.imageUrl || defaultImage,
          public_id: `img_${Date.now()}`
        }
      ]
    };

    if (isEditMode) {
      const id = selectedProductForEdit._id || selectedProductForEdit.id;
      dispatch(updateProduct({ id, productData: productPayload }));
    } else {
      dispatch(createProduct(productPayload));
    }
  };

  const priceNum = Number(formData.price) || 0;
  const mrpNum = Number(formData.mrp) || priceNum * 1.25;
  const discountPercent = mrpNum > priceNum && priceNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div
        className="modal-card max-w-2xl w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-heading text-slate-900">
                  {isEditMode ? 'Edit Product Listing' : 'List New Product to Store Catalog'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Merchant Console
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Enter product title, pricing, stock count, and media CDN links</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(closeModal())}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Product Media CDN & Sample Presets */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 font-heading">
                <UploadCloud size={16} className="text-indigo-600" />
                <span>Product Media & Image CDN</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">Supports PNG, JPG, WEBP</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {formData.imageUrl ? (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition"
                    title="Remove Image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 shadow-2xs">
                  <ImageIcon size={32} />
                  <span className="text-[10px] font-bold mt-1">No Image</span>
                </div>
              )}

              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="cloudinaryUploadInput"
                    className="hidden"
                    onChange={handleCloudinaryUpload}
                  />
                  <label
                    htmlFor="cloudinaryUploadInput"
                    className="px-4 py-2 bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-2xs"
                  >
                    {uploadingImage ? <Loader2 size={15} className="animate-spin text-indigo-600" /> : <UploadCloud size={15} />}
                    <span>{uploadingImage ? 'Uploading CDN...' : 'Upload Image File'}</span>
                  </label>

                  {formData.imageUrl && (
                    <span className="text-[11px] text-emerald-600 font-black flex items-center gap-1">
                      <CheckCircle2 size={13} /> Ready
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">Or paste image URL directly:</span>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 transition font-medium"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Quick Sample Stock Photos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: sample.url })}
                        className="px-2 py-0.5 bg-white border border-slate-200 hover:border-indigo-500 text-[10px] font-bold text-slate-700 rounded-lg transition"
                      >
                        + {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Merchant AI Copilot Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-2xl text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                  <Sparkles size={16} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-xs font-black font-heading tracking-wide flex items-center gap-1.5">
                    <span>Merchant AI Copilot</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Auto-Generator
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-300">Enter a short idea or keyword to auto-fill title, specs, pricing & description</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 bg-slate-900/90 border border-indigo-700/60 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-400 font-medium"
                placeholder="e.g. Ergonomic wireless mechanical keyboard with RGB..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
              />
              <button
                type="button"
                disabled={generatingAi}
                onClick={handleAiGenerate}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                {generatingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-300" />}
                <span>{generatingAi ? 'Generating...' : 'AI Auto-Fill'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Core Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText size={14} className="text-indigo-600" /> Product Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-bold"
                  placeholder="e.g. Aura Pro Noise Cancelling Wireless Headphones"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Layers size={14} className="text-purple-600" /> Category
                </label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600 transition font-extrabold"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand Input & Preset Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag size={14} className="text-amber-500" /> Brand / Manufacturer Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition font-semibold"
                  placeholder="e.g. Lumina Genuine"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Presets:</span>
                {PRESET_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormData({ ...formData, brand: b })}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border transition ${
                      formData.brand === b
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Pricing & Inventory Control */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-600" /> Selling Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 font-black font-mono"
                  placeholder="199.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <DollarSign size={14} className="text-slate-400" /> List MRP ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 font-bold font-mono"
                  placeholder="249.99"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                />
                {discountPercent > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 block">
                    ⚡ {discountPercent}% Customer Savings Badge
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Package size={14} className="text-amber-500" /> Stock Quantity (SKU)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 font-extrabold font-mono"
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="flex gap-1 pt-0.5">
                  {[10, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, stock: num })}
                      className="px-1.5 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-600 rounded"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Detailed Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText size={14} className="text-slate-500" /> Description & Key Technical Features
                </label>
                <button
                  type="button"
                  disabled={polishingAi}
                  onClick={handlePolishDescription}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition disabled:opacity-50"
                  title="Enhance description into persuasive sales copy"
                >
                  {polishingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-indigo-600" />}
                  <span>Polish with AI</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition leading-relaxed resize-none font-medium"
                placeholder="Write detailed product features, box contents, battery life, connectivity specs, and warranty details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm transition active:scale-95"
            >
              <Sparkles size={18} />
              <span>{isEditMode ? 'Save Listing Updates' : 'Publish Product to Store Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
