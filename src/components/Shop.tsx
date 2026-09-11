import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Minus, X, Leaf, Flame, Trash2, ShoppingBasket,
  ArrowRight, ArrowLeft, Check, Bike, Store, ChevronRight,
  Clock, ShieldCheck, Info, Sparkles, PackageCheck
} from "lucide-react";
import { PRODUCTS, formatINR, type Category, type Product } from "../data/products";
import { apiBase, type SiteSettings } from "../data/siteSettings";

const WHATSAPP_NUMBER = "919341231420";
const UPI_ID = "khushpreetkaur8822-2@okhdfcbank";

/* ---------- Shared types ---------- */
export interface CartLine {
  key: string;
  productId: string;
  qty: number;
  selections: Record<string, string>;
  addons: string[];
  unitPrice: number;
}

export interface PlacedOrder {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  landmark: string;
  date: string;
  method: "delivery" | "pickup";
  distanceKm: number;
  payment: string;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  note: string;
}

export function productById(id: string) {
  return PRODUCTS.find((p) => p.id === id)!;
}

export function parseExtra(choice: string): number {
  const m = choice.match(/\+₹\s?(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function computeUnit(product: Product, selections: Record<string, string>, addons: string[]) {
  let extra = 0;
  Object.values(selections).forEach((c) => (extra += parseExtra(c)));
  (product.addons || []).forEach((a) => {
    if (addons.includes(a.label)) extra += a.price;
  });
  return product.price + extra;
}

export function lineLabel(line: CartLine) {
  const parts: string[] = [];
  Object.entries(line.selections).forEach(([, v]) => {
    if (!v.startsWith("Classic") && !v.startsWith("Mild") && v !== "Penne" && v !== "Solo cup" && v !== "Box of 2" && v !== "Single (450g)" && v !== "Butter-sage" && v !== "Classic mix" && v !== "Classic dark" && v !== "Slice" && v !== "Single") parts.push(v.replace(/ \(\+₹.*/, ""));
  });
  line.addons.forEach((a) => parts.push("+ " + a));
  return parts.join(" • ");
}

/* ---------- Small atoms ---------- */
export function TagBadge({ tag }: { tag: NonNullable<Product["tag"]> }) {
  const styles: Record<string, string> = {
    BESTSELLER: "bg-[#2D1E14] text-[#F5E8D3]",
    "LIMITED BATCH": "bg-[#6E1E2B] text-white",
    "THIS WEEK": "bg-[#1c7a3d] text-white",
    "ALMOST SOLD OUT": "bg-[#C4673A] text-white animate-pulse",
    NEW: "bg-[#C9A24B] text-[#2D1E14]",
    "CHEF'S PICK": "bg-white text-[#2D1E14] border border-[#2D1E14]/20",
  };
  return (
    <span className={`text-[9.5px] font-black tracking-[0.12em] px-2.5 py-1 rounded-full shadow ${styles[tag]}`}>{tag}</span>
  );
}

function StockBar({ left, total }: { left: number; total: number }) {
  const pct = Math.max(4, Math.round((left / total) * 100));
  const hot = pct < 30;
  return (
    <div>
      <div className="h-1.5 rounded-full bg-[#F0E2C8] overflow-hidden">
        <div className={`h-full rounded-full transition-all ${hot ? "bg-[#C4673A]" : "bg-[#1c7a3d]"}`} style={{ width: pct + "%" }} />
      </div>
      <p className={`mt-1.5 text-[11px] font-bold ${hot ? "text-[#A44E27]" : "text-[#1c7a3d]"}`}>
        {hot ? `Only ${left} left in batch` : `${left} of ${total} available`}
      </p>
    </div>
  );
}

/* ---------- MENU SECTION ---------- */
type Filter = "all" | Category;

const CATEGORY_META: { id: Category; label: string }[] = [
  { id: "pockets", label: "Pockets of Joy" },
  { id: "fancy", label: "The Fancy Stuff" },
  { id: "classics", label: "The OG Classics" },
  { id: "goodies", label: "Guilt-free Goodies" },
  { id: "sugar", label: "Sugar Rush" },
];

export function MenuSection({
  onOpen,
  onQuickAdd,
  qtyById,
  settings,
  menuRevision = 0,
}: {
  onOpen: (p: Product) => void;
  onQuickAdd: (p: Product) => void;
  qtyById: Record<string, number>;
  settings: SiteSettings;
  menuRevision?: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (query && !(p.name + p.desc).toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }).map((p) => ({ ...p }));
  }, [filter, query, menuRevision]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "Everything" },
    ...CATEGORY_META.map((category) => ({ id: category.id, label: category.label })),
  ];

  return (
    <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.24em] uppercase bg-white border border-[#EAD9BE] rounded-full px-4 py-1.5 text-[#A44E27]">
          <Sparkles className="w-3.5 h-3.5" /> Week {settings.weekNo} • {settings.weekLabel} • Weekly menu
        </p>
        <h2 className="font-serif text-4xl sm:text-[54px] leading-[1.02] font-semibold tracking-tight mt-4">
          This Week at <span className="italic text-[#6E1E2B]">Sauce And Sugar</span>
        </h2>
        <p className="mt-3 text-[#7A5C4A] font-medium text-[15px]">Our menu changes weekly. Once the batch sells out, pre-orders close.</p>
      </div>

      {/* Filter + search */}
      <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between sticky top-[68px] z-30 bg-[#FFFBF2]/90 backdrop-blur-xl py-3 -mx-1 px-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold border-2 transition-all active:scale-95 ${
                filter === t.id
                  ? "bg-[#2D1E14] text-white border-[#2D1E14] shadow-lg"
                  : "bg-white text-[#4A3226] border-[#EAD9BE] hover:border-[#2D1E14]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Alfredo, tiramisu…"
            className="w-full bg-white border-2 border-[#EAD9BE] focus:border-[#6E1E2B] rounded-full pl-10 pr-4 py-2.5 text-sm font-semibold outline-none transition-colors placeholder:text-[#B9A48C] placeholder:font-medium"
          />
          <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B9A48C]" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        </div>
      </div>

      {CATEGORY_META.filter((category) => filter === "all" || filter === category.id).map((category) => {
        const categoryItems = list.filter((p) => p.category === category.id);
        return (
          <div id={`menu-${category.id}`} key={category.id} className="scroll-mt-36">
            <div className="mt-6 mb-4 flex items-center gap-3">
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold">{category.label}</h3>
              <div className="flex-1 h-px bg-[#EAD9BE]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryItems.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} onOpen={onOpen} onQuickAdd={onQuickAdd} inCart={qtyById[p.id] || 0} />
              ))}
            </div>
          </div>
        );
      })}

      {list.length === 0 && (
        <div className="mt-10 text-center bg-white border border-dashed border-[#EAD9BE] rounded-3xl py-14 px-6">
          <p className="font-serif text-2xl">Nothing matched "{query}"</p>
          <p className="text-sm text-[#7A5C4A] font-medium mt-1">Try "pasta", "biscoff" or "chocolate".</p>
          <button onClick={() => { setQuery(""); setFilter("all"); }} className="mt-4 bg-[#2D1E14] text-white text-sm font-bold rounded-full px-6 py-3">Show everything</button>
        </div>
      )}
    </section>
  );
}

function ProductCard({
  p, index, onOpen, onQuickAdd, inCart,
}: {
  p: Product; index: number; onOpen: (p: Product) => void; onQuickAdd: (p: Product) => void; inCart: number;
}) {
  const soldOut = p.soldOut || p.stockLeft === 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (index % 4) * 0.07, duration: 0.45 }}
      className={`group relative bg-white rounded-[24px] border border-[#EDE0C8] overflow-hidden flex flex-col hover:shadow-[0_20px_50px_-16px_rgba(45,30,20,0.3)] hover:-translate-y-1 transition-all duration-300 ${soldOut ? "opacity-95" : ""}`}
    >
      <button onClick={() => !soldOut && onOpen(p)} className="zoom-img relative block aspect-[4/3] overflow-hidden text-left w-full">
        <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {p.tag && <TagBadge tag={p.tag} />}
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {p.veg && <span className="w-6 h-6 rounded-md bg-white flex items-center justify-center border border-emerald-600" title="Veg"><span className="w-3 h-3 rounded-full border-[1.5px] border-emerald-700 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-700" /></span></span>}
          {p.spice === "Spicy" && <span className="h-6 px-2 rounded-md bg-black/60 backdrop-blur text-white text-[10px] font-black flex items-center gap-1"><Flame className="w-3 h-3" /> SPICY</span>}
        </div>
        {soldOut && (
          <div className="absolute inset-0 bg-[#2D1E14]/55 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white text-[#2D1E14] font-black text-xs tracking-[0.18em] px-5 py-2.5 rounded-full rotate-[-4deg] shadow-xl">SOLD OUT THIS WEEK</span>
          </div>
        )}
        {inCart > 0 && !soldOut && (
          <span className="absolute bottom-3 right-3 bg-[#2D1E14] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">● {inCart} in basket</span>
        )}
      </button>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => !soldOut && onOpen(p)} className="text-left font-serif text-[19px] font-semibold leading-tight hover:text-[#6E1E2B] transition-colors">{p.name}</button>
        </div>
        <div className="mt-1 text-[11.5px] font-bold text-[#7A5C4A]">
          {p.serves}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-[#7A5C4A] font-medium line-clamp-2">{p.desc}</p>

        <div className="mt-3">
          {soldOut ? (
            <p className="text-[11px] font-bold text-[#A44E27] bg-[#F9E8DE] rounded-lg px-3 py-2">Back next batch • Notify me on Instagram</p>
          ) : (
            <StockBar left={p.stockLeft} total={p.totalBatch} />
          )}
        </div>

        <div className="pt-3 border-t border-dashed border-[#EAD9BE] flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-[19px]">{formatINR(p.price)}</span>
              {p.mrp && <span className="text-xs font-bold text-[#B9A48C] line-through">{formatINR(p.mrp)}</span>}
            </div>
            <p className="text-[10.5px] font-bold text-[#B9A48C]">{p.portion}</p>
          </div>
          {soldOut ? (
            <button disabled className="bg-[#F0E2C8] text-[#B9A48C] text-[13px] font-black rounded-full px-5 py-2.5 cursor-not-allowed">Sold out</button>
          ) : (
            <button
              onClick={() => onQuickAdd(p)}
              className="btn-shine bg-[#6E1E2B] hover:bg-[#4E1420] text-white text-[13px] font-black rounded-full pl-4 pr-5 py-2.5 flex items-center gap-1.5 active:scale-90 transition-all shadow-lg shadow-[#6E1E2B]/20"
            >
              <Plus className="w-4 h-4" strokeWidth={3} /> Add
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- PRODUCT MODAL ---------- */
export function ProductModal({
  product, onClose, onAdd,
}: {
  product: Product | null; onClose: () => void; onAdd: (p: Product, qty: number, selections: Record<string, string>, addons: string[]) => void;
}) {
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [addons, setAddons] = useState<string[]>([]);

  // reset when product changes — handled via key from parent; still sync:
  const unit = product ? computeUnit(product, selections, addons) : 0;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-[#2D1E14]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFBF2] w-full sm:max-w-3xl h-[92vh] sm:h-[min(720px,92vh)] min-h-0 overflow-hidden rounded-t-[28px] sm:rounded-[28px] flex flex-col sm:grid sm:grid-cols-[1fr_1fr] shadow-2xl"
          >
            {/* Image side */}
            <div className="relative h-60 sm:h-auto sm:min-h-0 shrink-0">
              <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#FFFBF2]/10" />
              <button onClick={onClose} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-lg active:scale-90"><X className="w-4 h-4" /></button>
              <div className="absolute top-4 right-4 flex gap-1.5">{product.tag && <TagBadge tag={product.tag} />}</div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/95 backdrop-blur text-[11px] font-black px-3 py-1.5 rounded-full flex items-center gap-1"><Leaf className="w-3 h-3 text-emerald-700" /> 100% VEG</span>
                <span className="bg-white/95 backdrop-blur text-[11px] font-black px-3 py-1.5 rounded-full">{product.serves}</span>
              </div>
            </div>

            {/* Content side */}
            <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-[26px] sm:text-3xl font-semibold leading-tight">{product.name}</h3>
                <div className="text-right shrink-0">
                  <p className="font-black text-xl">{formatINR(product.price)}</p>
                  <p className="text-[11px] font-bold text-[#B9A48C]">{product.portion}</p>
                </div>
              </div>
              <div className="mt-1.5 text-xs font-bold text-[#7A5C4A]">
                <span className="ml-1 bg-[#1c7a3d]/10 text-[#1c7a3d] px-2 py-0.5 rounded-full text-[10px] font-black">MADE FRESH • THIS WEEK</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#4A3226] font-medium">{product.longDesc}</p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Portion", v: product.serves },
                  { l: "Batch", v: `${product.stockLeft} left` },
                  { l: "Pre-order", v: "Required" },
                ].map((s) => (
                  <div key={s.l} className="bg-white border border-[#EAD9BE] rounded-xl py-2.5 px-1">
                    <p className="text-[10px] font-black tracking-widest uppercase text-[#B9A48C]">{s.l}</p>
                    <p className="text-[13px] font-black mt-0.5">{s.v}</p>
                  </div>
                ))}
              </div>

              {/* Customizations */}
              {(product.customOptions || []).map((opt) => (
                <div key={opt.label} className="mt-4">
                  <p className="text-[12px] font-black tracking-wide uppercase text-[#4A3226]">{opt.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {opt.choices.map((c) => {
                      const active = (selections[opt.label] || opt.choices[0]) === c;
                      return (
                        <button
                          key={c}
                          onClick={() => setSelections((s) => ({ ...s, [opt.label]: c }))}
                          className={`text-[13px] font-bold rounded-full px-4 py-2 border-2 transition-all active:scale-95 ${active ? "bg-[#2D1E14] text-white border-[#2D1E14]" : "bg-white border-[#EAD9BE] hover:border-[#2D1E14]"}`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {(product.addons || []).length > 0 && (
                <div className="mt-4">
                  <p className="text-[12px] font-black tracking-wide uppercase text-[#4A3226]">Make it extra</p>
                  <div className="mt-2 space-y-2">
                    {product.addons!.map((a) => {
                      const on = addons.includes(a.label);
                      return (
                        <button
                          key={a.label}
                          onClick={() => setAddons((prev) => (on ? prev.filter((x) => x !== a.label) : [...prev, a.label]))}
                          className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${on ? "border-[#6E1E2B] bg-[#6E1E2B]/5" : "border-[#EAD9BE] bg-white"}`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${on ? "bg-[#6E1E2B] border-[#6E1E2B] text-white" : "border-[#D8C3A5] text-transparent"}`}><Check className="w-3.5 h-3.5" strokeWidth={3.5} /></span>
                            {a.label}
                          </span>
                          <span className="text-[#A44E27]">+{formatINR(a.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="mt-4 bg-white border border-[#EAD9BE] rounded-2xl p-4 space-y-2.5 text-[12.5px] font-medium text-[#4A3226]">
                <p><span className="font-black">Ingredients: </span>{product.ingredients.join(", ")}</p>
                <p><span className="font-black">Allergens: </span><span className="text-[#A44E27] font-bold">{product.allergens.join(", ")}</span></p>
                <p className="flex gap-1.5"><Info className="w-4 h-4 shrink-0 text-[#C9A24B]" />{product.prep}</p>
              </div>

              {/* CTA */}
              <div className="sticky bottom-0 -mx-5 sm:-mx-7 -mb-5 sm:-mb-7 mt-5 bg-[#FFFBF2]/95 backdrop-blur border-t border-[#EAD9BE] p-4 flex items-center gap-3">
                <div className="flex items-center bg-white border-2 border-[#EAD9BE] rounded-full">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center active:scale-90"><Minus className="w-4 h-4" /></button>
                  <span className="w-7 text-center font-black tabular-nums">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stockLeft, q + 1))} className="w-10 h-11 flex items-center justify-center active:scale-90"><Plus className="w-4 h-4" /></button>
                </div>
                <button
                  onClick={() => { onAdd(product, qty, selections, addons); setQty(1); setSelections({}); setAddons([]); }}
                  className="btn-shine flex-1 bg-[#6E1E2B] hover:bg-[#4E1420] text-white font-black rounded-full py-3.5 text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-[#6E1E2B]/25"
                >
                  Add to Pre-Order • {formatINR(unit * qty)}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- CART DRAWER ---------- */
export function CartDrawer({
  open, lines, onClose, onQty, onRemove, onCheckout, settings,
}: {
  open: boolean; lines: CartLine[]; onClose: () => void;
  onQty: (key: string, delta: number) => void; onRemove: (key: string) => void; onCheckout: () => void;
  settings: SiteSettings;
}) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const deliveryFee = 0;
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[85] bg-[#2D1E14]/60 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[86] w-full sm:w-[440px] bg-[#FFFBF2] shadow-2xl flex flex-col rounded-l-[28px] overflow-hidden"
          >
            <div className="bg-[#2D1E14] text-white px-5 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-semibold flex items-center gap-2"><ShoppingBasket className="w-5 h-5" /> Your Pre-Order</h3>
                <p className="text-[11px] font-bold text-white/60 tracking-wide">WEEK {settings.weekNo} BATCH • {lines.length} item{lines.length === 1 ? "" : "s"}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90"><X className="w-4 h-4" /></button>
            </div>

            {lines.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
                <div className="w-20 h-20 rounded-full bg-[#F5E8D3] flex items-center justify-center"><ShoppingBasket className="w-8 h-8 text-[#A44E27]" /></div>
                <p className="font-serif text-2xl font-semibold">Your pre-order basket is empty.</p>
                <p className="text-sm text-[#7A5C4A] font-medium">Fresh batches sell out fast — grab your favourites before {settings.cutoffLabel}.</p>
                <button onClick={onClose} className="mt-2 bg-[#6E1E2B] text-white font-bold rounded-full px-7 py-3 text-sm">Explore This Week's Menu</button>
              </div>
            ) : (
              <>
                {subtotal < 999 && (
                  <div className="mx-4 mt-4 bg-white border border-[#EAD9BE] rounded-2xl p-3.5">
                    <p className="text-xs font-bold">Add <span className="text-[#A44E27]">{formatINR(999 - subtotal)}</span> more for <span className="text-[#1c7a3d]">FREE delivery</span></p>
                    <div className="mt-2 h-2 rounded-full bg-[#F0E2C8] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#C9A24B] to-[#6E1E2B] rounded-full transition-all" style={{ width: Math.min(100, (subtotal / 999) * 100) + "%" }} />
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {lines.map((l) => {
                    const p = productById(l.productId);
                    return (
                      <motion.div key={l.key} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#EAD9BE] rounded-2xl p-3 flex gap-3">
                        <img src={p.image} alt={p.name} className="w-[72px] h-[72px] rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-[13.5px] leading-tight truncate">{p.name}</p>
                            <button onClick={() => onRemove(l.key)} className="text-[#B9A48C] hover:text-[#6E1E2B] active:scale-90 shrink-0"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          {lineLabel(l) && <p className="text-[11px] font-semibold text-[#A44E27] truncate mt-0.5">{lineLabel(l)}</p>}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center bg-[#FFFBF2] border border-[#EAD9BE] rounded-full">
                              <button onClick={() => onQty(l.key, -1)} className="w-7 h-7 flex items-center justify-center active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="w-6 text-center text-[13px] font-black tabular-nums">{l.qty}</span>
                              <button onClick={() => onQty(l.key, 1)} className="w-7 h-7 flex items-center justify-center active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                            <p className="font-black text-[14px]">{formatINR(l.unitPrice * l.qty)}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="border-t border-[#EAD9BE] bg-white px-5 py-4 space-y-1.5">
                  <div className="flex justify-between text-sm font-semibold text-[#7A5C4A]"><span>Subtotal</span><span className="text-[#2D1E14] font-bold">{formatINR(subtotal)}</span></div>
                  <div className="flex justify-between text-sm font-semibold text-[#7A5C4A]"><span>Delivery fee</span><span className="text-[#2D1E14] font-bold">Calculated at checkout</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#EAD9BE]"><span className="font-black">Total</span><span className="font-serif text-2xl font-semibold">{formatINR(subtotal + deliveryFee)}</span></div>
                  <button onClick={onCheckout} className="btn-shine w-full mt-2 bg-[#6E1E2B] hover:bg-[#4E1420] text-white font-black rounded-full py-4 text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                    Continue to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] font-semibold text-[#B9A48C] flex items-center justify-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Secure order details • Fresh weekly batch</p>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- CHECKOUT ---------- */
const AREAS = ["Lalpur", "Harmu", "Kanke Road", "Bariatu", "Argora", "Hinoo", "Doranda", "Ratu Road", "Kokar", "Morabadi", "Main Road", "Dhurwa", "Birsa Chowk", "Other"];

type MenuStockSnapshot = { id: string; name: string; category: Product["category"]; price: number; image: string; stockLeft: number; totalBatch: number; soldOut: boolean };

export function Checkout({
  lines, onBack, onPlaced, settings,
}: {
  lines: CartLine[]; onBack: () => void; onPlaced: (o: PlacedOrder, menu?: MenuStockSnapshot[]) => void;
  settings: SiteSettings;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", area: "Lalpur", landmark: "", date: "Monday", note: "" });
  const [deliveryQuote, setDeliveryQuote] = useState<{ area: string; deliveryFee: number; freeDelivery: boolean; message: string } | null>(null);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [upiPaymentComplete, setUpiPaymentComplete] = useState(false);
  const [tried, setTried] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const deliveryFee = method === "pickup" ? 0 : deliveryQuote?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;
  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Sauce And Sugar")}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Sauce And Sugar order")}`;

  useEffect(() => {
    if (method === "pickup") {
      setDeliveryQuote(null);
      setDeliveryError("");
      return;
    }
    if (!form.area) {
      setDeliveryQuote(null);
      return;
    }
    let cancelled = false;
    setCalculatingDelivery(true);
    setDeliveryError("");
    fetch(`${apiBase()}/api/delivery/calculate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area: form.area, subtotal }),
    }).then((response) => response.json().then((body) => ({ ok: response.ok, body }))).then(({ ok, body }) => {
      if (!ok) throw new Error(body.error || "Unable to calculate delivery distance.");
      if (!cancelled) setDeliveryQuote(body);
    }).catch((error) => {
      if (!cancelled) {
        const message = error instanceof TypeError && error.message === "Failed to fetch"
          ? "Checkout service is offline. Please try again in a moment."
          : error instanceof Error ? error.message : "Unable to calculate delivery distance.";
        setDeliveryError(message);
      }
    }).finally(() => { if (!cancelled) setCalculatingDelivery(false); });
    return () => { cancelled = true; };
  }, [form.area, method, subtotal]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid =
    form.name.trim().length >= 3 &&
    /^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")) &&
    (method === "pickup" || (form.address.trim().length >= 8 && deliveryQuote !== null && !calculatingDelivery)) &&
    (!form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email));

  const place = async () => {
    setTried(true);
    if (!valid || (payment === "UPI" && !upiPaymentComplete)) {
      document.getElementById("checkout-errors")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPlacing(true);
    const order = {
        id: `SAS-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        name: form.name, phone: form.phone, email: form.email,
        address: form.address, area: form.area, landmark: form.landmark,
        date: form.date, method, payment, lines, subtotal, deliveryFee, total, note: form.note,
    };
    let finalOrder: PlacedOrder;
    let updatedMenu: MenuStockSnapshot[] | undefined;
    try {
      const endpoint = `${apiBase()}/api/orders`;
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to submit your order.");
      finalOrder = result.order;
      if (Array.isArray(result.menu)) updatedMenu = result.menu;
    } catch (error) {
      setPlacing(false);
      setDeliveryError(error instanceof Error ? error.message : "Unable to submit your order.");
      document.getElementById("checkout-errors")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const items = finalOrder.lines.map((line) => {
      const product = productById(line.productId);
      const options = lineLabel(line);
      return `${product.name}${options ? ` (${options})` : ""} x${line.qty} - ${formatINR(line.unitPrice * line.qty)}`;
    }).join("\n");
    const destination = finalOrder.method === "pickup"
      ? "Pickup from Ranchi kitchen"
      : `${finalOrder.address}, ${finalOrder.area}${finalOrder.landmark ? `, near ${finalOrder.landmark}` : ""}`;
    const message = [
      "*New Sauce & Sugar Pre-Order*",
      `Order ID: ${finalOrder.id}`,
      "",
      `Customer: ${finalOrder.name}`,
      `Phone: ${finalOrder.phone}`,
      finalOrder.email ? `Email: ${finalOrder.email}` : "",
      `Items:\n${items}`,
      "",
      `Method: ${finalOrder.method === "pickup" ? "Pickup" : "Home delivery"}`,
      `Address: ${destination}`,
      finalOrder.method === "delivery" ? `Delivery area: ${finalOrder.area}` : "",
      `Delivery fee: ${finalOrder.deliveryFee ? formatINR(finalOrder.deliveryFee) : "FREE"}`,
      `Preferred day: ${finalOrder.date}`,
      `Payment: ${finalOrder.payment}`,
      finalOrder.note ? `Note: ${finalOrder.note}` : "",
      "",
      `Subtotal: ${formatINR(finalOrder.subtotal)}`,
      `*Total: ${formatINR(finalOrder.total)}*`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setPlacing(false);
    onPlaced(finalOrder, updatedMenu);
  };

  const inputCls = (bad: boolean) =>
    `w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-colors placeholder:text-[#B9A48C] placeholder:font-medium ${bad ? "border-red-400" : "border-[#EAD9BE] focus:border-[#6E1E2B]"}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FFFBF2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#7A5C4A] hover:text-[#2D1E14]"><ArrowLeft className="w-4 h-4" /> Back to menu</button>
        <div className="mt-4 flex items-center gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold">Checkout</h1>
            <p className="text-xs font-bold text-[#A44E27] tracking-wide">WEEK {settings.weekNo} PRE-ORDER • FRESH BATCH</p>
          </div>
        </div>

        <div id="checkout-errors">
          {tried && !valid && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 text-red-800 text-sm font-bold rounded-2xl px-4 py-3">
              Please check your name, mobile number, email, and {method === "delivery" ? "full delivery address" : "order details"}.
            </div>
          )}
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div className="space-y-4">
            {/* Customer */}
            <div className="bg-white border border-[#EAD9BE] rounded-[22px] p-5 sm:p-6">
              <h3 className="font-serif text-xl font-semibold flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#2D1E14] text-white text-xs font-black flex items-center justify-center">1</span> Customer Details</h3>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Full Name *</label>
                  <input value={form.name} onChange={set("name")} placeholder="e.g. Priya Sharma" className={inputCls(tried && form.name.trim().length < 3) + " mt-1.5"} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Mobile Number *</label>
                  <input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit mobile" className={inputCls(tried && !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) + " mt-1.5"} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Email (for confirmation)</label>
                  <input value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls(false) + " mt-1.5"} />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white border border-[#EAD9BE] rounded-[22px] p-5 sm:p-6">
              <h3 className="font-serif text-xl font-semibold flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#2D1E14] text-white text-xs font-black flex items-center justify-center">2</span> Delivery Details</h3>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button onClick={() => setMethod("delivery")} className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${method === "delivery" ? "border-[#6E1E2B] bg-[#6E1E2B]/5" : "border-[#EAD9BE]"}`}>
                  <Bike className="w-5 h-5 text-[#6E1E2B]" />
                  <p className="font-black text-sm mt-1.5">Home Delivery</p>
                  <p className="text-[11px] font-bold text-[#7A5C4A]">{subtotal >= 999 ? "FREE this order" : "Delivery fee based on locality"}</p>
                </button>
                <button onClick={() => setMethod("pickup")} className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] ${method === "pickup" ? "border-[#6E1E2B] bg-[#6E1E2B]/5" : "border-[#EAD9BE]"}`}>
                  <Store className="w-5 h-5 text-[#6E1E2B]" />
                  <p className="font-black text-sm mt-1.5">Pickup</p>
                  <p className="text-[11px] font-bold text-[#7A5C4A]">Free • Ranchi point</p>
                </button>
              </div>
              {method === "delivery" ? (
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Delivery Address *</label>
                    <input value={form.address} onChange={(event) => { set("address")(event); setDeliveryQuote(null); }} placeholder="House / flat, street…" className={inputCls(tried && form.address.trim().length < 8) + " mt-1.5"} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Area / Locality</label>
                    <select value={form.area} onChange={set("area")} className={inputCls(false) + " mt-1.5"}>
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Landmark</label>
                    <input value={form.landmark} onChange={set("landmark")} placeholder="Near…" className={inputCls(false) + " mt-1.5"} />
                  </div>
                  {calculatingDelivery && <p className="sm:col-span-2 text-xs font-bold text-[#A44E27]">Calculating delivery distance...</p>}
                  {deliveryError && <p className="sm:col-span-2 text-xs font-bold text-red-700">{deliveryError}</p>}
                  {deliveryQuote && !calculatingDelivery && <div className="sm:col-span-2 rounded-xl bg-[#F5E8D3]/60 px-3 py-2 text-xs font-bold text-[#4A3226]">{form.area} • Delivery charge: {deliveryQuote.freeDelivery ? "FREE" : formatINR(deliveryQuote.deliveryFee)}</div>}
                </div>
              ) : (
                <div className="mt-4 bg-[#F5E8D3]/60 border border-dashed border-[#D8C3A5] rounded-2xl p-4 text-sm font-semibold text-[#4A3226] flex gap-2">
                  <Store className="w-4 h-4 mt-0.5 shrink-0 text-[#A44E27]" />
                  Pickup from our Ranchi kitchen point. Exact location and slot will be shared on confirmation.
                </div>
              )}
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Preferred day</label>
                  <select value={form.date} onChange={set("date")} className={inputCls(false) + " mt-1.5"}>
                    <option>Monday</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-wide text-[#7A5C4A]">Note (optional)</label>
                  <input value={form.note} onChange={set("note")} placeholder="Less spicy, ring bell twice…" className={inputCls(false) + " mt-1.5"} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-[#EAD9BE] rounded-[22px] p-5 sm:p-6">
              <h3 className="font-serif text-xl font-semibold flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#2D1E14] text-white text-xs font-black flex items-center justify-center">3</span> Payment</h3>
              <div className="mt-4 grid gap-2">
                {["Cash on Delivery", "UPI"].map((p) => (
                  <button key={p} onClick={() => { setPayment(p); setUpiPaymentComplete(false); }} className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all active:scale-[0.99] ${payment === p ? "border-[#6E1E2B] bg-[#6E1E2B]/5" : "border-[#EAD9BE]"}`}>
                    <span className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === p ? "border-[#6E1E2B]" : "border-[#D8C3A5]"}`}>
                        {payment === p && <span className="w-2.5 h-2.5 rounded-full bg-[#6E1E2B]" />}
                      </span>{p}
                    </span>
                    {p === "UPI" && <span className="text-[10px] font-black bg-[#1c7a3d]/10 text-[#1c7a3d] px-2 py-1 rounded-full">PAY NOW</span>}
                  </button>
                ))}
              </div>
              {payment === "UPI" && (
                <div className="mt-3 rounded-2xl bg-[#F5E8D3]/70 border border-[#EAD9BE] p-3.5">
                  <p className="text-xs font-black text-[#4A3226]">Pay {formatINR(total)} via UPI</p>
                  <p className="mt-1 text-[12px] font-bold text-[#7A5C4A] break-all">{UPI_ID}</p>
                  <a href={upiLink} className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#1c7a3d] px-4 py-2.5 text-sm font-black text-white hover:bg-[#155f2f] transition-colors">
                    Pay using UPI app
                  </a>
                  <button onClick={() => setUpiPaymentComplete(true)} className={`mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-black transition-colors ${upiPaymentComplete ? "bg-[#1c7a3d]/15 text-[#1c7a3d]" : "bg-[#2D1E14] text-white hover:bg-[#4E1420]"}`}>
                    {upiPaymentComplete ? "Payment completed" : "I have completed payment - continue"}
                  </button>
                </div>
              )}
              <p className="mt-3 text-[11.5px] font-semibold text-[#B9A48C] flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Complete payment first, then your order opens in WhatsApp.</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#2D1E14] text-white rounded-[22px] p-5 sm:p-6 lg:sticky lg:top-24">
            <h3 className="font-serif text-xl font-semibold">Order Summary</h3>
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
              {lines.map((l) => {
                const p = productById(l.productId);
                return (
                  <div key={l.key} className="flex gap-3 items-center bg-white/[0.06] rounded-2xl p-2.5">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate">{p.name} × {l.qty}</p>
                      {lineLabel(l) && <p className="text-[10.5px] text-white/50 font-semibold truncate">{lineLabel(l)}</p>}
                    </div>
                    <p className="text-[13px] font-black shrink-0">{formatINR(l.unitPrice * l.qty)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-sm font-semibold text-white/70 border-t border-white/10 pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-white">{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>{method === "pickup" ? "Pickup" : "Delivery"} fee</span><span className="text-white">{method === "pickup" ? "FREE" : calculatingDelivery ? "Calculating..." : deliveryQuote ? (deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)) : "Select address"}</span></div>
              <div className="flex justify-between text-base font-black text-white pt-2"><span>Total</span><span className="font-serif text-2xl">{formatINR(total)}</span></div>
            </div>
            <button
              onClick={place} disabled={placing || (payment === "UPI" && !upiPaymentComplete)}
              className="btn-shine w-full mt-4 bg-[#C9A24B] hover:bg-white text-[#2D1E14] font-black rounded-full py-4 text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {placing ? (
                <><span className="w-4 h-4 border-2 border-[#2D1E14]/30 border-t-[#2D1E14] rounded-full animate-spin" /> Placing your pre-order…</>
              ) : (
                <>{payment === "UPI" ? "Send Paid Order on WhatsApp" : "Send Order on WhatsApp"} • {formatINR(total)} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
            <p className="mt-3 text-center text-[11px] font-semibold text-white/40 flex items-center justify-center gap-1"><Clock className="w-3.5 h-3.5" /> Fresh batch cooks after cut-off • Sat/Sun slots</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- CONFIRMATION ---------- */
export function Confirmation({ order, onMenu, onAgain }: { order: PlacedOrder; onMenu: () => void; onAgain: () => void }) {
  const steps = ["Order Received", "Preparing", "Ready", "Delivered"];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FFFBF2] grain relative">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 12 }} className="mx-auto w-20 h-20 rounded-full bg-[#1c7a3d] flex items-center justify-center shadow-2xl shadow-emerald-900/20">
          <PackageCheck className="w-9 h-9 text-white" />
        </motion.div>
        <p className="mt-5 inline-block text-[11px] font-black tracking-[0.22em] uppercase bg-[#1c7a3d]/10 text-[#1c7a3d] px-4 py-1.5 rounded-full">Order {order.id} • confirmed</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold mt-3">Your Pre-Order <span className="italic text-[#6E1E2B]">Is Confirmed!</span></h1>
        <p className="mt-3 text-[#7A5C4A] font-medium text-[15px] max-w-md mx-auto">Thank you for ordering from Sauce And Sugar, {order.name.split(" ")[0]}! Your food will be freshly prepared for this week's batch.</p>

        {/* timeline */}
        <div className="mt-8 bg-white border border-[#EAD9BE] rounded-[22px] p-5 sm:p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-[15px] left-6 right-6 h-0.5 bg-[#F0E2C8]" />
            <div className="absolute top-[15px] left-6 w-[12%] h-0.5 bg-[#1c7a3d]" />
            {steps.map((s, i) => (
              <div key={s} className="relative flex flex-col items-center gap-1.5 w-16">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${i === 0 ? "bg-[#1c7a3d] border-[#1c7a3d] text-white" : "bg-white border-[#EAD9BE] text-[#B9A48C]"}`}>
                  {i === 0 ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`text-[10px] font-black text-center leading-tight ${i === 0 ? "text-[#1c7a3d]" : "text-[#B9A48C]"}`}>{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#1c7a3d]/5 border border-[#1c7a3d]/15 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#1c7a3d] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1c7a3d] animate-pulse" /> Status: Order Received — we start cooking after cut-off
          </div>
        </div>

        {/* details */}
        <div className="mt-4 bg-[#2D1E14] text-white rounded-[22px] p-5 sm:p-6 text-left">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-[10px] font-black tracking-[0.18em] uppercase text-white/40">Customer</p><p className="font-bold mt-1">{order.name}</p><p className="text-white/60 font-semibold text-[13px]">{order.phone}</p></div>
            <div><p className="text-[10px] font-black tracking-[0.18em] uppercase text-white/40">{order.method === "pickup" ? "Pickup" : "Deliver to"}</p><p className="font-bold mt-1">{order.method === "pickup" ? "Ranchi pickup point" : `${order.address}, ${order.area}`}</p><p className="text-white/60 font-semibold text-[13px]">Expected: {order.date}</p></div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
            {order.lines.map((l) => {
              const p = productById(l.productId);
              return (
                <div key={l.key} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <p className="flex-1 text-[13px] font-bold truncate">{p.name} <span className="text-white/50">× {l.qty}</span></p>
                  <p className="text-[13px] font-black">{formatINR(l.unitPrice * l.qty)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-white/60">Paid via {order.payment} • Total</span>
            <span className="font-serif text-3xl font-semibold">{formatINR(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button onClick={onMenu} className="flex-1 bg-[#6E1E2B] text-white font-black rounded-full py-4 text-sm hover:bg-[#4E1420] active:scale-[0.98] transition-all">Back to Menu</button>
          <button onClick={onAgain} className="flex-1 bg-white border-2 border-[#2D1E14]/10 font-black rounded-full py-4 text-sm hover:border-[#2D1E14] active:scale-[0.98] transition-all">Order Again</button>
        </div>
        <p className="mt-4 text-xs font-semibold text-[#B9A48C]">Keep your order number {order.id} for reference. Follow <a className="text-[#6E1E2B] font-black" href="https://www.instagram.com/sauceandsugar_0926/" target="_blank" rel="noreferrer">@sauceandsugar_0926</a> for batch-day stories.</p>
      </div>
    </motion.div>
  );
}
