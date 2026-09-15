import { useEffect, useState } from "react";
import { ArrowLeft, Check, LogOut, Plus, RefreshCw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { apiBase, DEFAULT_SITE_SETTINGS, ALL_WEEK_DAYS, getPreferredDays, type SiteSettings } from "../data/siteSettings";

type AdminOrder = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area?: string;
  method: "delivery" | "pickup";
  total: number;
  status: string;
  createdAt: string;
  lines: { productId: string; qty: number }[];
};
type MenuItem = { id: string; name: string; category: string; price: number; image: string; stockLeft: number; totalBatch: number; soldOut: boolean };

const STATUSES = ["received", "preparing", "ready", "delivered", "cancelled"];
const inputClass = "w-full rounded-xl border border-[#EAD9BE] bg-white px-3.5 py-3 text-sm font-semibold outline-none focus:border-[#6E1E2B]";

export default function Admin({ onExit }: { onExit: () => void }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("sas-admin-token") || "");
  const [tokenInput, setTokenInput] = useState("");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState<MenuItem>({ id: "", name: "", category: "pockets", price: 0, image: "/images/", stockLeft: 0, totalBatch: 0, soldOut: false });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selectedDays = getPreferredDays(settings);

  const toggleDay = (day: string) => {
    let nextDays: string[];
    if (selectedDays.includes(day)) {
      if (selectedDays.length <= 1) return; // Keep at least one day selected
      nextDays = selectedDays.filter((d) => d !== day);
    } else {
      nextDays = [...selectedDays, day];
    }
    setSettings({
      ...settings,
      preferredDays: nextDays,
      preferredDay: nextDays.join(", "),
    });
  };

  const request = async (path: string, options: RequestInit = {}) => {
    let response: Response;
    try {
      response = await fetch(`${apiBase()}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
      });
    } catch (requestError) {
      throw new Error(requestError instanceof TypeError ? "Admin service is offline. Start or restart npm run server." : "Admin request failed.");
    }
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Admin request failed.");
    return body;
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [settingsResult, ordersResult, menuResult] = await Promise.all([request("/api/site-settings"), request("/api/admin/orders"), request("/api/admin/menu")]);
      setSettings(settingsResult.settings);
      setOrders(ordersResult.orders);
      setMenu(menuResult.menu);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load admin data.");
      if (String(requestError).includes("authorization")) {
        sessionStorage.removeItem("sas-admin-token");
        setToken("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void load();
  }, [token]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      let response: Response;
      try { response = await fetch(`${apiBase()}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: tokenInput }) }); } catch (loginError) { throw new Error(loginError instanceof TypeError ? "Admin service is offline. Start or restart npm run server." : "Could not sign in."); }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Invalid admin token.");
      sessionStorage.setItem("sas-admin-token", tokenInput);
      setToken(tokenInput);
      setTokenInput("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    }
  };

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const result = await request("/api/admin/site-settings", { method: "PUT", body: JSON.stringify(settings) });
      setSettings(result.settings);
      setNotice("Weekly settings saved. Refresh the customer page to see them.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const result = await request(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify({ status }) });
      setOrders((current) => current.map((order) => order.id === id ? result.order : order));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update order.");
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    try { const result = await request(`/api/admin/menu/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(item) }); setMenu((current) => current.map((entry) => entry.id === item.id ? result.item : entry)); setNotice(`${item.name} updated.`); } catch (updateError) { setError(updateError instanceof Error ? updateError.message : "Could not update menu item."); }
  };

  const createMenuItem = async (event: React.FormEvent) => {
    event.preventDefault();
    try { const result = await request("/api/admin/menu", { method: "POST", body: JSON.stringify(newItem) }); setMenu((current) => [...current, result.item]); setNewItem({ id: "", name: "", category: "pockets", price: 0, image: "/images/", stockLeft: 0, totalBatch: 0, soldOut: false }); setNotice("New menu item added."); } catch (createError) { setError(createError instanceof Error ? createError.message : "Could not add menu item."); }
  };

  const deleteMenuItem = async (id: string) => {
    if (!window.confirm("Remove this item from the customer menu?")) return;
    try { await request(`/api/admin/menu/${encodeURIComponent(id)}`, { method: "DELETE" }); setMenu((current) => current.filter((item) => item.id !== id)); setNotice("Menu item removed."); } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Could not remove menu item."); }
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-[#FFFBF2] px-4 py-10 text-[#2D1E14]">
        <div className="mx-auto max-w-md rounded-3xl border border-[#EAD9BE] bg-white p-6 shadow-xl">
          <ShieldCheck className="h-8 w-8 text-[#6E1E2B]" />
          <h1 className="mt-4 font-serif text-3xl font-semibold">Admin sign in</h1>
          <p className="mt-2 text-sm text-[#7A5C4A]">Enter the server admin token to manage weekly settings and orders.</p>
          <form onSubmit={login} className="mt-6 space-y-3">
            <input type="password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} placeholder="Admin token" className={inputClass} autoFocus />
            <button className="w-full rounded-xl bg-[#6E1E2B] px-4 py-3 font-black text-white hover:bg-[#4E1420]">Sign in</button>
          </form>
          {error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}
          <button onClick={onExit} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#7A5C4A]"><ArrowLeft className="h-4 w-4" /> Back to site</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFBF2] px-4 py-6 text-[#2D1E14] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#A44E27]">Sauce And Sugar</p><h1 className="mt-2 font-serif text-4xl font-semibold">Admin dashboard</h1></div>
          <div className="flex gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#EAD9BE] bg-white px-4 py-2.5 text-sm font-black"><RefreshCw className="h-4 w-4" /> Refresh</button><button onClick={() => { sessionStorage.removeItem("sas-admin-token"); setToken(""); }} className="inline-flex items-center gap-2 rounded-xl bg-[#2D1E14] px-4 py-2.5 text-sm font-black text-white"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </header>
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
        {notice && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><Check className="mr-2 inline h-4 w-4" />{notice}</div>}

        <section className="mt-8 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={saveSettings} className="rounded-3xl border border-[#EAD9BE] bg-white p-5 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold">Weekly settings</h2>
            <p className="mt-1 text-sm text-[#7A5C4A]">These values control the customer-facing batch labels.</p>
            <div className="mt-5 grid gap-3">
              <label className="text-xs font-black uppercase tracking-wide">Batch number<input type="number" min="1" value={settings.batchNo} onChange={(event) => setSettings({ ...settings, batchNo: Number(event.target.value) })} className={inputClass + " mt-1.5"} /></label>
              <label className="text-xs font-black uppercase tracking-wide">Week number<input type="number" min="1" value={settings.weekNo} onChange={(event) => setSettings({ ...settings, weekNo: Number(event.target.value) })} className={inputClass + " mt-1.5"} /></label>
              <label className="text-xs font-black uppercase tracking-wide">Week date label<input value={settings.weekLabel} onChange={(event) => setSettings({ ...settings, weekLabel: event.target.value })} placeholder="22 - 28 Sept" className={inputClass + " mt-1.5"} /></label>
              <label className="text-xs font-black uppercase tracking-wide">Order cutoff<input value={settings.cutoffLabel} onChange={(event) => setSettings({ ...settings, cutoffLabel: event.target.value })} placeholder="Sunday 8 PM" className={inputClass + " mt-1.5"} /></label>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wide">Preferred days</label>
                  <span className="text-[11px] font-bold text-[#A44E27]">{selectedDays.length} selected</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#7A5C4A]">Select the days available for delivery/pickup.</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ALL_WEEK_DAYS.map((day) => {
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                          active
                            ? "bg-[#6E1E2B] border-[#6E1E2B] text-white shadow-xs"
                            : "bg-white border-[#EAD9BE] text-[#4A3226] hover:bg-[#F5E8D3]/50"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                            active ? "bg-white text-[#6E1E2B]" : "border border-[#D8C3A5]"
                          }`}
                        >
                          {active && "✓"}
                        </span>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6E1E2B] px-4 py-3 font-black text-white hover:bg-[#4E1420]"><Save className="h-4 w-4" /> Save weekly settings</button>
          </form>

          <section className="rounded-3xl border border-[#EAD9BE] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-serif text-2xl font-semibold">Orders</h2><p className="text-sm text-[#7A5C4A]">{orders.length} total order{orders.length === 1 ? "" : "s"}</p></div><span className="rounded-full bg-[#F5E8D3] px-3 py-1 text-xs font-black">Batch {settings.batchNo}</span></div>
            <div className="mt-5 space-y-3">
              {loading && <p className="text-sm font-bold text-[#7A5C4A]">Loading orders...</p>}
              {!loading && orders.length === 0 && <p className="rounded-2xl bg-[#F5E8D3]/60 p-5 text-sm font-bold text-[#7A5C4A]">No orders yet.</p>}
              {orders.map((order) => <article key={order.id} className="rounded-2xl border border-[#EAD9BE] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="font-black">{order.id}</p><p className="mt-1 text-sm font-bold">{order.name} · {order.phone}</p><p className="text-xs text-[#7A5C4A]">{order.method === "delivery" ? `${order.area || "Area not set"} delivery` : "Pickup"} · {new Date(order.createdAt).toLocaleString("en-IN")}</p></div><div className="flex items-center gap-3"><p className="font-serif text-xl font-semibold">₹{order.total}</p><select value={order.status} onChange={(event) => void updateStatus(order.id, event.target.value)} className="rounded-lg border border-[#EAD9BE] bg-white px-2 py-2 text-xs font-black">{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div></div><p className="mt-3 text-xs font-semibold text-[#7A5C4A]">{order.lines.map((line) => `${line.productId} x${line.qty}`).join(" · ")}</p></article>)}
            </div>
          </section>
        </section>
        <section className="mt-5 rounded-3xl border border-[#EAD9BE] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-serif text-2xl font-semibold">Menu management</h2><p className="text-sm text-[#7A5C4A]">Edit prices, images, stock, availability, or remove items.</p></div><span className="rounded-full bg-[#F5E8D3] px-3 py-1 text-xs font-black">{menu.length} items</span></div>
          <div className="mt-5 grid gap-3">
            {menu.map((item) => <div key={item.id} className="grid gap-2 rounded-2xl border border-[#EAD9BE] p-3 md:grid-cols-[1.3fr_.7fr_.6fr_.6fr_.6fr_auto] md:items-center">
              <div><p className="font-black text-sm">{item.name}</p><p className="text-[11px] text-[#7A5C4A]">{item.id} · {item.category}</p></div>
              <input type="number" min="0" value={item.price} onChange={(event) => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, price: Number(event.target.value) } : entry))} className={inputClass} aria-label={`${item.name} price`} />
              <input type="number" min="0" value={item.totalBatch} onChange={(event) => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, totalBatch: Number(event.target.value) } : entry))} className={inputClass} aria-label={`${item.name} total availability`} />
              <input type="number" min="0" value={item.stockLeft} onChange={(event) => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, stockLeft: Number(event.target.value) } : entry))} className={inputClass} aria-label={`${item.name} remaining stock`} />
              <label className="flex items-center gap-2 text-xs font-black"><input type="checkbox" checked={item.soldOut} onChange={(event) => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, soldOut: event.target.checked } : entry))} /> Sold out</label>
              <div className="flex gap-2"><button onClick={() => void updateMenuItem(item)} className="inline-flex items-center gap-1 rounded-xl bg-[#6E1E2B] px-3 py-2 text-xs font-black text-white"><Save className="h-3.5 w-3.5" /> Save</button><button onClick={() => void deleteMenuItem(item.id)} className="rounded-xl border border-red-200 px-3 py-2 text-red-700"><Trash2 className="h-3.5 w-3.5" /></button></div>
            </div>)}
          </div>
          <form onSubmit={createMenuItem} className="mt-5 rounded-2xl bg-[#F5E8D3]/60 p-4">
            <h3 className="font-serif text-xl font-semibold">Add a new dish</h3><div className="mt-3 grid gap-2 md:grid-cols-6">
              <input required placeholder="Name" value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} className={inputClass} />
              <select value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })} className={inputClass}><option value="pockets">Pockets</option><option value="fancy">Fancy</option><option value="classics">Classics</option><option value="goodies">Goodies</option><option value="sugar">Sugar Rush</option></select>
              <input required type="number" min="0" placeholder="Price" value={newItem.price || ""} onChange={(event) => setNewItem({ ...newItem, price: Number(event.target.value) })} className={inputClass} />
              <input required type="number" min="0" placeholder="Total batch" value={newItem.totalBatch || ""} onChange={(event) => setNewItem({ ...newItem, totalBatch: Number(event.target.value), stockLeft: Number(event.target.value) })} className={inputClass} />
              <input required placeholder="/images/dish.jpeg" value={newItem.image} onChange={(event) => setNewItem({ ...newItem, image: event.target.value })} className={inputClass} />
              <button className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#2D1E14] px-3 py-2 text-sm font-black text-white"><Plus className="h-4 w-4" /> Add dish</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
