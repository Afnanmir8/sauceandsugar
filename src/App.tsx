import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingBasket, ArrowRight } from "lucide-react";
import Navbar from "./components/Navbar";
import { Hero, HowItWorks, Countdown, Story, InstagramGrid, Faq, Footer } from "./components/Sections";
import Admin from "./components/Admin";
import {
  MenuSection, ProductModal, CartDrawer, Checkout, Confirmation,
  computeUnit, type CartLine, type PlacedOrder,
} from "./components/Shop";
import { formatINR, PRODUCTS, type Product } from "./data/products";
import { apiBase, DEFAULT_SITE_SETTINGS, type SiteSettings } from "./data/siteSettings";

type View = "home" | "checkout" | "done";

export default function App() {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const saved = window.localStorage.getItem("sauce-and-sugar-cart");
      return saved ? JSON.parse(saved) as CartLine[] : [];
    } catch {
      return [];
    }
  });
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<View>("home");
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [menuRevision, setMenuRevision] = useState(0);
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";

  type ManagedMenuItem = { id: string; name: string; category: Product["category"]; price: number; image: string; stockLeft: number; totalBatch: number; soldOut: boolean };

  const applyMenuFromServer = (menu: ManagedMenuItem[]) => {
    const managedIds = new Set(menu.map((item) => item.id));
    PRODUCTS.splice(0, PRODUCTS.length, ...PRODUCTS.filter((product) => managedIds.has(product.id)));
    menu.forEach((managed) => {
      const existing = PRODUCTS.find((product) => product.id === managed.id);
      if (existing) Object.assign(existing, managed);
      else PRODUCTS.push({ id: managed.id, name: managed.name, category: managed.category, price: managed.price, image: managed.image, stockLeft: managed.stockLeft, totalBatch: managed.totalBatch, soldOut: managed.soldOut, desc: "Prepared fresh from this week's menu.", longDesc: "Prepared fresh to order from this week's Sauce & Sugar menu.", serves: "Serves 1", portion: "Weekly batch", veg: true, ingredients: ["Fresh ingredients"], allergens: ["Please ask before ordering"], prep: "Prepared fresh on dispatch day", rating: 5, orders: "New", customOptions: managed.category === "sugar" ? [] : [{ label: "Sauce", choices: ["Butter garlic", "Lemon butter", "Alfredo", "Arrabbiata", "Pesto", "Pink"] }], addons: managed.category === "sugar" ? [] : [{ label: "Garlic bread (2 pc)", price: 59 }, { label: "Cheese garlic bread (2 pc)", price: 79 }, { label: "Extra cheese", price: 49 }] });
    });
    setMenuRevision((current) => current + 1);
  };

  const applyStockUpdates = (order: PlacedOrder) => {
    order.lines.forEach((line) => {
      const product = PRODUCTS.find((item) => item.id === line.productId);
      if (!product) return;
      product.stockLeft = Math.max(0, product.stockLeft - line.qty);
      product.soldOut = product.stockLeft === 0;
    });
    setMenuRevision((current) => current + 1);
  };

  useEffect(() => {
    fetch(`${apiBase()}/api/site-settings`)
      .then((response) => response.json())
      .then((body) => { if (body.settings) setSettings(body.settings); })
      .catch(() => undefined);
    fetch(`${apiBase()}/api/menu`)
      .then((response) => response.json())
      .then((body) => {
        if (!Array.isArray(body.menu)) return;
        applyMenuFromServer(body.menu);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sauce-and-sugar-cart", JSON.stringify(lines));
  }, [lines]);

  const cartCount = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.unitPrice * l.qty, 0), [lines]);
  const qtyById = useMemo(() => {
    const m: Record<string, number> = {};
    lines.forEach((l) => { m[l.productId] = (m[l.productId] || 0) + l.qty; });
    return m;
  }, [lines]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const addToCart = (p: Product, qty = 1, selections: Record<string, string> = {}, addons: string[] = []) => {
    if (p.soldOut) return;
    const unit = computeUnit(p, selections, addons);
    // normalize default selections
    const normSel: Record<string, string> = {};
    (p.customOptions || []).forEach((o) => {
      normSel[o.label] = selections[o.label] || o.choices[0];
    });
    const key = p.id + "|" + JSON.stringify(normSel) + "|" + [...addons].sort().join(",");
    setLines((prev) => {
      const ex = prev.find((l) => l.key === key);
      if (ex) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(p.stockLeft, l.qty + qty) } : l));
      return [...prev, { key, productId: p.id, qty: Math.min(qty, p.stockLeft), selections: normSel, addons, unitPrice: unit }];
    });
    setSelected(null);
    showToast(`${p.name} added to basket`);
  };

  const changeQty = (key: string, delta: number) => {
    setLines((prev) => prev.flatMap((l) => {
      if (l.key !== key) return [l];
      const product = PRODUCTS.find((p) => p.id === l.productId);
      const nextQty = Math.min(product?.stockLeft ?? l.qty + delta, l.qty + delta);
      return nextQty > 0 ? [{ ...l, qty: nextQty }] : [];
    }));
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isAdmin) return <Admin onExit={() => { window.location.href = "/"; }} />;

  if (view === "checkout") {
    return (
      <>
        <Checkout
          lines={lines}
          settings={settings}
          onBack={() => setView("home")}
          onPlaced={(o, menu) => {
            if (menu?.length) applyMenuFromServer(menu);
            else applyStockUpdates(o);
            setOrder(o);
            window.localStorage.setItem("sauce-and-sugar-last-order", JSON.stringify(o));
            setView("done");
            setLines([]);
            window.scrollTo({ top: 0 });
          }}
        />
      </>
    );
  }

  if (view === "done" && order) {
    return (
      <Confirmation
        order={order}
        onMenu={() => {
          fetch(`${apiBase()}/api/menu`)
            .then((response) => response.json())
            .then((body) => { if (Array.isArray(body.menu)) applyMenuFromServer(body.menu); })
            .catch(() => undefined);
          setView("home");
          setTimeout(() => scrollTo("menu"), 100);
        }}
        onAgain={() => {
          fetch(`${apiBase()}/api/menu`)
            .then((response) => response.json())
            .then((body) => { if (Array.isArray(body.menu)) applyMenuFromServer(body.menu); })
            .catch(() => undefined);
          setOrder(null);
          setView("home");
          setTimeout(() => scrollTo("menu"), 100);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#2D1E14]">
      <Navbar cartCount={cartCount} onCart={() => setCartOpen(true)} settings={settings} />

      <main>
        <Hero onOrder={() => scrollTo("menu")} onExplore={() => scrollTo("menu")} settings={settings} />
        <MenuSection onOpen={setSelected} onQuickAdd={(p) => addToCart(p, 1)} qtyById={qtyById} settings={settings} menuRevision={menuRevision} />
        <Countdown onView={() => scrollTo("menu")} settings={settings} />
        <HowItWorks />
        <Story />
        <InstagramGrid />
        <Faq />
      </main>

      <Footer onMenu={() => scrollTo("menu")} settings={settings} />

      {/* Overlays */}
      <ProductModal
        key={selected?.id || "none"}
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={addToCart}
      />
      <CartDrawer
        open={cartOpen}
        lines={lines}
        settings={settings}
        onClose={() => setCartOpen(false)}
        onQty={changeQty}
        onRemove={(k) => setLines((prev) => prev.filter((l) => l.key !== k))}
        onCheckout={() => {
          if (lines.length === 0) return;
          setCartOpen(false);
          setView("checkout");
          window.scrollTo({ top: 0 });
        }}
      />

      {/* Sticky mobile cart bar */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && !selected && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:hidden"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-[#2D1E14] text-white rounded-2xl pl-4 pr-2 py-2 flex items-center justify-between shadow-2xl border border-white/10 active:scale-[0.98] transition-transform"
            >
              <span className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#6E1E2B] flex items-center justify-center relative">
                  <ShoppingBasket className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#C9A24B] text-[#2D1E14] text-[10px] font-black flex items-center justify-center">{cartCount}</span>
                </span>
                <span className="text-left">
                  <span className="block text-[11px] font-bold text-white/60 leading-none">Basket subtotal</span>
                  <span className="font-black text-[16px]">{formatINR(subtotal)}</span>
                </span>
              </span>
              <span className="bg-[#C9A24B] text-[#2D1E14] font-black text-[13px] rounded-xl px-4 py-3 flex items-center gap-1">
                View Basket <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop floating basket pill (subtle) */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && !selected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setCartOpen(true)}
            className="hidden sm:flex fixed bottom-6 right-6 z-[70] items-center gap-3 bg-[#2D1E14] text-white rounded-full pl-5 pr-2 py-2 shadow-2xl hover:bg-[#6E1E2B] transition-colors"
          >
            <span className="text-sm font-bold">{cartCount} item{cartCount === 1 ? "" : "s"} • {formatINR(subtotal)}</span>
            <span className="bg-[#C9A24B] text-[#2D1E14] text-[13px] font-black rounded-full px-4 py-2.5">Checkout →</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-20 sm:bottom-8 z-[90] bg-[#2D1E14] text-white rounded-full pl-3 pr-4 py-2 flex items-center gap-2 shadow-2xl max-w-[92vw]"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-[13px] font-bold truncate">{toast}</span>
            <button onClick={() => { setToast(null); setCartOpen(true); }} className="ml-1 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1 text-[12px] font-black shrink-0">View</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
