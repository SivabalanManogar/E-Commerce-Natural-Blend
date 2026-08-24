import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Leaf, ArrowRight, Layers, ArrowLeft, FolderTree, Package } from 'lucide-react';
import { getAllCategories } from '../../services/categoryService';
import { getAllSubcategories } from '../../services/subcategoryService';
import { getAllProducts } from '../../services/productService';

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCatParam = searchParams.get('category') || '';

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catList, subList, prodList] = await Promise.all([
          getAllCategories(),
          getAllSubcategories(),
          getAllProducts()
        ]);
        setCategories(catList.filter(c => c.active !== false));
        setSubcategories(subList.filter(s => s.active !== false));
        setProducts(prodList.filter(p => p.active !== false));
      } catch (err) {
        console.error('Error loading categories page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedCategoryObj = categories.find(
    c => c.name === activeCatParam || c.id === activeCatParam
  );

  const getSubcategoriesForCategory = (mainCat) => {
    if (!mainCat) return [];
    return subcategories.filter(
      s => s.parentCategoryId === mainCat.id || 
           s.parentCategoryId === mainCat.name || 
           (s.parentCategoryName && s.parentCategoryName.toLowerCase() === mainCat.name.toLowerCase())
    );
  };

  const getMainCategoryProductCount = (mainCatName, mainCatId) => {
    return products.filter(
      p => p.categoryId === mainCatId || p.category === mainCatName
    ).length;
  };

  const getSubCategoryProductCount = (subCatName, subCatId) => {
    return products.filter(
      p => p.subCategoryId === subCatId || 
           (p.subCategory && p.subCategory.toLowerCase() === subCatName.toLowerCase())
    ).length;
  };

  const handleSelectCategory = (catName) => {
    setSearchParams({ category: catName });
  };

  const handleClearCategory = () => {
    setSearchParams({});
  };

  const getDirectProductCount = (mainCatName, mainCatId) => {
    return products.filter(
      p => (p.categoryId === mainCatId || (p.category && p.category.toLowerCase() === mainCatName.toLowerCase())) &&
           !p.subCategory && !p.subCategoryId
    ).length;
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#176B4D] text-xs font-extrabold uppercase tracking-wider mb-2">
            {selectedCategoryObj ? (
              <>
                <button onClick={handleClearCategory} className="hover:underline flex items-center gap-1">
                  <Layers className="w-4 h-4" /> Shop By Category
                </button>
                <span>→</span>
                <span className="text-slate-900 font-extrabold">{selectedCategoryObj.name}</span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <Layers className="w-4 h-4" /> Shop By Category
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {selectedCategoryObj ? selectedCategoryObj.name : 'Product Categories'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {selectedCategoryObj 
              ? `Explore sub-categories and premium natural care items in ${selectedCategoryObj.name}.`
              : `Discover Natural Blend's herbal oral care, personal bathing bars, hair treatments, home cleaning solutions, and traditional homemade foods.`
            }
          </p>
        </div>

        {selectedCategoryObj && (
          <button
            onClick={handleClearCategory}
            className="px-4 py-2.5 bg-[#F8FAF6] hover:bg-[#DDEFE6] text-[#0D4A35] font-extrabold text-xs rounded-2xl border border-[#DCE6E0] transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> All Main Categories
          </button>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-3xl" />
          ))}
        </div>
      ) : !selectedCategoryObj ? (
        /* LEVEL 1: MAIN CATEGORIES */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = getMainCategoryProductCount(cat.name, cat.id);
            const subCount = getSubcategoriesForCategory(cat).length;
            return (
              <div
                key={cat.id || cat.name}
                onClick={() => handleSelectCategory(cat.name)}
                className="group bg-white p-5 sm:p-6 rounded-3xl border border-[#DCE6E0] shadow-xs hover:shadow-xl hover:border-[#176B4D]/30 transition-all flex items-center gap-4 justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-[#F8FAF6] overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-[#DCE6E0] group-hover:scale-105 transition-transform shadow-xs">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                    ) : (
                      <Leaf className="w-10 h-10 text-[#176B4D]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-[#0D4A35] group-hover:text-[#176B4D] transition-colors leading-snug truncate">
                      {cat.name}
                    </h2>
                    <span className="text-xs font-semibold text-[#64756D] mt-1 block">
                      {count} {count === 1 ? 'Product' : 'Products'} Available
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                      {subCount} Sub-Categories
                    </span>
                    <span className="text-xs font-bold text-[#176B4D] mt-2 block">
                      Browse Category ➔
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#F8FAF6] group-hover:bg-[#176B4D] group-hover:text-white text-[#64756D] flex items-center justify-center transition-all shrink-0 border border-[#DCE6E0]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LEVEL 2: SUB-CATEGORIES FOR SELECTED MAIN CATEGORY */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0D4A35] flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#176B4D]" /> Sub-Categories & Direct Items in {selectedCategoryObj.name}
            </h2>
            <Link
              to={`/products?category=${encodeURIComponent(selectedCategoryObj.name)}`}
              className="text-xs font-bold text-[#176B4D] hover:underline"
            >
              View All {selectedCategoryObj.name} Products ➔
            </Link>
          </div>

          {getSubcategoriesForCategory(selectedCategoryObj).length === 0 && getDirectProductCount(selectedCategoryObj.name, selectedCategoryObj.id) === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">No items available yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Products and sub-categories for {selectedCategoryObj.name} will be added soon.
                </p>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(selectedCategoryObj.name)}`}
                className="inline-flex items-center gap-1.5 bg-[#176B4D] hover:bg-[#0D4A35] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
              >
                Browse All {selectedCategoryObj.name} Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Direct Main Category Products Card if direct products exist */}
              {(() => {
                const directCount = getDirectProductCount(selectedCategoryObj.name, selectedCategoryObj.id);
                if (directCount === 0) return null;
                return (
                  <Link
                    to={`/products?category=${encodeURIComponent(selectedCategoryObj.name)}&subCategory=Direct`}
                    className="group bg-[#F8FAF6] p-5 sm:p-6 rounded-3xl border border-[#DCE6E0] shadow-xs hover:shadow-xl hover:border-[#176B4D]/30 transition-all flex items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-white overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-[#DCE6E0] group-hover:scale-105 transition-transform shadow-xs">
                        {selectedCategoryObj.imageUrl ? (
                          <img src={selectedCategoryObj.imageUrl} alt={selectedCategoryObj.name} className="w-full h-full object-contain" />
                        ) : (
                          <Leaf className="w-8 h-8 text-[#176B4D]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-[#0D4A35] group-hover:text-[#176B4D] transition-colors leading-snug truncate">
                          {selectedCategoryObj.name} (Direct)
                        </h3>
                        <span className="text-xs font-semibold text-[#64756D] mt-1 block">
                          {directCount} {directCount === 1 ? 'Product' : 'Products'} Direct
                        </span>
                        <span className="text-xs font-bold text-[#176B4D] mt-2 inline-flex items-center gap-1">
                          Browse Direct Products ➔
                        </span>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-white group-hover:bg-[#176B4D] group-hover:text-white text-[#64756D] flex items-center justify-center transition-all shrink-0 border border-[#DCE6E0]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })()}

              {/* Sub-Category Cards */}
              {getSubcategoriesForCategory(selectedCategoryObj).map((subCat) => {
                const count = getSubCategoryProductCount(subCat.name, subCat.id);
                return (
                  <Link
                    key={subCat.id || subCat.name}
                    to={`/products?category=${encodeURIComponent(selectedCategoryObj.name)}&subCategory=${encodeURIComponent(subCat.name)}`}
                    className="group bg-white p-5 sm:p-6 rounded-3xl border border-[#DCE6E0] shadow-xs hover:shadow-xl hover:border-[#176B4D]/30 transition-all flex items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-[#F8FAF6] overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-[#DCE6E0] group-hover:scale-105 transition-transform shadow-xs">
                        {subCat.imageUrl ? (
                          <img src={subCat.imageUrl} alt={subCat.name} className="w-full h-full object-contain" />
                        ) : (
                          <Leaf className="w-8 h-8 text-[#176B4D]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-[#0D4A35] group-hover:text-[#176B4D] transition-colors leading-snug truncate">
                          {subCat.name}
                        </h3>
                        <span className="text-xs font-semibold text-[#64756D] mt-1 block">
                          {count} {count === 1 ? 'Product' : 'Products'} Available
                        </span>
                        <span className="text-xs font-bold text-[#176B4D] mt-2 inline-flex items-center gap-1">
                          Browse Sub-Category ➔
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
      )}
    </div>
  );
}
