import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBasket, Menu, X, MapPin, Clock } from "lucide-react";
import { BRAND_LOGO } from "../data/products";
import type { SiteSettings } from "../data/siteSettings";

export function InstaIcon({ className = "w-[18px] h-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface Props {
  cartCount: number;
  onCart: () => void;
}

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "This Week", href: "#menu" },
  { label: "Pockets", href: "#menu-pockets" },
  { label: "Fancy Stuff", href: "#menu-fancy" },
  { label: "Classics", href: "#menu-classics" },
  { label: "Sugar Rush", href: "#menu-sugar" },
  { label: "How It Works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar({ cartCount, onCart, settings }: Props & { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Top announcement */}
      <div className="bg-[#2D1E14] text-[#FFFBF2] text-center text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase py-2 px-4 relative z-[60]">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Pre-orders open for this week
          <span className="hidden sm:inline text-white/40">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#F5E8D3]"><Clock className="w-3 h-3" /> Closes {settings.cutoffLabel}</span>
          <span className="hidden md:inline-flex items-center gap-1 text-white/60"><MapPin className="w-3 h-3" /> Ranchi only</span>
        </span>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FFFBF2]/90 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(45,30,20,0.25)] border-b border-[#EAD9BE]"
            : "bg-[#FFFBF2]/70 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[68px]">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl bg-[#6E1E2B] flex items-center justify-center overflow-hidden shadow-lg shadow-[#6E1E2B]/25 group-hover:rotate-6 transition-transform">
              <img src={BRAND_LOGO} alt="Sauce And Sugar logo" className="w-full h-full object-cover" onLoad={() => setLogoLoaded(true)} onError={(event) => { event.currentTarget.style.display = "none"; }} />
              {!logoLoaded && <span className="absolute font-serif italic text-2xl text-[#FFFBF2] leading-none pt-0.5">S</span>}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#C9A24B] border-2 border-[#FFFBF2] flex items-center justify-center text-[9px] font-black text-[#2D1E14]">26</span>
            </div>
            <div className="leading-tight">
              <p className="font-serif font-semibold text-[19px] tracking-tight text-[#2D1E14]">Sauce And Sugar</p>
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#A44E27]">Ranchi • Weekly Batch</p>
            </div>
          </a>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/60 border border-[#EAD9BE] rounded-full p-1 pl-2 pr-2">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-4 py-2 rounded-full text-[13.5px] font-semibold text-[#4A3226] hover:bg-[#2D1E14] hover:text-[#FFFBF2] transition-all"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/sauceandsugar_0926/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex w-10 h-10 rounded-full border border-[#EAD9BE] bg-white items-center justify-center text-[#6E1E2B] hover:bg-[#6E1E2B] hover:text-white hover:border-[#6E1E2B] transition-all"
              aria-label="Instagram"
            >
              <InstaIcon />
            </a>
            <button
              onClick={onCart}
              className="btn-shine relative flex items-center gap-2 bg-[#2D1E14] text-[#FFFBF2] pl-4 pr-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#6E1E2B] transition-colors active:scale-95"
            >
              <ShoppingBasket className="w-[18px] h-[18px]" />
              <span className="hidden sm:inline">Basket</span>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#C4673A] text-white text-[11px] font-black flex items-center justify-center border-2 border-[#FFFBF2]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden w-10 h-10 rounded-full border border-[#EAD9BE] bg-white flex items-center justify-center"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-[#EAD9BE] bg-[#FFFBF2]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 grid gap-1">
                {LINKS.map((l, i) => (
                  <motion.a
                    key={l.label}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-2xl font-serif text-lg text-[#2D1E14] hover:bg-[#F5E8D3] active:bg-[#F5E8D3]"
                  >
                    {l.label}
                    <span className="text-[#C9A24B]">→</span>
                  </motion.a>
                ))}
                <a
                  href="https://www.instagram.com/sauceandsugar_0926/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#6E1E2B] to-[#A44E27] text-white font-bold text-sm"
                >
                  <InstaIcon className="w-4 h-4" /> @sauceandsugar_0926
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
