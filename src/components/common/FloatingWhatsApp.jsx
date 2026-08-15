import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const whatsappUrl = "https://wa.me/916381109883?text=Hello%20Natural%20Blend!%20I%20am%20interested%20in%20your%20products.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 bg-[#246B45] hover:bg-[#173D2B] text-white p-3 sm:p-3.5 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 group border border-white/40 active:scale-95"
      title="Chat on WhatsApp with Natural Blend"
      aria-label="WhatsApp Chat"
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-extrabold pr-1">
        WhatsApp Us
      </span>
    </a>
  );
}
