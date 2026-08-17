import React from 'react';

export default function FloatingWhatsApp() {
  const whatsappUrl = "https://wa.me/916381109883?text=Hello%20Natural%20Blend!%20I%20am%20interested%20in%20your%20products.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 px-3.5 sm:py-3 sm:px-4 rounded-full shadow-2xl transition-all duration-300 border-2 border-white active:scale-95 hover:scale-105"
      title="Chat on WhatsApp with Natural Blend"
      aria-label="WhatsApp Chat"
    >
      {/* Realtime Active Pulse Badge */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
      </span>

      {/* Official Crystal Clear SVG WhatsApp Icon */}
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 fill-white shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.926 0-3.708-.518-5.245-1.418l-.376-.22-3.896 1.022 1.04-3.797-.247-.393a9.92 9.92 0 0 1-1.521-5.378c0-5.496 4.472-9.967 9.967-9.967 2.664 0 5.167 1.037 7.049 2.92a9.907 9.907 0 0 1 2.916 7.048c0 5.498-4.473 9.969-9.967 9.969m0-18.429a11.455 11.455 0 0 0-8.118 3.364A11.454 11.454 0 0 0 0 11.834c0 2.302.6 4.549 1.74 6.529L0 24l5.807-1.524a11.42 11.42 0 0 0 5.679 1.503c6.326 0 11.474-5.148 11.474-11.474s-5.148-11.474-11.474-11.474" />
      </svg>

      {/* Label Text */}
      <span className="text-xs font-black tracking-wide text-white">
        WhatsApp
      </span>
    </a>
  );
}
