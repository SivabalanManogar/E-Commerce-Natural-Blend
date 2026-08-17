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

      {/* Dynamic Moving Liquid Background Hero Section (Perfectly Fitted) */}
      <section className="relative overflow-hidden animate-liquid-gradient text-[#173D2B] py-8 sm:py-16 px-4 sm:px-12 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-white/60">

        {/* Animated Smooth Moving Organic Blobs */}
        <div className="absolute -top-16 -right-16 w-80 sm:w-96 h-80 sm:h-96 bg-[#4F9D69]/20 rounded-full blur-[70px] pointer-events-none animate-blob-1" />
        <div className="absolute -bottom-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 bg-[#246B45]/15 rounded-full blur-[70px] pointer-events-none animate-blob-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[28rem] h-80 sm:h-[28rem] bg-white/40 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 relative z-10">

          {/* Logo Emblem (Rendered FIRST / TOP on Mobile) */}
          <div className="relative shrink-0 flex items-center justify-center my-2 sm:my-0 order-1 lg:order-2">
            <div className="w-36 h-36 sm:w-56 sm:h-56 rounded-full bg-white p-2.5 shadow-2xl border-4 border-[#246B45]/40 flex items-center justify-center animate-float-soft">
              <img
                src="/logo.png"
                alt="Natural Blend Emblem"
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="absolute -top-1 right-0 bg-white/95 text-[#173D2B] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border border-[#173D2B]/10 shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Karaikudi Store
            </div>

            <div className="absolute -bottom-1 left-0 bg-white/95 text-[#173D2B] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border border-[#173D2B]/10 shadow-md flex items-center gap-1">
              <Leaf className="w-3 h-3 text-[#246B45]" /> Handcrafted Care
            </div>
          </div>

          {/* Hero Content (Rendered SECOND / DOWN on Mobile) */}
          <div className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6 w-full order-2 lg:order-1">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-[#173D2B]/12 text-[#173D2B] text-[11px] sm:text-xs font-extrabold shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-[#246B45] shrink-0" />
              <span>Authentic Herbal Care • Karaikudi</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-2.5xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#173D2B] leading-tight">
              Pure Natural Care <br className="hidden sm:inline" />
              <span className="text-[#246B45]">
                & Homemade Heritage
              </span>
            </h1>

            <p className="text-xs sm:text-base text-[#65736A] max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Formulated with love in Karaikudi by <strong className="text-[#173D2B] font-extrabold underline decoration-[#4F9D69] underline-offset-4">M. Kavitha M.Sc</strong>. Handcrafted herbal tooth powder, organic soaps, cold-pressed oils & traditional wellness foods.
            </p>

            {/* Action CTAs */}
            <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-center lg:justify-start items-stretch sm:items-center gap-3">
              <Link
                to="/products"
                className="group bg-[#246B45] hover:bg-[#173D2B] text-white text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Shop All {products.length || 33}+ Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/85 hover:bg-white text-[#173D2B] border border-[#173D2B]/15 backdrop-blur-md text-xs sm:text-sm font-extrabold px-5 py-3.5 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-[#246B45]" />
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Quick Trust Badges */}
            <div className="pt-3 sm:pt-4 flex flex-wrap justify-center lg:justify-start items-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-[#65736A] border-t border-[#173D2B]/10">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#246B45] shrink-0" />
                <span>100% Pure Herbs</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#246B45] shrink-0" />
                <span>No Artificial Additives</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#246B45] shrink-0" />
                <span>Fast All-India Shipping</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Trust & Delivery Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#246B45]/10 text-[#246B45] flex items-center justify-center shrink-0 border border-[#246B45]/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#173D2B]">Fast Shipping</h4>
            <p className="text-[11px] sm:text-xs text-[#65736A] mt-0.5 leading-relaxed">Quick and reliable order delivery across India.</p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#246B45]/10 text-[#246B45] flex items-center justify-center shrink-0 border border-[#246B45]/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#173D2B]">100% Pure Herbal</h4>
            <p className="text-[11px] sm:text-xs text-[#65736A] mt-0.5 leading-relaxed">Traditional recipes without chemical additives.</p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#246B45]/10 text-[#246B45] flex items-center justify-center shrink-0 border border-[#246B45]/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#173D2B]">M. Kavitha M.Sc</h4>
            <p className="text-[11px] sm:text-xs text-[#65736A] mt-0.5 leading-relaxed">Direct store supervision in Karaikudi.</p>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#246B45]/10 text-[#246B45] flex items-center justify-center shrink-0 border border-[#246B45]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-[#173D2B]">Quality Guaranteed</h4>
            <p className="text-[11px] sm:text-xs text-[#65736A] mt-0.5 leading-relaxed">Fresh small-batch authentic homemade care.</p>
          </div>
        </div>
      </section>

      {/* Product Categories Showcase */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-xs font-extrabold text-[#246B45] uppercase tracking-wider block">Browse by Needs</span>
            <h2 className="text-xl sm:text-3xl font-black text-[#173D2B] tracking-tight">
              Product Categories
            </h2>
          </div>
          <Link to="/categories" className="text-xs font-extrabold text-[#246B45] hover:text-[#173D2B] flex items-center gap-1.5">
            View All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id || cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group glass-panel p-4 sm:p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white overflow-hidden mb-2.5 flex items-center justify-center p-2.5 sm:p-3 border border-[#173D2B]/10 shadow-xs group-hover:scale-105 transition-transform">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                ) : (
                  <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-[#246B45]" />
                )}
              </div>
              <h3 className="text-xs font-extrabold text-[#173D2B] group-hover:text-[#246B45] transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] font-bold text-[#4F9D69] mt-1">Explore Products ➔</span>
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
