import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, Loader2, Layers } from 'lucide-react';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '../../services/categoryService';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const list = await getAllCategories();
      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: name.trim() });
      } else {
        await addCategory({ name: name.trim(), active: true });
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans bg-[#F5F7F2] text-[#18231D]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#173D2B]">Manage Categories</h1>
          <p className="text-xs text-[#65736A] mt-0.5">Add or modify store product categories.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#246B45] hover:bg-[#173D2B] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center">
            <Loader2 className="w-6 h-6 text-[#246B45] animate-spin mx-auto" />
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id || cat.name} className="glass-panel p-5 rounded-2xl border border-white/60 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#246B45]/10 text-[#246B45] flex items-center justify-center font-bold border border-[#246B45]/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#173D2B]">{cat.name}</h3>
                  <span className="text-[10px] text-[#65736A] font-medium">Category</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-[#65736A] hover:text-[#246B45] hover:bg-white rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-[#65736A] hover:text-[#D95C5C] hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#10291D]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-white/80 text-[#18231D]">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-[#173D2B]">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-4 h-4 text-[#65736A]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#173D2B] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/80 border border-[#173D2B]/12 rounded-xl px-3 py-2 text-xs text-[#18231D] focus:outline-none focus:border-[#246B45]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 bg-white/80 text-[#65736A] font-bold rounded-lg border border-[#173D2B]/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#246B45] hover:bg-[#173D2B] text-white font-black rounded-lg flex items-center gap-1"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
