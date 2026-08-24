import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Loader2, 
  Layers, 
  Upload, 
  Leaf, 
  AlertCircle, 
  ArrowLeft, 
  ChevronRight,
  FolderTree
} from 'lucide-react';
import { 
  getAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  subscribeToCategories
} from '../../services/categoryService';
import { 
  getAllSubcategories, 
  addSubcategory, 
  updateSubcategory, 
  deleteSubcategory,
  subscribeToSubcategories
} from '../../services/subcategoryService';
import { getAllProducts, subscribeToProducts } from '../../services/productService';
import { compressImageFile } from '../../utils/imageCompressor';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Main Category for Sub-Category view
  const [selectedMainCat, setSelectedMainCat] = useState(null);

  // Main Category Modal State
  const [mainModalOpen, setMainModalOpen] = useState(false);
  const [editingMainCat, setEditingMainCat] = useState(null);
  const [mainName, setMainName] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');

  // Sub-Category Modal State
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubCat, setEditingSubCat] = useState(null);
  const [subName, setSubName] = useState('');
  const [subImageUrl, setSubImageUrl] = useState('');

  // General State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warningModal, setWarningModal] = useState({ open: false, message: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [catList, subList, prodList] = await Promise.all([
        getAllCategories(),
        getAllSubcategories(),
        getAllProducts()
      ]);
      setCategories(catList);
      setSubcategories(subList);
      setProducts(prodList);
    } catch (err) {
      console.error('Error loading category data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime updates
    const unsubCat = subscribeToCategories((list) => setCategories(list));
    const unsubSub = subscribeToSubcategories((list) => setSubcategories(list));
    const unsubProd = subscribeToProducts((list) => setProducts(list));

    return () => {
      if (unsubCat) unsubCat();
      if (unsubSub) unsubSub();
      if (unsubProd) unsubProd();
    };
  }, []);

  // ----------------------------------------------------
  // MAIN CATEGORY HANDLERS
  // ----------------------------------------------------
  const openAddMainModal = () => {
    setEditingMainCat(null);
    setMainName('');
    setMainImageUrl('');
    setError('');
    setMainModalOpen(true);
  };

  const openEditMainModal = (cat, e) => {
    e.stopPropagation();
    setEditingMainCat(cat);
    setMainName(cat.name || '');
    setMainImageUrl(cat.imageUrl || '');
    setError('');
    setMainModalOpen(true);
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const compressedDataUrl = await compressImageFile(file);
      setMainImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Main category image compression error:', err);
      setError('Failed to process image file. Please select a valid image.');
    }
  };

  const handleSaveMainCategory = async (e) => {
    e.preventDefault();
    if (!mainName.trim()) {
      setError('Main Category name is required.');
      return;
    }
    if (!mainImageUrl.trim()) {
      setError('Main Category image is required. Please upload or set a category image.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: mainName.trim(),
        imageUrl: mainImageUrl.trim(),
        active: true
      };

      if (editingMainCat) {
        await updateCategory(editingMainCat.id, payload);
      } else {
        await addCategory(payload);
      }
      setMainModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving main category:', err);
      setError(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMainCategory = async (cat, e) => {
    e.stopPropagation();
    // Check if subcategories exist under this main category
    const childSubs = subcategories.filter(s => s.parentCategoryId === cat.id || s.parentCategoryId === cat.name);
    const assignedProducts = products.filter(p => p.categoryId === cat.id || p.category === cat.name);

    if (childSubs.length > 0 || assignedProducts.length > 0) {
      setWarningModal({
        open: true,
        message: `Cannot delete "${cat.name}". It contains ${childSubs.length} sub-categories and ${assignedProducts.length} products. Please remove or reassign those first.`
      });
      return;
    }

    if (!window.confirm(`Delete main category "${cat.name}"? This action cannot be undone.`)) return;

    try {
      await deleteCategory(cat.id);
      await loadData();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  // ----------------------------------------------------
  // SUB-CATEGORY HANDLERS
  // ----------------------------------------------------
  const openAddSubModal = () => {
    setEditingSubCat(null);
    setSubName('');
    setSubImageUrl('');
    setError('');
    setSubModalOpen(true);
  };

  const openEditSubModal = (subCat) => {
    setEditingSubCat(subCat);
    setSubName(subCat.name || '');
    setSubImageUrl(subCat.imageUrl || '');
    setError('');
    setSubModalOpen(true);
  };

  const handleSubImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const compressedDataUrl = await compressImageFile(file);
      setSubImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Sub-category image compression error:', err);
      setError('Failed to process image file. Please select a valid image.');
    }
  };

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    if (!subName.trim()) {
      setError('Sub-Category name is required.');
      return;
    }
    if (!subImageUrl.trim()) {
      setError('Sub-Category image is required. Please upload or set an image.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: subName.trim(),
        parentCategoryId: selectedMainCat.id || selectedMainCat.name,
        parentCategoryName: selectedMainCat.name,
        imageUrl: subImageUrl.trim(),
        active: true
      };

      if (editingSubCat) {
        await updateSubcategory(editingSubCat.id, payload);
      } else {
        await addSubcategory(payload);
      }
      setSubModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving subcategory:', err);
      setError(err.message || 'Failed to save subcategory.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (subCat) => {
    // Check if products exist for this sub-category
    const assignedProducts = products.filter(
      p => p.subCategoryId === subCat.id || 
           (p.subCategory && p.subCategory.toLowerCase() === subCat.name.toLowerCase())
    );

    if (assignedProducts.length > 0) {
      setWarningModal({
        open: true,
        message: `Cannot delete this sub-category.\n\n${assignedProducts.length} ${assignedProducts.length === 1 ? 'product is' : 'products are'} currently assigned to ${subCat.name}.\n\nPlease move or remove those products first.`
      });
      return;
    }

    if (!window.confirm(`Delete ${subCat.name}?\n\nThis action cannot be undone.`)) return;

    try {
      await deleteSubcategory(subCat.id);
      await loadData();
    } catch (err) {
      console.error('Error deleting subcategory:', err);
    }
  };

  // Helper counts
  const getSubcategoriesForMain = (mainCat) => {
    return subcategories.filter(s => s.parentCategoryId === mainCat.id || s.parentCategoryId === mainCat.name);
  };

  const getProductCountForMain = (mainCat) => {
    return products.filter(p => p.categoryId === mainCat.id || p.category === mainCat.name).length;
  };

  const getProductCountForSub = (subCat) => {
    return products.filter(p => 
      p.subCategoryId === subCat.id || 
      (p.subCategory && p.subCategory.toLowerCase() === subCat.name.toLowerCase())
    ).length;
  };

  return (
    <div className="space-y-6 font-sans bg-[#F8FAF6] text-[#17251F] pb-12">
      {/* ==================================================== */}
      {/* VIEW 1: MAIN CATEGORIES OVERVIEW                    */}
      {/* ==================================================== */}
      {!selectedMainCat ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-black text-[#0D4A35]">Manage Categories</h1>
              <p className="text-xs text-[#64756D] mt-0.5">
                Organize store products into Main Categories & Sub-Categories.
              </p>
            </div>

            <button
              onClick={openAddMainModal}
              className="bg-[#176B4D] hover:bg-[#0D4A35] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Main Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-12 text-center">
                <Loader2 className="w-8 h-8 text-[#176B4D] animate-spin mx-auto" />
                <p className="text-xs text-[#64756D] mt-2">Loading store categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-3xl text-center border border-[#DCE6E0]">
                <Layers className="w-10 h-10 text-[#64756D] mx-auto mb-2 opacity-50" />
                <h3 className="font-extrabold text-sm text-[#0D4A35]">No Main Categories Found</h3>
                <p className="text-xs text-[#64756D] mt-1">Click "+ Add Main Category" to start adding categories.</p>
              </div>
            ) : (
              categories.map(cat => {
                const subList = getSubcategoriesForMain(cat);
                const prodCount = getProductCountForMain(cat);
                return (
                  <div
                    key={cat.id || cat.name}
                    onClick={() => setSelectedMainCat(cat)}
                    className="glass-panel p-5 rounded-2xl border border-[#DCE6E0] shadow-xs flex flex-col justify-between gap-4 group hover:border-[#176B4D]/40 hover:shadow-md transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-[#F8FAF6] overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-[#DCE6E0] group-hover:scale-105 transition-transform">
                          {cat.imageUrl ? (
                            <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                          ) : (
                            <Leaf className="w-8 h-8 text-[#176B4D]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-base text-[#0D4A35] truncate group-hover:text-[#176B4D] transition-colors">
                            {cat.name}
                          </h3>
                          <div className="flex flex-col text-xs text-[#64756D] font-semibold mt-0.5">
                            <span>{subList.length} {subList.length === 1 ? 'Sub-Category' : 'Sub-Categories'}</span>
                            <span className="text-[11px] text-[#176B4D] font-bold">{prodCount} Products Total</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => openEditMainModal(cat, e)}
                          title="Edit Main Category"
                          className="p-1.5 text-[#64756D] hover:text-[#176B4D] hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteMainCategory(cat, e)}
                          title="Delete Main Category"
                          className="p-1.5 text-[#64756D] hover:text-[#C94A4A] hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#176B4D] group-hover:text-[#0D4A35]">
                      <span className="flex items-center gap-1.5">
                        <FolderTree className="w-4 h-4" /> Manage Sub-Categories
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* ==================================================== */
        /* VIEW 2: DEDICATED SUB-CATEGORY MANAGEMENT           */
        /* ==================================================== */
        <div className="space-y-6">
          {/* Top Breadcrumb Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-[#DCE6E0] shadow-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedMainCat(null)}
                className="p-2.5 bg-[#F8FAF6] hover:bg-[#DDEFE6] text-[#0D4A35] font-bold rounded-2xl border border-[#DCE6E0] transition-colors flex items-center gap-1 text-xs shrink-0"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Categories
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F8FAF6] p-1 border border-[#DCE6E0] overflow-hidden shrink-0">
                  {selectedMainCat.imageUrl ? (
                    <img src={selectedMainCat.imageUrl} alt={selectedMainCat.name} className="w-full h-full object-contain" />
                  ) : (
                    <Leaf className="w-6 h-6 text-[#176B4D] mx-auto my-auto" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#176B4D]">Main Category</span>
                  <h2 className="text-xl font-black text-[#0D4A35] leading-tight">{selectedMainCat.name}</h2>
                </div>
              </div>
            </div>

            <button
              onClick={openAddSubModal}
              className="bg-[#176B4D] hover:bg-[#0D4A35] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Add Sub-Category
            </button>
          </div>

          {/* Sub-categories Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D4A35] flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#176B4D]" /> Sub-Categories under {selectedMainCat.name}
            </h3>

            {getSubcategoriesForMain(selectedMainCat).length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#DCE6E0] space-y-3">
                <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-sm text-[#0D4A35]">No Sub-Categories Available</h4>
                <p className="text-xs text-[#64756D] max-w-sm mx-auto">
                  Click "+ Add Sub-Category" above to create sub-categories under {selectedMainCat.name}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSubcategoriesForMain(selectedMainCat).map((subCat) => {
                  const prodCount = getProductCountForSub(subCat);
                  return (
                    <div
                      key={subCat.id || subCat.name}
                      className="bg-white p-4 rounded-2xl border border-[#DCE6E0] shadow-xs flex items-center justify-between gap-3 hover:border-[#176B4D]/30 transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-[#F8FAF6] overflow-hidden flex items-center justify-center p-1 shrink-0 border border-[#DCE6E0]">
                          {subCat.imageUrl ? (
                            <img src={subCat.imageUrl} alt={subCat.name} className="w-full h-full object-contain" />
                          ) : (
                            <Leaf className="w-7 h-7 text-[#176B4D]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-[#0D4A35] truncate">{subCat.name}</h4>
                          <span className="text-xs text-[#64756D] font-medium block mt-0.5">
                            {prodCount} {prodCount === 1 ? 'Product' : 'Products'} Available
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditSubModal(subCat)}
                          title="Edit Sub-Category"
                          className="p-2 text-[#64756D] hover:text-[#176B4D] hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubCategory(subCat)}
                          title="Delete Sub-Category"
                          className="p-2 text-[#64756D] hover:text-[#C94A4A] hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT MAIN CATEGORY                   */}
      {/* ==================================================== */}
      {mainModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#10291D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-white/80 text-[#18231D]">
            <div className="flex justify-between items-center pb-2 border-b border-[#DCE6E0]">
              <div>
                <h3 className="text-base font-black text-[#173D2B]">
                  {editingMainCat ? 'Edit Main Category' : 'Add Main Category'}
                </h3>
                <p className="text-[11px] text-[#64756D]">Name and mandatory category image.</p>
              </div>
              <button onClick={() => setMainModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-[#65736A]" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveMainCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#173D2B] mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Care, Personal Care"
                  value={mainName}
                  onChange={(e) => { setMainName(e.target.value); setError(''); }}
                  className="w-full bg-white border border-[#173D2B]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#173D2B] mb-1">
                  Category Image <span className="text-rose-500">*</span>
                </label>

                {mainImageUrl ? (
                  <div className="relative border-2 border-dashed border-[#176B4D]/30 rounded-2xl p-3 bg-[#F8FAF6] text-center">
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-white p-1 border border-[#DCE6E0] shadow-xs mb-2">
                      <img src={mainImageUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1 bg-[#176B4D] text-white text-[11px] font-bold rounded-lg hover:bg-[#0D4A35] transition-colors">
                        Change Image
                        <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMainImageUrl(''); setError(''); }}
                        className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#176B4D]/30 hover:border-[#176B4D] rounded-2xl p-5 bg-[#F8FAF6] cursor-pointer transition-colors text-center">
                      <Upload className="w-7 h-7 text-[#176B4D] mb-1" />
                      <span className="text-xs font-bold text-[#0D4A35]">Click to Upload Image</span>
                      <span className="text-[10px] text-[#64756D] mt-0.5">Compressed client-side automatically</span>
                      <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={mainImageUrl}
                      onChange={(e) => { setMainImageUrl(e.target.value); setError(''); }}
                      className="w-full bg-white border border-[#173D2B]/20 rounded-xl px-3 py-2 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE6E0]">
                <button
                  type="button"
                  onClick={() => setMainModalOpen(false)}
                  className="px-4 py-2 bg-white text-[#65736A] font-bold text-xs rounded-xl border border-[#173D2B]/10 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#246B45] hover:bg-[#173D2B] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: ADD / EDIT SUB-CATEGORY                    */}
      {/* ==================================================== */}
      {subModalOpen && selectedMainCat && (
        <div className="fixed inset-0 z-50 bg-[#10291D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-white/80 text-[#18231D]">
            <div className="flex justify-between items-center pb-2 border-b border-[#DCE6E0]">
              <div>
                <h3 className="text-base font-black text-[#173D2B]">
                  {editingSubCat ? 'Edit Sub-Category' : 'Add Sub-Category'}
                </h3>
                <p className="text-[11px] text-[#64756D]">Sub-category details under {selectedMainCat.name}</p>
              </div>
              <button onClick={() => setSubModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-[#65736A]" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="whitespace-pre-line">{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#173D2B] mb-1">Parent Category</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedMainCat.name}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-[#173D2B] mb-1">
                  Sub-Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skin Care, Eye Care, Herbal Oil"
                  value={subName}
                  onChange={(e) => { setSubName(e.target.value); setError(''); }}
                  className="w-full bg-white border border-[#173D2B]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#173D2B] mb-1">
                  Sub-Category Image <span className="text-rose-500">*</span>
                </label>

                {subImageUrl ? (
                  <div className="relative border-2 border-dashed border-[#176B4D]/30 rounded-2xl p-3 bg-[#F8FAF6] text-center">
                    <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-white p-1 border border-[#DCE6E0] shadow-xs mb-2">
                      <img src={subImageUrl} alt="Sub category preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1 bg-[#176B4D] text-white text-[11px] font-bold rounded-lg hover:bg-[#0D4A35] transition-colors">
                        Change Image
                        <input type="file" accept="image/*" onChange={handleSubImageChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => { setSubImageUrl(''); setError(''); }}
                        className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-bold rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#176B4D]/30 hover:border-[#176B4D] rounded-2xl p-5 bg-[#F8FAF6] cursor-pointer transition-colors text-center">
                      <Upload className="w-7 h-7 text-[#176B4D] mb-1" />
                      <span className="text-xs font-bold text-[#0D4A35]">Choose Sub-Category Image</span>
                      <span className="text-[10px] text-[#64756D] mt-0.5">Auto-compressed for fast loading</span>
                      <input type="file" accept="image/*" onChange={handleSubImageChange} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={subImageUrl}
                      onChange={(e) => { setSubImageUrl(e.target.value); setError(''); }}
                      className="w-full bg-white border border-[#173D2B]/20 rounded-xl px-3 py-2 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DCE6E0]">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2 bg-white text-[#65736A] font-bold text-xs rounded-xl border border-[#173D2B]/10 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#246B45] hover:bg-[#173D2B] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save Sub-Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: WARNING DIALOG FOR DELETION BLOCKED        */}
      {/* ==================================================== */}
      {warningModal.open && (
        <div className="fixed inset-0 z-50 bg-[#10291D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 text-slate-800">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-base text-slate-900">Deletion Restricted</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {warningModal.message}
              </p>
            </div>

            <button
              onClick={() => setWarningModal({ open: false, message: '' })}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
