import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, MapPin, Phone, MessageCircle, Truck, Sparkles, Award } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import { getAllProducts } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          getAllProducts(),
          getAllCategories()
        ]);
        setProducts(prodList.filter(p => p.active !== false));
        setCategories(catList.filter(c => c.active !== false));
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProducts = products.slice(0, 8);
  const popularProducts = products.slice(8, 16);

  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Natural+Blend+83%2F1+Amman+Shannathi+Karaikudi+630001+Tamil+Nadu+India";
  const whatsappUrl = "https://wa.me/916381109883?text=Hello%20Natural%20Blend,%20I%20want%20to%20order%20products.";

  return (
    <div className="space-y-12 pb-12">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs font-bold tracking-wide animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Karaikudi's Premier Herbal Store
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Pure Natural Care & <br className="hidden sm:inline" />
            <span className="text-emerald-400">Homemade Wellness</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto font-medium leading-relaxed">
            Curated herbal oral care, luxury bathing bars, cold-pressed oils, hair treatments & wholesome homemade food mixes by <strong className="text-white">M. Kavitha M.Sc</strong>.
          </p>

          {/* Quick CTA buttons */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/products"
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm font-extrabold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              Shop All Products <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp Order
            </a>
          </div>

          {/* Delivery banner badge */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto text-xs text-emerald-200/80 bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/50">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block">Standard Shipping</strong>
                <span>First 1kg = ₹50, then ₹20 per 500g</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block">100% Herbal</strong>
                <span>No artificial chemical additives</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block">Trusted Owner</strong>
                <span>M. Kavitha M.Sc (Karaikudi)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Product Categories
            </h2>
            <p className="text-xs text-slate-500">Explore authentic natural care formulated for every daily need</p>
          </div>
          <Link to="/categories" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 overflow-hidden mb-3 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                ) : (
                  <Leaf className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-slate-500">Handpicked popular products available for immediate delivery</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
            See All ({products.length}) <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Store Location & Contact Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Visit Our Local Store
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Natural Blend Karaikudi</h2>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 text-sm">Owner: M. Kavitha M.Sc</p>
            <p>Natural Blend</p>
            <p>83/1, Amman Shannathi</p>
            <p>Karaikudi – 630001, Tamil Nadu, India</p>
            <p className="pt-2 font-bold text-slate-800">Phone / WhatsApp: 6381109883</p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
            <a
              href="tel:6381109883"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-emerald-700" /> Call Store
            </a>
          </div>
        </div>

        {/* Store Intro Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 space-y-3 text-xs text-slate-700">
          <h3 className="text-sm font-extrabold text-emerald-950">Why Choose Natural Blend?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pure Source of Truth:</strong> Genuine product formulas with authentic natural ingredients.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Transparent Pricing:</strong> Product price and delivery charge are always calculated separately.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Fair Delivery Calculation:</strong> ₹50 for first 1kg, then ₹20 per 500g or part of 500g.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Popular Essentials
              </h2>
              <p className="text-xs text-slate-500">More favorite herbal and wellness products</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
<ProductCard key={product.id} product={product} />
            ))}
          </div >
        </section >
      )}

    </div >
  );
}
