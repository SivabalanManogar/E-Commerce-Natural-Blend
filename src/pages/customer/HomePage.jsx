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

      {/* Rich Dark Forest Herbal Background Hero Section with Floating Animations & Responsive Layout */}
      <section className="relative overflow-hidden bg-dark-herbal-pattern text-white py-9 sm:py-14 px-4 sm:px-12 rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-emerald-800/40">

        {/* Animated Ambient Light Globs & Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-[#176B4D]/35 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none animate-blob-1" />
        <div className="absolute -bottom-20 -left-20 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-800/20 rounded-full blur-[80px] pointer-events-none animate-blob-2" />

        {/* ================= FLOATING ANIMATED NATURAL BACKGROUND ITEMS ================= */}
        <div className="absolute top-5 left-6 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-1 filter drop-shadow-md opacity-85 z-0" title="Leaf">🌿</div>
        <div className="absolute top-6 right-8 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-2 filter drop-shadow-md opacity-85 z-0" title="Herb">🌱</div>
        <div className="absolute bottom-6 left-8 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-3 filter drop-shadow-md opacity-85 z-0" title="Flower">🌸</div>
        <div className="absolute bottom-8 right-10 text-3xl sm:text-4xl select-none pointer-events-none animate-float-natural-4 filter drop-shadow-md opacity-85 z-0" title="Petal">🍃</div>
        <div className="absolute top-12 left-1/3 text-2xl sm:text-3xl select-none pointer-events-none animate-float-natural-1 filter drop-shadow-sm opacity-75 z-0" title="Sparkles">✨</div>
        <div className="hidden sm:block absolute top-1/2 left-4 -translate-y-1/2 text-2xl sm:text-3xl select-none pointer-events-none animate-float-natural-2 opacity-70 z-0" title="Hibiscus">🌺</div>
        <div className="hidden sm:block absolute top-1/2 right-4 -translate-y-1/2 text-2xl sm:text-3xl select-none pointer-events-none animate-float-natural-3 opacity-70 z-0" title="Clover">🍀</div>

        {/* Hero Container: On Mobile stacked (Logo Top), On PC side-by-side (Logo Right) */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10 text-center lg:text-left">

          {/* ================= LOGO EMBLEM (MOBILE: TOP / ORDER-1, PC: RIGHT SIDE / LG:ORDER-2) ================= */}
          <div className="order-1 lg:order-2 relative shrink-0 flex items-center justify-center">
            <div className="w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full bg-white p-2.5 sm:p-3 shadow-[0_0_60px_rgba(23,107,77,0.6)] border-4 border-emerald-400/40 flex items-center justify-center animate-float-soft relative">
              <img
                src="/logo.png"
                alt="Natural Blend Emblem"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="absolute -top-1 right-0 sm:right-2 bg-[#072B1E]/95 backdrop-blur-md text-[#FBBF24] text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full border border-[#C89B3C]/50 shadow-lg flex items-center gap-1">
              <Star className="w-3 h-3 text-[#FBBF24] fill-[#FBBF24]" /> Karaikudi Store
            </div>

            <div className="absolute -bottom-1 left-0 sm:left-2 bg-[#072B1E]/95 backdrop-blur-md text-emerald-300 text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/40 shadow-lg flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-400" /> Handcrafted Care
            </div>
          </div>

          {/* ================= TEXT CONTENT (MOBILE: BELOW LOGO / ORDER-2, PC: LEFT SIDE / LG:ORDER-1) ================= */}
          <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 max-w-2xl flex flex-col items-center lg:items-start">
            
            {/* Top Pill Badges Row */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-extrabold shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Authentic Herbal Care • Karaikudi</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C89B3C]/20 backdrop-blur-md border border-[#C89B3C]/50 text-[#FBBF24] text-[11px] sm:text-xs font-extrabold shadow-lg">
                <Award className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                <span>Formulated by: M. KAVITHA M.Sc</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              Pure Natural Care <br className="hidden sm:inline" />
              <span className="text-[#34D399] bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                & Homemade Heritage
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-emerald-100/90 font-medium leading-relaxed max-w-xl drop-shadow-xs">
              Handcrafted herbal tooth powder, organic soaps, cold-pressed oils & traditional wellness foods formulated with pure ingredients in Karaikudi.
            </p>

            {/* Quick Trust Badges */}
            <div className="pt-4 sm:pt-6 flex flex-wrap justify-center lg:justify-start items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-emerald-200/90 border-t border-emerald-800/60 w-full">
              <div className="flex items-center gap-1.5 font-extrabold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Pure Herbs</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No Artificial Additives</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
