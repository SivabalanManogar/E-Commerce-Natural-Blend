import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  Sparkles,
  Award,
  CheckCircle2,
  Heart,
  Star,
  ShoppingBag,
  Droplets
} from 'lucide-react';
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

  const mapsUrl = "https://maps.app.goo.gl/tTX6DUvBQ3Xfjatk8";
  const whatsappUrl = "https://wa.me/916381109883?text=Hello%20Natural%20Blend,%20I%20want%20to%20order%20herbal%20products.";

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 font-sans bg-[#F5F7F2] text-[#18231D]">

      {/* Dynamic Moving Liquid Background Hero Section (Logo at Top, Content Remaining Down) */}
      <section className="relative overflow-hidden animate-liquid-gradient text-[#0D4A35] py-8 sm:py-12 px-4 sm:px-12 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-[#DCE6E0]">

        {/* Animated Smooth Moving Organic Blobs */}
        <div className="absolute -top-16 -right-16 w-80 sm:w-96 h-80 sm:h-96 bg-[#176B4D]/15 rounded-full blur-[70px] pointer-events-none animate-blob-1" />
        <div className="absolute -bottom-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 bg-[#0D4A35]/10 rounded-full blur-[70px] pointer-events-none animate-blob-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[28rem] h-80 sm:h-[28rem] bg-white/40 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 relative z-10">

          {/* 1. LOGO EMBLEM FIRST (AT THE TOP) */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-white p-2.5 shadow-2xl border-4 border-[#176B4D]/30 flex items-center justify-center animate-float-soft">
              <img
                src="/logo.png"
                alt="Natural Blend Emblem"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="absolute -top-1 right-0 bg-white/95 text-[#0D4A35] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border border-[#DCE6E0] shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 text-[#C89B3C] fill-[#C89B3C]" /> Karaikudi Store
            </div>

            <div className="absolute -bottom-1 left-0 bg-white/95 text-[#0D4A35] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border border-[#DCE6E0] shadow-md flex items-center gap-1">
              <Leaf className="w-3 h-3 text-[#176B4D]" /> Handcrafted Care
            </div>
          </div>

          {/* 2. REMAINING HERO CONTENT DOWN (BELOW LOGO) */}
          <div className="space-y-4 sm:space-y-5 max-w-2xl">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#DCE6E0] text-[#0D4A35] text-[11px] sm:text-xs font-extrabold shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
              <span>Authentic Herbal Care • Karaikudi</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2.5xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0D4A35] leading-tight">
              Pure Natural Care <br className="hidden sm:inline" />
              <span className="text-[#176B4D]">
                & Homemade Heritage
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-[#64756D] font-medium leading-relaxed">
              Formulated with love in Karaikudi by <strong className="text-[#0D4A35] font-extrabold underline decoration-[#176B4D] underline-offset-4">M. Kavitha M.Sc</strong>. Handcrafted herbal tooth powder, organic soaps, cold-pressed oils & traditional wellness foods.
            </p>

            {/* Quick Trust Badges */}
            <div className="pt-3 sm:pt-4 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-[#64756D] border-t border-[#DCE6E0]">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
                <span>100% Pure Herbs</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
                <span>No Artificial Additives</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#176B4D] shrink-0" />
                <span>Fast All-Tamil Nadu Shipping</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Features Cards Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5 border border-[#DCE6E0]">
          <div className="w-10 h-10 rounded-xl bg-[#DDEFE6] text-[#176B4D] flex items-center justify-center shrink-0 border border-[#DCE6E0]">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#0D4A35]">100% Pure Herbal</h4>
            <p className="text-[11px] sm:text-xs text-[#64756D] mt-0.5 leading-relaxed">Traditional recipes without chemical additives.</p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5 border border-[#DCE6E0]">
          <div className="w-10 h-10 rounded-xl bg-[#DDEFE6] text-[#176B4D] flex items-center justify-center shrink-0 border border-[#DCE6E0]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#0D4A35]">M. Kavitha M.Sc</h4>
            <p className="text-[11px] sm:text-xs text-[#64756D] mt-0.5 leading-relaxed">Direct store supervision in Karaikudi.</p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5 border border-[#DCE6E0]">
          <div className="w-10 h-10 rounded-xl bg-[#DDEFE6] text-[#176B4D] flex items-center justify-center shrink-0 border border-[#DCE6E0]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#0D4A35]">Quality Guaranteed</h4>
            <p className="text-[11px] sm:text-xs text-[#64756D] mt-0.5 leading-relaxed">Fresh small-batch authentic homemade care.</p>
          </div>
        </div>
      </section>

      {/* Product Categories Showcase */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-xs font-extrabold text-[#176B4D] uppercase tracking-wider block">Browse by Needs</span>
            <h2 className="text-xl sm:text-3xl font-black text-[#0D4A35] tracking-tight">
              Product Categories
            </h2>
          </div>
          <Link to="/categories" className="text-xs font-extrabold text-[#176B4D] hover:text-[#0D4A35] flex items-center gap-1.5">
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-3.5 sm:p-4 rounded-3xl border border-[#DCE6E0] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-between"
            >
              <div className="w-full h-32 sm:h-36 rounded-2xl bg-[#F8FAF6] overflow-hidden mb-3 flex items-center justify-center p-1.5 border border-[#DCE6E0] group-hover:border-[#176B4D]/30 transition-all">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <Leaf className="w-10 h-10 text-[#176B4D]" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0D4A35] group-hover:text-[#176B4D] transition-colors leading-tight">
                  {cat.name}
                </h3>
                <span className="text-[11px] font-bold text-[#176B4D] block">Explore Products ➔</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-xs font-extrabold text-[#246B45] uppercase tracking-wider block">Handpicked Catalog</span>
            <h2 className="text-xl sm:text-3xl font-black text-[#173D2B] tracking-tight">
              Featured Herbal Products
            </h2>
          </div>
          <Link to="/products" className="text-xs font-extrabold text-[#246B45] hover:text-[#173D2B] flex items-center gap-1.5">
            See All ({products.length}) Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 sm:h-72 bg-white/60 rounded-2xl border border-[#173D2B]/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Karaikudi Flagship Store Section (Light Liquid Glass Style) */}
      <section className="relative overflow-hidden animate-liquid-gradient text-[#173D2B] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center border border-white/60">

        {/* Moving Background Blobs */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-[#4F9D69]/20 rounded-full blur-[60px] pointer-events-none animate-blob-2" />
        <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-[#246B45]/15 rounded-full blur-[60px] pointer-events-none animate-blob-1" />

        <div className="space-y-4 sm:space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#173D2B]/12 text-[#173D2B] text-xs font-extrabold shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#246B45]" /> Karaikudi Flagship Store
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#173D2B] leading-tight">
            Natural Blend Store <br />
            <span className="text-[#246B45]">Amman Shannathi, Karaikudi</span>
          </h2>

          <div className="space-y-1.5 text-xs text-[#65736A] leading-relaxed">
            <p className="font-extrabold text-[#173D2B] text-sm">Owner & Manager: M. Kavitha M.Sc</p>
            <p className="font-medium text-[#18231D]">83/1, Amman Shannathi, Karaikudi – 630001, Tamil Nadu, India</p>
            <p className="pt-1.5 font-black text-[#246B45] text-sm">Phone / WhatsApp: 6381109883</p>
          </div>

          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#246B45] hover:bg-[#173D2B] text-white text-xs font-extrabold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <MapPin className="w-4 h-4" /> Open in Google Maps
            </a>
            <a
              href="tel:6381109883"
              className="bg-white/80 hover:bg-white text-[#173D2B] border border-[#173D2B]/15 text-xs font-bold px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 shadow-xs"
            >
              <Phone className="w-4 h-4 text-[#246B45]" /> Call Store Directly
            </a>
          </div>
        </div>

        {/* Right Info Glass Card */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/80 space-y-4 text-xs text-[#65736A] relative z-10 shadow-xl">
          <div className="flex items-center gap-3 border-b border-[#173D2B]/10 pb-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-[#173D2B]/10" />
            <div>
              <h3 className="font-black text-[#173D2B] text-sm">Why Customers Trust Natural Blend</h3>
              <p className="text-[11px] font-bold text-[#246B45]">Homemade & Handcrafted Excellence</p>
            </div>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
              <span><strong className="text-[#173D2B]">Pure Ingredients:</strong> Formulated with authentic herbal extracts, pure neem, aloe vera, and cold-pressed oils.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
              <span><strong className="text-[#173D2B]">Transparent Order Billing:</strong> Product subtotal and shipping cost are calculated weight-wise without hidden fees.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
              <span><strong className="text-[#173D2B]">Instant Customer Tracking:</strong> Track order status in real time with private customer Google Sign-In access.</span>
            </li>
          </ul>
        </div>

      </section>

      {/* Popular Essentials Catalog */}
      {popularProducts.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-[#246B45] uppercase tracking-wider block">More Herbal Favorites</span>
              <h2 className="text-xl sm:text-3xl font-black text-[#173D2B] tracking-tight">
                Popular Essentials
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
