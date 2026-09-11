import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Leaf, Flame, Clock, MapPin, Heart,
  Truck, ShoppingBag, ChefHat, ChevronDown, BadgeCheck, Timer, Sparkles, Phone, Mail
} from "lucide-react";
import { HERO_IMG, HERO_DESSERT, MENU_IMAGE, STORY_IMG, KNEAD_IMG, INSTA_POSTS } from "../data/products";
import type { SiteSettings } from "../data/siteSettings";
import { InstaIcon } from "./Navbar";

/* ---------- HERO ---------- */
export function Hero({ onOrder, onExplore, settings }: { onOrder: () => void; onExplore: () => void; settings: SiteSettings }) {
  return (
    <section id="home" className="relative overflow-hidden grain">
      {/* ambient blobs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#F5E8D3] blur-3xl opacity-70" />
      <div className="absolute top-20 -right-40 w-[560px] h-[560px] rounded-full bg-[#F9E8DE] blur-3xl opacity-80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white border border-[#EAD9BE] rounded-full pl-2 pr-4 py-1.5 shadow-sm mb-5"
          >
            <span className="bg-[#1c7a3d] text-white text-[10px] font-black tracking-[0.14em] px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> PRE-ORDERS OPEN
            </span>
            <span className="text-xs font-bold text-[#4A3226]">Batch No. {settings.batchNo} • This week only</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-serif text-[42px] leading-[0.95] sm:text-6xl xl:text-[76px] font-semibold tracking-tight text-[#2D1E14] text-balance"
          >
            Freshly Made.
            <br />
            <span className="italic font-medium text-[#6E1E2B]">Once a Week.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 text-[15px] sm:text-lg text-[#7A5C4A] leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            Handcrafted pasta & desserts made fresh in Ranchi — available{" "}
            <span className="font-bold text-[#2D1E14]">exclusively through weekly pre-orders.</span> No stock. No shortcuts. Just small batches, made for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
          >
            <button
              onClick={onOrder}
              className="btn-shine group bg-[#6E1E2B] hover:bg-[#4E1420] text-white font-bold rounded-full px-8 py-4 text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-[#6E1E2B]/25 active:scale-95 transition-all"
            >
              Order This Week's Menu
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onExplore}
              className="bg-white border-2 border-[#2D1E14]/10 hover:border-[#2D1E14] font-bold rounded-full px-8 py-4 text-[15px] transition-all active:scale-95"
            >
              Explore Menu
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#7A5C4A]"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" /> Fresh batches</span>
            <span className="w-1 h-1 rounded-full bg-[#D8C3A5]" />
            <span>Limited quantities</span>
            <span className="w-1 h-1 rounded-full bg-[#D8C3A5]" />
            <span className="flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 fill-[#6E1E2B] text-[#6E1E2B]" /></span>
          </motion.div>

          {/* social proof mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-7 flex items-center justify-center lg:justify-start gap-3"
          >
            <div className="flex -space-x-2.5">
              {[
                "https://images.pexels.com/photos/14930717/pexels-photo-14930717.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "https://images.pexels.com/photos/26838690/pexels-photo-26838690.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
                "https://images.pexels.com/photos/30910495/pexels-photo-30910495.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
              ].map((s, i) => (
                <img key={i} src={s} alt="customer dish" className="w-9 h-9 rounded-full border-2 border-[#FFFBF2] object-cover shadow" />
              ))}
              <div className="w-9 h-9 rounded-full bg-[#2D1E14] text-white text-[10px] font-black border-2 border-[#FFFBF2] flex items-center justify-center">2k+</div>
            </div>
          </motion.div>
        </div>

        {/* Visual collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <div className="absolute inset-6 bg-[#6E1E2B] rounded-[36px] rotate-3 opacity-10" />
          <div className="relative grid grid-cols-[1.15fr_0.85fr] gap-3">
            <div className="zoom-img relative rounded-[28px] overflow-hidden shadow-2xl shadow-[#2D1E14]/20 border-4 border-white row-span-2 min-h-[380px] sm:min-h-[460px]">
              <img src={HERO_IMG} alt="Fresh handmade alfredo pasta" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6E1E2B] flex items-center justify-center shrink-0">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-black truncate">Creamy Alfredo Pasta</p>
                  <p className="text-[11px] font-bold text-[#A44E27]">Bestseller this week</p>
                </div>
              </div>
            </div>
            <div className="zoom-img relative rounded-[24px] overflow-hidden shadow-xl border-4 border-white min-h-[180px] sm:min-h-[222px]">
              <img src={HERO_DESSERT} alt="Classic tiramisu" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="relative rounded-[24px] overflow-hidden bg-[#2D1E14] text-[#FFFBF2] p-5 flex flex-col justify-between min-h-[180px] sm:min-h-[222px] shadow-xl">
              <div>
                <p className="font-serif italic text-2xl leading-tight">made<br />fresh,<br />not stored.</p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#F5E8D3]">
                <MapPin className="w-3.5 h-3.5" /> Ranchi • Cloud Kitchen
              </div>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#6E1E2B] blur-none opacity-60" />
            </div>
          </div>

          {/* floating badges */}
          <div className="animate-floaty absolute -left-3 sm:-left-6 top-8 bg-white rounded-2xl shadow-xl border border-[#EAD9BE] px-3.5 py-2.5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><Leaf className="w-4 h-4 text-emerald-700" /></span>
            <div><p className="text-xs font-black leading-none">100% Veg</p><p className="text-[10px] font-semibold text-[#7A5C4A]">eggless options</p></div>
          </div>
          <div className="animate-floaty absolute -right-2 sm:-right-4 bottom-16 bg-white rounded-2xl shadow-xl border border-[#EAD9BE] px-3.5 py-2.5 flex items-center gap-2" style={{ animationDelay: "1.2s" }}>
            <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><Flame className="w-4 h-4 text-[#A44E27]" /></span>
            <div><p className="text-xs font-black leading-none">14 left</p><p className="text-[10px] font-semibold text-[#7A5C4A]">Alfredo batch</p></div>
          </div>
        </motion.div>
      </div>

      {/* marquee strip */}
      <div className="relative bg-[#6E1E2B] text-[#FFFBF2] py-3 overflow-hidden -rotate-[0.5deg] scale-[1.01]">
        <div className="flex whitespace-nowrap animate-marquee gap-0 w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center gap-8 pr-8 text-[12px] font-black tracking-[0.2em] uppercase">
              {["Fresh Pasta", "Classic Tiramisu", "Biscoff Cheesecake", "Pink Sauce", "Basque Cheesecake", "Pre-orders Only", "Ranchi", "Small Batches"].map((t) => (
                <span key={t + k} className="flex items-center gap-8"><span>{t}</span><span className="text-[#C9A24B]">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */
export function HowItWorks() {
  const steps = [
    { n: "01", title: "Choose", desc: "Pick your favourite pasta or dessert from this week's menu.", icon: ShoppingBag },
    { n: "02", title: "Pre-Order", desc: "Place your order before the weekly cut-off time.", icon: Timer },
    { n: "03", title: "Enjoy", desc: "We prepare everything fresh and arrange delivery / pickup in Ranchi.", icon: Truck },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-[11px] font-black tracking-[0.28em] uppercase text-[#A44E27]">How weekly pre-orders work</p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight mt-3">Simple as <span className="italic text-[#6E1E2B]">one, two, yum.</span></h2>
      </div>
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1 }}
            className="relative bg-white rounded-[26px] border border-[#EAD9BE] p-7 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <span className="font-serif italic text-[64px] leading-none text-[#F5E8D3] absolute top-3 right-5 select-none">{s.n}</span>
            <div className="w-12 h-12 rounded-2xl bg-[#2D1E14] flex items-center justify-center mb-5">
              <s.icon className="w-5 h-5 text-[#F5E8D3]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-[#7A5C4A] leading-relaxed font-medium">{s.desc}</p>
            {i < 2 && <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-6 bg-[#FFFBF2] border-t border-r border-[#EAD9BE] rotate-45 translate-y-[-50%]" />}
          </motion.div>
        ))}
      </div>
      <div className="mt-6 bg-[#2D1E14] text-[#F5E8D3] rounded-[22px] px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center">
        <Heart className="w-4 h-4 fill-[#C4673A] text-[#C4673A] shrink-0" />
        <p className="text-sm font-semibold italic font-serif text-[16px]">"We don't cook for stock. Every order is prepared especially for you."</p>
      </div>
    </section>
  );
}

export function MenuReference({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="grid lg:grid-cols-[0.72fr_1fr] gap-8 items-center bg-[#F5E8D3] border border-[#EAD9BE] rounded-[28px] p-5 sm:p-8 overflow-hidden">
        <div>
          <p className="text-[11px] font-black tracking-[0.22em] uppercase text-[#A44E27]">Our original menu</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-2">The menu that started it all.</h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#7A5C4A] font-medium">Browse the illustrated menu, then choose your favourites from the live pre-order catalog below.</p>
          <button onClick={onOrder} className="mt-5 bg-[#6E1E2B] text-white font-black rounded-full px-6 py-3 text-sm hover:bg-[#4E1420] transition-colors">Order from this week's menu <ArrowRight className="inline w-4 h-4 ml-1" /></button>
        </div>
        <div className="relative rounded-2xl overflow-hidden bg-white border-4 border-white shadow-xl max-h-[520px]">
          <img src={MENU_IMAGE} alt="Sauce And Sugar illustrated pasta and dessert menu" className="w-full h-auto object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          <div className="absolute inset-0 -z-10 flex items-center justify-center text-center p-8 text-[#7A5C4A] font-semibold">Add the supplied menu image as <span className="ml-1 font-black">public/menu.png</span>.</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- COUNTDOWN ---------- */
export function useCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  // Next Sunday 20:00 local
  const day = now.getDay(); // 0 = Sunday
  let add = (7 - day) % 7;
  const sunday8 = new Date(now);
  sunday8.setDate(now.getDate() + add);
  sunday8.setHours(20, 0, 0, 0);
  if (sunday8.getTime() <= now.getTime()) sunday8.setDate(sunday8.getDate() + 7);
  const diff = Math.max(0, sunday8.getTime() - now.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const label = sunday8.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  return { d, h, m, s, label };
}

export function Countdown({ onView, settings }: { onView: () => void; settings: SiteSettings }) {
  const { d, h, m, s, label } = useCountdown();
  const units = [
    { v: d, l: "Days" },
    { v: h, l: "Hours" },
    { v: m, l: "Minutes" },
    { v: s, l: "Seconds" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#4E1420] via-[#6E1E2B] to-[#A44E27] text-white p-8 sm:p-12 grain">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-black/20 blur-2xl" />
        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-black tracking-[0.24em] uppercase bg-white/15 border border-white/20 rounded-full px-4 py-1.5">
              <Clock className="w-3.5 h-3.5" /> Orders close soon
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold mt-4 leading-tight">Don't miss<br />this week's batch.</h2>
            <p className="mt-3 text-white/75 font-medium text-[15px]">Pre-order before <span className="font-black text-white">{settings.cutoffLabel}</span> to secure your favourites. Once the batch sells out, pre-orders close.</p>
            <button onClick={onView} className="btn-shine mt-6 bg-[#FFFBF2] text-[#4E1420] font-black rounded-full px-7 py-3.5 text-sm hover:bg-white active:scale-95 transition-all inline-flex items-center gap-2">
              View This Week's Menu <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
            {units.map((u) => (
              <div key={u.l} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl py-5 sm:py-7 text-center">
                <p className="font-serif text-3xl sm:text-5xl font-semibold tabular-nums">{String(u.v).padStart(2, "0")}</p>
                <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-white/60 mt-1">{u.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- BRAND STORY ---------- */
export function Story() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
      <div className="relative order-2 lg:order-1">
        <div className="grid grid-cols-2 gap-3">
          <img src={STORY_IMG} alt="Fresh handmade pasta" className="rounded-[24px] object-cover h-[280px] sm:h-[360px] w-full border-4 border-white shadow-xl" />
          <img src={KNEAD_IMG} alt="Hand kneaded dough" className="rounded-[24px] object-cover h-[280px] sm:h-[360px] w-full mt-8 border-4 border-white shadow-xl" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 bg-[#2D1E14] text-white rounded-full pl-2 pr-5 py-2 flex items-center gap-3 shadow-xl">
          <span className="bg-[#C9A24B] text-[#2D1E14] font-serif italic font-bold w-9 h-9 rounded-full flex items-center justify-center">S&S</span>
          <span className="text-xs font-bold">Cloud kitchen • Made at home, with love</span>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <p className="text-[11px] font-black tracking-[0.28em] uppercase text-[#A44E27]">Our story</p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight mt-3 leading-[1.02]">Small Batches.<br /><span className="italic text-[#6E1E2B]">Big Cravings.</span></h2>
        <p className="mt-5 text-[#7A5C4A] leading-relaxed font-medium text-[15px]">
          Sauce And Sugar is a Ranchi-based food business bringing freshly made pasta and desserts to your table in limited weekly batches. Everything is prepared fresh, so we take pre-orders instead of keeping ready-made stock.
        </p>
        <p className="mt-3 text-[#7A5C4A] leading-relaxed font-medium text-[15px]">
          One cook-day a week. One fresh batch. Pasta rolled, sauces simmered, desserts chilled overnight — then packed and sent out across Ranchi. That's it. That's the magic.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { v: "30+", l: "Dishes weekly" },
            { v: "100%", l: "Made fresh" },
            { v: "0", l: "Ready stock" },
          ].map((s) => (
            <div key={s.l} className="bg-white border border-[#EAD9BE] rounded-2xl p-4 text-center">
              <p className="font-serif text-3xl font-semibold text-[#6E1E2B]">{s.v}</p>
              <p className="text-[11px] font-bold text-[#7A5C4A] mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INSTAGRAM ---------- */
export function InstagramGrid() {
  return (
    <section className="bg-[#2D1E14] text-[#FFFBF2] py-14 sm:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-black tracking-[0.28em] uppercase text-[#C9A24B] flex items-center gap-2"><InstaIcon className="w-4 h-4" /> @sauceandsugar_0926</p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold mt-3 leading-tight">Made for Your Feed.<br /><span className="italic text-[#EAD9BE]">Made for Your Table.</span></h2>
          </div>
          <a href="https://www.instagram.com/sauceandsugar_0926/" target="_blank" rel="noreferrer" className="btn-shine shrink-0 inline-flex items-center gap-2 bg-[#FFFBF2] text-[#2D1E14] font-black rounded-full px-6 py-3.5 text-sm hover:bg-white active:scale-95 transition-all">
            <InstaIcon className="w-4 h-4" /> View Instagram
          </a>
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INSTA_POSTS.map((p, i) => (
            <motion.a
              key={i}
              href="https://www.instagram.com/sauceandsugar_0926/"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-white/10"
            >
              <img src={p.img} alt="Sauce And Sugar on Instagram" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[11px] font-black flex items-center gap-1"><Heart className="w-3.5 h-3.5 fill-white" /> {p.likes}</span>
                <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center"><InstaIcon className="w-3.5 h-3.5" /></span>
              </div>
            </motion.a>
          ))}
        </div>
        {/* Customer notes */}
        <div className="mt-8 grid sm:grid-cols-3 gap-3">
          {[
            { t: "The pink sauce pasta tasted straight out of a café in Delhi. Finished it in 10 minutes flat.", n: "Ananya • Lalpur" },
            { t: "Biscoff cheesecake is dangerously good. Ordered 3 slices, zero regrets.", n: "Rohan • Harmu" },
            { t: "Finally, proper alfredo in Ranchi. Creamy, fresh, and the packing was so premium.", n: "Sneha • Kanke Road" },
          ].map((r) => (
            <div key={r.n} className="bg-white/[0.06] border border-white/10 rounded-2xl p-5">
              <div className="mb-2">
                <span className="text-[9px] font-black tracking-[0.18em] uppercase bg-white/10 px-2 py-0.5 rounded-full text-white/70">Customer note</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-white/85 font-medium">"{r.t}"</p>
              <p className="mt-3 text-xs font-black text-[#C9A24B]">{r.n}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQS = [
  { q: "When can I place an order?", a: "Orders are accepted during the weekly pre-order window — typically Monday to Sunday 8:00 PM. Once the batch sells out or the cut-off passes, ordering pauses until next week's menu drops." },
  { q: "Do you have a physical restaurant?", a: "No. Sauce And Sugar operates as a cloud / home-based food business in Ranchi and focuses purely on pre-orders. There's no dine-in or walk-in store — everything is made fresh for confirmed pre-orders only." },
  { q: "How often is the menu available?", a: "Fresh pasta and desserts are prepared once a week in a single batch. The menu changes weekly — follow @sauceandsugar_0926 on Instagram for the drop announcement every Monday." },
  { q: "Can I customize my order?", a: "Yes! Most dishes offer customizations like pasta shape, spice level, extra cheese, and add-ons such as garlic bread. Open any dish to see its available options." },
  { q: "Do you offer delivery in Ranchi?", a: "Yes — home delivery is ₹40 below 5 km and ₹80 from 5 km onward. Delivery is free above ₹999, plus a free pickup option is available." },
  { q: "Can I order after the cut-off time?", a: "Orders are subject to weekly availability and limited batch quantities. After cut-off, remaining portions (if any) are at our discretion — it's best to pre-order early in the week." },
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="text-center">
        <p className="text-[11px] font-black tracking-[0.28em] uppercase text-[#A44E27]">Good to know</p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold mt-3">Questions, <span className="italic text-[#6E1E2B]">answered.</span></h2>
      </div>
      <div className="mt-8 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={`bg-white border rounded-[20px] overflow-hidden transition-all ${isOpen ? "border-[#6E1E2B]/30 shadow-lg" : "border-[#EAD9BE]"}`}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left">
                <span className="font-bold text-[15px]">{f.q}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-[#6E1E2B] text-white rotate-180" : "bg-[#F5E8D3] text-[#2D1E14]"}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 sm:px-6 pb-5 text-sm leading-relaxed text-[#7A5C4A] font-medium">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
export function Footer({ onMenu, settings }: { onMenu: () => void; settings: SiteSettings }) {
  return (
    <footer className="relative overflow-hidden bg-[#1E130D] text-[#F5E8D3]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C9A24B] via-[#A44E27] to-[#6E1E2B]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#C9A24B]/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr_.75fr_1.35fr]">
          <div className="lg:pr-8">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-serif font-semibold text-xl">Sauce And Sugar</p>
                <p className="text-[10px] font-black tracking-[0.22em] uppercase text-[#C9A24B]">Fresh Pasta & Desserts • Ranchi</p>
              </div>
            </div>
            <p className="mt-5 max-w-xs font-serif italic text-[18px] leading-snug text-white/80">"Freshly made once a week. Pre-orders only."</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">Small-batch pasta, desserts, and comfort food made at home and packed fresh for Ranchi.</p>
            <a href="https://www.instagram.com/sauceandsugar_0926/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2.5 bg-white/10 hover:bg-[#6E1E2B] border border-white/10 rounded-full pl-2 pr-5 py-1.5 transition-all">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F9CE34] via-[#EE2A7B] to-[#6228D7] flex items-center justify-center"><InstaIcon className="w-4 h-4 text-white" /></span>
              <span className="text-sm font-bold">@sauceandsugar_0926</span>
            </a>
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] uppercase text-[#C9A24B] mb-4">Explore</p>
            <div className="grid gap-2.5 text-sm font-semibold">
              <a href="#menu" className="hover:text-[#C9A24B] transition-colors">This Week's Menu</a>
              <a href="#menu-pockets" className="hover:text-[#C9A24B] transition-colors">Pockets of Joy</a>
              <a href="#menu-fancy" className="hover:text-[#C9A24B] transition-colors">The Fancy Stuff</a>
              <a href="#menu-classics" className="hover:text-[#C9A24B] transition-colors">The OG Classics</a>
              <a href="#menu-sugar" className="hover:text-[#C9A24B] transition-colors">Sugar Rush</a>
              <a href="#how" className="hover:text-[#C9A24B] transition-colors">How It Works</a>
              <a href="#faq" className="hover:text-[#C9A24B] transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] uppercase text-[#C9A24B] mb-4">Order</p>
            <div className="grid gap-2.5 text-sm font-semibold">
              <button onClick={onMenu} className="text-left hover:text-[#C9A24B] transition-colors">Pre-order now</button>
              <span className="flex items-center gap-1.5 text-white/70"><Clock className="w-3.5 h-3.5" /> Cut-off: {settings.cutoffLabel}</span>
              <span className="flex items-center gap-1.5 text-white/70"><Truck className="w-3.5 h-3.5" /> Delivery in Ranchi</span>
              <span className="flex items-center gap-1.5 text-white/70"><BadgeCheck className="w-3.5 h-3.5" /> 100% Veg kitchen</span>
            </div>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4 sm:p-5 shadow-2xl shadow-black/20">
            <p className="text-[11px] font-black tracking-[0.22em] uppercase text-[#C9A24B] mb-4">Visit / Contact</p>
            <div className="grid gap-2.5 text-sm font-semibold text-white/80">
              <span className="flex items-start gap-1.5"><MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#C9A24B]" /> PP Compound, Sabharwal Enclave,<br /> near Guru Nanak School, Ranchi</span>
              <a href="tel:9341231420" className="flex items-center gap-1.5 hover:text-[#C9A24B] transition-colors"><Phone className="w-3.5 h-3.5 text-[#C9A24B]" /> 9341231420</a>
              <a href="mailto:sauceandsugar0926@gmail.com" className="flex items-center gap-1.5 hover:text-[#C9A24B] transition-colors"><Mail className="w-3.5 h-3.5 text-[#C9A24B]" /> sauceandsugar0926@gmail.com</a>
              <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-lg">
                <iframe
                  title="Sauce And Sugar kitchen location"
                  src="https://www.google.com/maps?q=PP+Compound+Sabharwal+Enclave+near+Guru+Nanak+School+Ranchi+Jharkhand&output=embed"
                  className="h-36 w-full border-0 grayscale-[0.15]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=PP+Compound+Sabharwal+Enclave+near+Guru+Nanak+School+Ranchi+Jharkhand" target="_blank" rel="noreferrer" className="text-xs text-[#C9A24B] hover:text-white transition-colors">Open in Google Maps →</a>
              <span className="text-white/50 text-xs leading-relaxed">Cloud kitchen — no walk-ins.<br />DM on Instagram for bulk / party pre-orders.</span>
              <button onClick={onMenu} className="mt-2 w-full bg-[#C9A24B] text-[#1E130D] font-black rounded-xl px-5 py-3 text-[13px] hover:bg-white transition-all">Start a pre-order →</button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-semibold text-white/40">
          <p>© 2026 Sauce And Sugar • Fresh weekly pre-orders in Ranchi</p>
          <p className="flex items-center gap-1.5">Crafted with <Heart className="w-3.5 h-3.5 fill-[#6E1E2B] text-[#C4673A]" /> in Ranchi</p>
        </div>
      </div>
    </footer>
  );
}
