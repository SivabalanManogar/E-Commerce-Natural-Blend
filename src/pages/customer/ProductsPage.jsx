import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, X, Package, ChevronRight, Home } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import { subscribeToProducts } from '../../services/productService';
import { subscribeToCategories } from '../../services/categoryService';
import { subscribeToSubcategories } from '../../services/subcategoryService';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSubCategory = searchParams.get('subCategory') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubProducts = subscribeToProducts((prodList) => {
      setProducts(prodList.filter(p => p.active !== false));
      setLoading(false);
    });

    const unsubCategories = subscribeToCategories((catList) => {
      setCategories(catList.filter(c => c.active !== false));
    });

    const unsubSubcategories = subscribeToSubcategories((subList) => {
      setSubcategories(subList.filter(s => s.active !== false));
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSubcategories();
    };
  }, []);

  // Synchronize state if URL query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    const sub = searchParams.get('subCategory');
    const srch = searchParams.get('search');
    
    setSelectedCategory(cat || 'All');
    setSelectedSubCategory(sub || 'All');
    if (srch !== null) setSearchTerm(srch);
  }, [searchParams]);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory('All');
    const newParams = new URLSearchParams(searchParams);
    if (categoryName === 'All') {
      newParams.delete('category');
      newParams.delete('subCategory');
    } else {
      newParams.set('category', categoryName);
      newParams.delete('subCategory');
    }
    setSearchParams(newParams);
  };

  const handleSubCategorySelect = (subCatName) => {
    setSelectedSubCategory(subCatName);
    const newParams = new URLSearchParams(searchParams);
    if (subCatName === 'All') {
      newParams.delete('subCategory');
    } else {
      newParams.set('subCategory', subCatName);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  // Find active category object
  const activeMainCatObj = categories.find(
    c => c.name === selectedCategory || 
         c.id === selectedCategory || 
         (c.name && c.name.toLowerCase() === selectedCategory.toLowerCase())
  );

  // Available subcategories for selected Main Category
  const activeSubcategories = activeMainCatObj 
    ? subcategories.filter(s => 
        s.parentCategoryId === activeMainCatObj.id || 
        (s.parentCategoryId && s.parentCategoryId.toLowerCase() === activeMainCatObj.id.toLowerCase()) ||
        (s.parentCategoryId && s.parentCategoryId.toLowerCase() === activeMainCatObj.name.toLowerCase()) ||
        (s.parentCategoryName && s.parentCategoryName.toLowerCase() === activeMainCatObj.name.toLowerCase())
      )
    : [];

  // Filtering products
  const filteredProducts = products.filter(product => {
    // Main Category Match
    const matchesCategory = selectedCategory === 'All' || 
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()) || 
      (activeMainCatObj && (
        product.categoryId === activeMainCatObj.id || 
        (product.category && product.category.toLowerCase() === activeMainCatObj.name.toLowerCase())
      ));

    // Sub-Category Match
    let matchesSubCategory = true;
    if (selectedSubCategory === 'Direct' || selectedSubCategory === 'Main Category Direct') {
      matchesSubCategory = !product.subCategory && !product.subCategoryId;
    } else if (selectedSubCategory !== 'All') {
      matchesSubCategory = (
        (product.subCategory && product.subCategory.toLowerCase() === selectedSubCategory.toLowerCase()) ||
        (product.subCategoryId && product.subCategoryId === selectedSubCategory)
      );
    }

    // Search Term Match
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || (
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (product.ingredients && product.ingredients.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.subCategory && product.subCategory.toLowerCase().includes(searchLower))
    );

    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold flex-wrap">
        <Link to="/" className="hover:text-[#176B4D] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/products" onClick={() => handleCategorySelect('All')} className="hover:text-[#176B4D]">
          Products
        </Link>
        {selectedCategory !== 'All' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#0D4A35] font-extrabold">{selectedCategory}</span>
          </>
        )}
        {selectedSubCategory !== 'All' && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#176B4D] font-extrabold">
              {selectedSubCategory === 'Direct' ? `${selectedCategory} Direct` : selectedSubCategory}
            </span>
          </>
        )}
      </div>

      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {selectedSubCategory !== 'All' 
              ? (selectedSubCategory === 'Direct' ? `${selectedCategory} Direct` : `${selectedSubCategory}`)
              : selectedCategory !== 'All' 
                ? `${selectedCategory}` 
                : 'Our Products'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {filteredProducts.length} items available in catalog.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search products or ingredients..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-4 pr-10 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          {searchTerm ? (
            <button
              onClick={() => handleSearchChange({ target: { value: '' } })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        {/* Level 1: Main Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${selectedCategory === 'All'
              ? 'bg-[#0D4A35] text-white shadow-xs'
              : 'bg-[#F8FAF6] text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            All Categories ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              p => p.categoryId === cat.id || (p.category && p.category.toLowerCase() === cat.name.toLowerCase())
            ).length;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${isSelected
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'bg-[#F8FAF6] text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Level 2: Sub-Category Pills (Shown when a Main Category is selected) */}
        {selectedCategory !== 'All' && activeSubcategories.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Sub-Categories:
            </span>

            <button
              onClick={() => handleSubCategorySelect('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${selectedSubCategory === 'All'
                ? 'bg-[#176B4D] text-white shadow-xs'
                : 'bg-emerald-50 text-[#0D4A35] hover:bg-emerald-100 border border-emerald-200'
                }`}
            >
              All {selectedCategory} ({products.filter(p => (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) || (activeMainCatObj && p.categoryId === activeMainCatObj.id)).length})
            </button>

            {/* Direct Main Category Only Pill */}
            {(() => {
              const directCount = products.filter(
                p => ((p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) || (activeMainCatObj && p.categoryId === activeMainCatObj.id)) &&
                     !p.subCategory && !p.subCategoryId
              ).length;
              if (directCount === 0) return null;
              const isDirectSelected = selectedSubCategory === 'Direct' || selectedSubCategory === 'Main Category Direct';

              return (
                <button
                  onClick={() => handleSubCategorySelect('Direct')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${isDirectSelected
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                  {selectedCategory} Direct ({directCount})
                </button>
              );
            })()}

            {activeSubcategories.map((subCat) => {
              const subCount = products.filter(
                p => (p.subCategoryId && p.subCategoryId === subCat.id) || 
                     (p.subCategory && p.subCategory.toLowerCase() === subCat.name.toLowerCase())
              ).length;
              const isSubSelected = selectedSubCategory.toLowerCase() === subCat.name.toLowerCase();

              return (
                <button
                  key={subCat.id || subCat.name}
                  onClick={() => handleSubCategorySelect(subCat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${isSubSelected
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                  {subCat.name} ({subCount})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Grid / States */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-[#176B4D]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              No products available in this sub-category yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedSubCategory !== 'All' 
                ? `No products currently assigned to ${selectedSubCategory}.`
                : `No products found matching "${searchTerm}".`
              }
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 bg-[#176B4D] hover:bg-[#0D4A35] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
