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
            <div key={i} className="h-44 bg-slate-100 rounded-3xl" />
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
                className="group bg-white p-5 sm:p-6 rounded-3xl border border-[#DCE6E0] shadow-xs hover:shadow-xl hover:border-[#176B4D]/30 transition-all flex items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-[#F8FAF6] overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-[#DCE6E0] group-hover:scale-105 transition-transform shadow-xs">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                    ) : (
                      <Leaf className="w-10 h-10 text-[#176B4D]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#0D4A35] group-hover:text-[#176B4D] transition-colors leading-snug">
                      {cat.name}
                    </h2>
                    <span className="text-xs font-semibold text-[#64756D] mt-1 block">
                      {count} {count === 1 ? 'Product' : 'Products'} Available
                    </span>
                    <span className="text-xs font-bold text-[#176B4D] mt-2 inline-flex items-center gap-1">
                      Browse Category ➔
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#F8FAF6] group-hover:bg-[#176B4D] group-hover:text-white text-[#64756D] flex items-center justify-center transition-all shrink-0 border border-[#DCE6E0]">
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
