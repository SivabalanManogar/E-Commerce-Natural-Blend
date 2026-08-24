import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Upload,
  Check,
  Loader2,
  Package,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductImages,
  deleteStorageImage
} from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllSubcategories } from '../../services/subcategoryService';
import { compressImageFile, compressImageDataUrl } from '../../utils/imageCompressor';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    category: 'Personal Care',
    subCategoryId: '',
    subCategory: '',
    price: '',
    displayQuantity: '100',
    displayUnit: 'g',
    shippingWeightGrams: '100',
    stockQuantity: '50',
    description: '',
    directions: '',
    ingredients: '',
    benefits: '',
    storage: '',
    manufacturer: '',
    marketer: '',
    shelfLife: '',
    disclaimer: '',
    imageUrl: '',
    active: true
  });

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prodList, catList, subList] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllSubcategories()
      ]);
      setProducts(prodList);
      setCategories(catList);
      setSubcategories(subList);
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const getMatchingSubcategories = (catId, catName) => {
    if (!catId && !catName) return [];
    return subcategories.filter(s => {
      const matchId = catId && s.parentCategoryId === catId;
      const matchCatIdLower = catId && s.parentCategoryId && s.parentCategoryId.toLowerCase() === catId.toLowerCase();
      const matchCatName = catName && s.parentCategoryId && s.parentCategoryId.toLowerCase() === catName.toLowerCase();
      const matchParentName = catName && s.parentCategoryName && s.parentCategoryName.toLowerCase() === catName.toLowerCase();
      return matchId || matchCatIdLower || matchCatName || matchParentName;
    });
  };

  const [imageItems, setImageItems] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newUrlInput, setNewUrlInput] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setImageItems([]);
    setImagesToDelete([]);
    setNewUrlInput('');
    const firstCat = categories[0];
    const catId = firstCat?.id || '';
    const catName = firstCat?.name || 'Personal Care';

    setForm({
      name: '',
      categoryId: catId,
      category: catName,
      subCategoryId: '',
      subCategory: '',
      price: '',
      displayQuantity: '100',
      displayUnit: 'g',
      shippingWeightGrams: '100',
      stockQuantity: '50',
      description: '',
      directions: '',
      ingredients: '',
      benefits: '',
      storage: '',
      manufacturer: '',
      marketer: '',
      shelfLife: '',
      disclaimer: '',
      imageUrl: '',
      active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setImagesToDelete([]);
    setNewUrlInput('');

    const existingUrls = getProductImages(product);
    setImageItems(existingUrls.map(url => ({
      id: Math.random().toString(36).substring(2, 9),
      url,
      file: null,
      isExisting: true
    })));

    const foundCat = categories.find(c => c.id === product.categoryId || (c.name && c.name.toLowerCase() === (product.category || '').toLowerCase())) || categories[0];
    const catId = product.categoryId || foundCat?.id || '';
    const catName = product.category || foundCat?.name || 'Personal Care';

    const foundSub = subcategories.find(s => s.id === product.subCategoryId || (s.name && s.name.toLowerCase() === (product.subCategory || '').toLowerCase()));
    const subId = product.subCategoryId || foundSub?.id || '';
    const subName = product.subCategory || foundSub?.name || '';

    setForm({
      name: product.name || '',
      categoryId: catId,
      category: catName,
      subCategoryId: subId,
      subCategory: subName,
      price: product.price !== undefined ? String(product.price) : '',
      displayQuantity: product.displayQuantity !== undefined ? String(product.displayQuantity) : '',
      displayUnit: product.displayUnit || 'g',
      shippingWeightGrams: product.shippingWeightGrams !== null && product.shippingWeightGrams !== undefined ? String(product.shippingWeightGrams) : '',
      stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '50',
      description: product.description || '',
      directions: product.directions || '',
      ingredients: product.ingredients || '',
      benefits: product.benefits || '',
      storage: product.storage || '',
      manufacturer: product.manufacturer || '',
      marketer: product.marketer || '',
      shelfLife: product.shelfLife || '',
      disclaimer: product.disclaimer || '',
      imageUrl: product.imageUrl || '',
      active: product.active !== undefined ? product.active : true
    });
    setModalOpen(true);
  };

  const handleMainCategoryChange = (e) => {
    const selectedCatName = e.target.value;
    const foundCat = categories.find(c => c.name === selectedCatName || c.id === selectedCatName);
    const catId = foundCat?.id || '';
    const catName = foundCat?.name || selectedCatName;

    setForm(prev => ({
      ...prev,
      categoryId: catId,
      category: catName,
      subCategoryId: '',
      subCategory: ''
    }));
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubName = e.target.value;
    if (!selectedSubName) {
      setForm(prev => ({
        ...prev,
        subCategoryId: '',
        subCategory: ''
      }));
      return;
    }

    const foundSub = subcategories.find(s => s.name === selectedSubName || s.id === selectedSubName);
    const subId = foundSub?.id || '';
    const subName = foundSub?.name || selectedSubName;

    setForm(prev => ({
      ...prev,
      subCategoryId: subId,
      subCategory: subName
    }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectMultipleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      url: URL.createObjectURL(file),
      file: file,
      isExisting: false
    }));

    setImageItems(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleAddUrlInput = () => {
    if (!newUrlInput.trim()) return;
    setImageItems(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        url: newUrlInput.trim(),
        file: null,
        isExisting: false
      }
    ]);
    setNewUrlInput('');
  };

  const handleRemoveImage = (index) => {
    const item = imageItems[index];
    if (item && item.isExisting && item.url) {
      setImagesToDelete(prev => [...prev, item.url]);
    }
    setImageItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetMainImage = (index) => {
    if (index === 0) return;
    setImageItems(prev => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      alert('Valid Price is required.');
      return;
    }

    setSubmitting(true);
    try {
      const finalImageUrls = [];
      const productId = editingProduct ? editingProduct.id : `prod_${Date.now()}`;

      for (const item of imageItems) {
        if (item.file) {
          let resolvedUrl = null;
          // 1. Try uploading to Firebase Storage with a 4-second timeout
          try {
            const storageUploadPromise = uploadProductImage(item.file, productId);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 4000));
            resolvedUrl = await Promise.race([storageUploadPromise, timeoutPromise]);
          } catch (storageErr) {
            console.warn('Storage upload error:', storageErr);
          }

          // 2. If Storage upload didn't return a URL within 4s, compress client-side to Data URL
          if (!resolvedUrl) {
            try {
              resolvedUrl = await compressImageFile(item.file);
            } catch (compErr) {
              console.warn('Compression error:', compErr);
            }
          }

          if (resolvedUrl) {
            finalImageUrls.push(resolvedUrl);
          }
        } else if (item.url) {
          finalImageUrls.push(item.url);
        }
      }

      if (finalImageUrls.length === 0) {
        finalImageUrls.push('/images/products/placeholder.png');
      }

      // 2. Delete removed Firebase Storage files safely (non-blocking)
      for (const urlToDelete of imagesToDelete) {
        deleteStorageImage(urlToDelete).catch(err => console.warn('Storage delete warning:', err));
      }

      const payload = {
        ...form,
        price: Number(form.price),
        displayQuantity: Number(form.displayQuantity) || 1,
        shippingWeightGrams: form.shippingWeightGrams && String(form.shippingWeightGrams).trim() !== '' ? Number(form.shippingWeightGrams) : null,
        stockQuantity: Number(form.stockQuantity) || 0,
        images: finalImageUrls,
        imageUrl: finalImageUrls[0] || '/images/products/placeholder.png'
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      setModalOpen(false);
      await loadCatalog();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      await loadCatalog();
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { active: !product.active });
      await loadCatalog();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Products</h1>
          <p className="text-xs text-slate-500 mt-0.5">Edit price, stock, shipping weight, and details for all {products.length} catalog items.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            All ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat.name
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 pl-3.5 pr-8 text-xs focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No products found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Net Qty</th>
                  <th className="py-3 px-4">Ship Weight</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl || '/images/products/placeholder.png'}
                          alt={prod.name}
                          className="w-10 h-10 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100/e2e8f0/1e293b?text=NB';
                          }}
                        />
                        <span className="font-bold text-slate-900 max-w-xs line-clamp-1">{prod.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      <span>{prod.category}</span>
                      {prod.subCategory && (
                        <span className="block text-[11px] text-emerald-700 font-bold">↳ {prod.subCategory}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-950">₹{prod.price}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {prod.displayQuantity}{prod.displayUnit}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-800">
                      {prod.shippingWeightGrams !== null && prod.shippingWeightGrams !== undefined ? `${prod.shippingWeightGrams}g` : 'Unspecified'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${Number(prod.stockQuantity) <= 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {prod.stockQuantity || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {prod.active !== false ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-fade-in">

            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Main Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleMainCategoryChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map(c => (
                        <option key={c.id || c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sub-Category (Optional)</label>
                    <select
                      name="subCategory"
                      value={form.subCategory || ''}
                      onChange={handleSubCategoryChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                    >
                      <option value="">None (Main Category Only)</option>
                      {getMatchingSubcategories(form.categoryId, form.category).map(sub => (
                        <option key={sub.id || sub.name} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={form.price}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Qty</label>
                  <input
                    type="number"
                    name="displayQuantity"
                    value={form.displayQuantity}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Unit</label>
                  <input
                    type="text"
                    name="displayUnit"
                    placeholder="g, ml, units"
                    value={form.displayUnit}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ship Weight (g)</label>
                  <input
                    type="number"
                    name="shippingWeightGrams"
                    placeholder="e.g. 500"
                    value={form.shippingWeightGrams}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Product Images Section: Multiple Upload + URL Input + Local Previews */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">
                    Product Images * <span className="text-slate-400 font-normal">(First image is Primary / Main Image)</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {imageItems.length} {imageItems.length === 1 ? 'Image' : 'Images'} Selected
                  </span>
                </div>

                {/* Upload & Add Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block font-semibold text-slate-600 text-[11px] mb-1">+ Select Multiple Image Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleSelectMultipleFiles}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#176B4D] file:text-white hover:file:bg-[#0D4A35]"
                    />
                  </div>

                  <div>
                    <span className="block font-semibold text-slate-600 text-[11px] mb-1">+ Add Image URL String</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://... or /images/..."
                        value={newUrlInput}
                        onChange={(e) => setNewUrlInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrlInput}
                        className="px-3 py-1.5 bg-[#176B4D] text-white font-bold text-xs rounded-xl hover:bg-[#0D4A35] shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Thumbnails Grid */}
                {imageItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {imageItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={`relative bg-white rounded-xl border p-2 flex flex-col items-center justify-between gap-1 shadow-xs transition-all ${idx === 0 ? 'border-2 border-[#176B4D] ring-2 ring-emerald-100' : 'border-slate-200'}`}
                      >
                        {/* Primary Badge */}
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#176B4D] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs z-10">
                            MAIN
                          </span>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-xs z-10 font-black"
                          title="Remove Image"
                        >
                          ✕
                        </button>

                        <div className="w-full h-24 flex items-center justify-center overflow-hidden rounded-lg mt-3 bg-slate-50">
                          <img
                            src={item.url}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/200x200/e2e8f0/1e293b?text=Image+Error';
                            }}
                          />
                        </div>

                        <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 pt-1">
                          <span>Image {idx + 1}</span>
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="text-[#176B4D] hover:underline font-black"
                            >
                              Set Main
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-6 px-4 bg-white rounded-xl border border-dashed border-slate-300 text-xs flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                    <div>
                      <p className="font-semibold text-slate-700">No product images selected yet</p>
                      <p className="text-[11px] text-slate-400">Choose image files from your computer or paste image URLs above</p>
                    </div>
                    <label className="inline-flex items-center gap-1.5 bg-[#176B4D] hover:bg-[#0D4A35] text-white font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs transition-all mt-1">
                      <span>+ Choose Product Images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleSelectMultipleFiles}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="activeCheck"
                      name="active"
                      checked={form.active}
                      onChange={handleFormChange}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="activeCheck" className="font-bold text-slate-800">Product Available / Active on Store</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Directions</label>
                  <textarea
                    name="directions"
                    rows={2}
                    value={form.directions}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ingredients</label>
                  <textarea
                    name="ingredients"
                    rows={2}
                    value={form.ingredients}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Benefits</label>
                  <textarea
                    name="benefits"
                    rows={2}
                    value={form.benefits}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Storage</label>
                  <textarea
                    name="storage"
                    rows={2}
                    value={form.storage}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={form.manufacturer}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marketer</label>
                  <input
                    type="text"
                    name="marketer"
                    value={form.marketer}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shelf Life</label>
                  <input
                    type="text"
                    name="shelfLife"
                    value={form.shelfLife}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
