import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Layers } from 'lucide-react';
import { getAllCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/productService';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catList, prodList] = await Promise.all([
          getAllCategories(),
          getAllProducts()
        ]);
        setCategories(catList.filter(c => c.active !== false));
        setProducts(prodList.filter(p => p.active !== false));
      } catch (err) {
        console.error('Error loading categories page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" /> Shop By Category
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Product Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Discover Natural Blend's herbal oral care, personal bathing bars, hair treatments, home cleaning solutions, and traditional homemade foods.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = getProductCount(cat.name);
            return (
              <Link
                key={cat.id || cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all flex items-center gap-5 justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 overflow-hidden flex items-center justify-center p-3 shrink-0 group-hover:scale-105 transition-transform">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                    ) : (
                      <Leaf className="w-8 h-8 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {cat.name}
                    </h2>
                    <span className="text-xs font-semibold text-slate-400 mt-0.5 block">
                      {count} {count === 1 ? 'Product' : 'Products'} Available
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
