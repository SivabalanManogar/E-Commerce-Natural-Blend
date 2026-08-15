import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, MessageCircle, ExternalLink, ShieldCheck, Heart, Leaf } from 'lucide-react';

export default function Footer() {
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=Natural+Blend+83%2F1+Amman+Shannathi+Karaikudi+630001+Tamil+Nadu+India";
  const whatsappUrl = "https://wa.me/916381109883?text=Hello%20Natural%20Blend,%20I%20have%20an%20enquiry%20about%20your%20products.";

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Column 1: Store Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Natural Blend Logo"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-emerald-500 shrink-0"
              />
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Natural Blend</h3>
                <p className="text-xs text-emerald-400 font-medium">Owned by M. Kavitha M.Sc</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Your trusted local store in Karaikudi for authentic herbal oral care, personal care, hair care, home care & wholesome homemade traditional foods.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 p-2 rounded-lg">
              <Leaf className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>100% Pure, Authentic & Quality Guaranteed</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  • Home
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  • Categories
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  • All Products
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  • My Orders & Tracking
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  • Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Store Address */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Store Address
            </h4>
            <address className="not-italic text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-white">Natural Blend</p>
              <p>83/1, Amman Shannathi</p>
              <p>Karaikudi – 630001</p>
              <p>Tamil Nadu, India</p>
            </address>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Open Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Column 4: Contact & WhatsApp */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-emerald-500 pl-2">
              Contact Store
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href="tel:6381109883"
                className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-slate-200 transition-colors border border-slate-700/60"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Phone Support</div>
                  <div className="font-bold text-white">6381109883</div>
                </div>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 bg-emerald-900/60 hover:bg-emerald-900 rounded-lg text-emerald-200 transition-colors border border-emerald-700/50"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-emerald-300">WhatsApp Chat</div>
                  <div className="font-bold text-white">6381109883</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Natural Blend. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Carefully crafted for local wellness in Karaikudi
          </p>
        </div>
      </div>
    </footer>
  );
}
