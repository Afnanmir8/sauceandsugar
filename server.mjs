import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";

const port = Number(process.env.PORT || 8787);
const seedDir = join(process.cwd(), "data");
const dataDir = process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : seedDir;
const distDir = join(process.cwd(), "dist");
const publicDir = join(process.cwd(), "public");
const dataFile = join(dataDir, "orders.json");
const settingsFile = join(dataDir, "site-settings.json");
const menuFile = join(dataDir, "menu.json");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const adminToken = process.env.ADMIN_TOKEN || "";
const deliveryFeesByArea = JSON.parse(process.env.DELIVERY_FEES_BY_AREA || "{}");

const productPrices = {
  "cottage-corn-ravioli": 199, "caramelised-onion-ravioli": 189, "chicken-cheese-ravioli": 229, "egg-cream-ravioli": 219,
  "spaghetti-veg": 179, "spaghetti-nonveg": 209, "fettuccine-veg": 189, "fettuccine-nonveg": 219,
  "farfalle-veg": 179, "farfalle-nonveg": 209, "penne-veg": 169, "penne-nonveg": 199,
  "fusilli-veg": 179, "fusilli-nonveg": 209, "macaroni-veg": 169, "macaroni-nonveg": 189,
  "cottage-alfredo-veg": 189, "cottage-alfredo-nonveg": 219, "high-fibre-veg": 169, "high-fibre-nonveg": 199,
  "garlic-bread": 59, "cheese-garlic-bread": 79, "extra-cheese": 49,
  tiramisu: 160, "tres-leches": 140, brownie: 110, "five-layer-dream-tub": 230, "korean-bun": 120,
};

const addonPrices = {
  "Garlic bread (2 pc)": 59,
  "Cheese garlic bread (2 pc)": 79,
  "Extra cheese": 49,
};

const notificationTargets = {
  whatsapp: process.env.WHATSAPP_WEBHOOK_URL,
  email: process.env.EMAIL_WEBHOOK_URL,
  instagram: process.env.INSTAGRAM_WEBHOOK_URL,
};

async function readOrders() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    return [];
  }
}

async function saveOrders(orders) {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(orders, null, 2) + "\n", "utf8");
}

async function readSettings() {
  try {
    const s = JSON.parse(await readFile(settingsFile, "utf8"));
    if (!Array.isArray(s.preferredDays) || s.preferredDays.length === 0) {
      s.preferredDays = s.preferredDay
        ? s.preferredDay.split(",").map((d) => d.trim()).filter(Boolean)
        : ["Monday"];
    }
    s.preferredDay = s.preferredDays.join(", ") || "Monday";
    return s;
  } catch {
    return { batchNo: 42, weekNo: 42, weekLabel: "15 - 21 Sept", cutoffLabel: "Sunday 8 PM", preferredDay: "Monday", preferredDays: ["Monday"] };
  }
}

async function saveSettings(settings) {
  await mkdir(dirname(settingsFile), { recursive: true });
  await writeFile(settingsFile, JSON.stringify(settings, null, 2) + "\n", "utf8");
}

async function readMenu() {
  try { return JSON.parse(await readFile(menuFile, "utf8")); } catch { return []; }
}

async function saveMenu(menu) {
  await mkdir(dirname(menuFile), { recursive: true });
  await writeFile(menuFile, JSON.stringify(menu, null, 2) + "\n", "utf8");
}

async function ensureDataFiles() {
  await mkdir(dataDir, { recursive: true });
  const files = {
    "orders.json": "[]\n",
    "menu.json": "[]\n",
    "site-settings.json": JSON.stringify({ batchNo: 1, weekNo: 1, weekLabel: "This week", cutoffLabel: "Sunday 8 PM", preferredDay: "Monday" }, null, 2) + "\n",
  };
  for (const [name, fallback] of Object.entries(files)) {
    const dest = join(dataDir, name);
    try {
      await readFile(dest);
      continue;
    } catch {
      try {
        await writeFile(dest, await readFile(join(seedDir, name), "utf8"));
      } catch {
        await writeFile(dest, fallback);
      }
    }
  }
}

function safeFilePath(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/");
  const resolved = resolve(root, decoded.replace(/^\/+/, ""));
  if (resolved !== root && !resolved.startsWith(`${root}\\`) && !resolved.startsWith(`${root}/`)) return null;
  return resolved;
}

async function existingFile(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

async function serveStatic(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const urlPath = (request.url || "/").split("?")[0];
  if (urlPath === "/health" || urlPath.startsWith("/api/")) return false;

  const candidates = [];
  if (urlPath === "/" || urlPath === "/index.html") {
    candidates.push(join(distDir, "index.html"));
  } else {
    const fromDist = safeFilePath(distDir, urlPath);
    const fromPublic = safeFilePath(publicDir, urlPath);
    if (fromDist) candidates.push(fromDist);
    if (fromPublic) candidates.push(fromPublic);
  }

  let file = null;
  for (const candidate of candidates) {
    file = await existingFile(candidate);
    if (file) break;
  }
  if (!file) file = await existingFile(join(distDir, "index.html"));
  if (!file) return false;

  response.writeHead(200, { "Content-Type": mimeTypes[extname(file).toLowerCase()] || "application/octet-stream" });
  if (request.method === "HEAD") {
    response.end();
    return true;
  }
  createReadStream(file).pipe(response);
  return true;
}

function isAdmin(request) {
  return Boolean(adminToken) && request.headers.authorization === `Bearer ${adminToken}`;
}

function requireAdmin(request, response) {
  if (!adminToken) {
    send(response, 503, { error: "Admin access is not configured. Set ADMIN_TOKEN on the server." });
    return false;
  }
  if (!isAdmin(request)) {
    send(response, 401, { error: "Admin authorization required." });
    return false;
  }
  return true;
}

function orderMessage(order) {
  const items = order.lines.map((line) => `${line.productId} x${line.qty}`).join(", ");
  const destination = order.method === "pickup"
    ? "Pickup from Ranchi kitchen"
    : `${order.address}, ${order.area}${order.landmark ? `, near ${order.landmark}` : ""}`;
  return [
    `New Sauce & Sugar order: ${order.id}`,
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    order.email ? `Email: ${order.email}` : "",
    `Items: ${items}`,
    `Delivery: ${destination}`,
    `Preferred day: ${order.date}`,
    `Payment: ${order.payment}`,
    `Total: ₹${order.total}`,
    order.note ? `Note: ${order.note}` : "",
  ].filter(Boolean).join("\n");
}

async function notifyChannel(channel, url, order) {
  if (!url) return { channel, configured: false, delivered: false };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, order, message: orderMessage(order) }),
    });
    return { channel, configured: true, delivered: response.ok, status: response.status };
  } catch (error) {
    return { channel, configured: true, delivered: false, error: error instanceof Error ? error.message : "Notification failed" };
  }
}

async function priceOrder(input, menuArg) {
  const menu = menuArg ?? await readMenu();
  const menuPrices = Object.fromEntries(menu.map((item) => [item.id, Number(item.price)]));
  const lines = input.lines.map((line) => {
    const basePrice = menuPrices[line.productId] ?? productPrices[line.productId];
    const qty = Number(line.qty);
    if (!basePrice || !Number.isInteger(qty) || qty < 1 || qty > 20) throw new Error("Invalid product or quantity.");
    const menuItem = menu.find((item) => item.id === line.productId);
    if (menuItem && (menuItem.soldOut || qty > Number(menuItem.stockLeft))) {
      throw new Error(`${menuItem.name} has only ${menuItem.stockLeft} portion${menuItem.stockLeft === 1 ? "" : "s"} available.`);
    }
    const addons = Array.isArray(line.addons) ? line.addons : [];
    const addonTotal = addons.reduce((sum, addon) => {
      if (!Object.hasOwn(addonPrices, addon)) throw new Error("Invalid add-on.");
      return sum + addonPrices[addon];
    }, 0);
    const unitPrice = basePrice + addonTotal;
    return { ...line, qty, unitPrice };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  if (input.method === "pickup") {
    return { lines, subtotal, deliveryFee: 0, total: subtotal, area: input.area || "" };
  }
  if (!input.area || !String(input.area).trim()) throw new Error("Please select your delivery area.");
  const areaFee = Number(deliveryFeesByArea[input.area] ?? 40);
  if (![40, 50, 80].includes(areaFee)) throw new Error("This delivery area does not have a valid fee configured.");
  const deliveryFee = subtotal >= 999 ? 0 : areaFee;
  return { lines, subtotal, deliveryFee, total: subtotal + deliveryFee, area: input.area };
}

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Request too large"));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("Invalid JSON")); }
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method === "GET" && request.url === "/health") return send(response, 200, { ok: true });

  if (request.method === "GET" && request.url === "/api/site-settings") {
    return send(response, 200, { settings: await readSettings() });
  }

  if (request.method === "GET" && request.url === "/api/menu") {
    return send(response, 200, { menu: await readMenu() });
  }

  if (request.method === "POST" && request.url === "/api/admin/login") {
    if (!adminToken) return send(response, 503, { error: "Admin access is not configured on the server." });
    try {
      const input = await readBody(request);
      return input.token === adminToken
        ? send(response, 200, { ok: true })
        : send(response, 401, { error: "Invalid admin token." });
    } catch (error) {
      return send(response, 400, { error: error instanceof Error ? error.message : "Invalid login request." });
    }
  }

  if (request.method === "GET" && request.url === "/api/admin/orders") {
    if (!requireAdmin(request, response)) return;
    return send(response, 200, { orders: (await readOrders()).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
  }

  if (request.method === "PUT" && request.url?.startsWith("/api/admin/orders/")) {
    if (!requireAdmin(request, response)) return;
    const id = decodeURIComponent(request.url.slice("/api/admin/orders/".length));
    try {
      const input = await readBody(request);
      const statuses = ["received", "preparing", "ready", "delivered", "cancelled"];
      if (!statuses.includes(input.status)) return send(response, 400, { error: "Invalid order status." });
      const orders = await readOrders();
      const index = orders.findIndex((order) => order.id === id);
      if (index < 0) return send(response, 404, { error: "Order not found." });
      orders[index] = { ...orders[index], status: input.status, updatedAt: new Date().toISOString() };
      await saveOrders(orders);
      return send(response, 200, { order: orders[index] });
    } catch (error) {
      return send(response, 400, { error: error instanceof Error ? error.message : "Could not update order." });
    }
  }

  if (request.method === "PUT" && request.url === "/api/admin/site-settings") {
    if (!requireAdmin(request, response)) return;
    try {
      const input = await readBody(request);
      const inputDays = Array.isArray(input.preferredDays)
        ? input.preferredDays.map(String).map((d) => d.trim()).filter(Boolean)
        : String(input.preferredDay || "Monday").split(",").map((d) => d.trim()).filter(Boolean);
      const preferredDays = inputDays.length > 0 ? inputDays : ["Monday"];
      const preferredDay = preferredDays.join(", ");
      const settings = {
        batchNo: Number(input.batchNo),
        weekNo: Number(input.weekNo),
        weekLabel: String(input.weekLabel || "").trim(),
        cutoffLabel: String(input.cutoffLabel || "").trim(),
        preferredDay,
        preferredDays,
      };
      if (!Number.isInteger(settings.batchNo) || settings.batchNo < 1 || !Number.isInteger(settings.weekNo) || settings.weekNo < 1 || !settings.weekLabel || !settings.cutoffLabel || settings.preferredDays.length === 0) {
        return send(response, 400, { error: "Batch, week, date range, cutoff, and at least one preferred day are required." });
      }
      await saveSettings(settings);
      return send(response, 200, { settings });
    } catch (error) {
      return send(response, 400, { error: error instanceof Error ? error.message : "Could not save settings." });
    }
  }

  if (request.method === "PUT" && request.url?.startsWith("/api/admin/menu/")) {
    if (!requireAdmin(request, response)) return;
    const id = decodeURIComponent(request.url.slice("/api/admin/menu/".length));
    try {
      const input = await readBody(request);
      const menu = await readMenu();
      const index = menu.findIndex((item) => item.id === id);
      if (index < 0) return send(response, 404, { error: "Menu item not found." });
      const item = { ...menu[index], ...input, id };
      if (!item.name || !["pockets", "fancy", "classics", "goodies", "sugar"].includes(item.category) || !Number.isFinite(Number(item.price)) || Number(item.price) < 0 || !Number.isInteger(Number(item.totalBatch)) || Number(item.totalBatch) < 0 || !Number.isInteger(Number(item.stockLeft)) || Number(item.stockLeft) < 0) return send(response, 400, { error: "Name, category, price, availability, and stock are required." });
      item.price = Number(item.price); item.totalBatch = Number(item.totalBatch); item.stockLeft = Math.min(Number(item.stockLeft), item.totalBatch); item.soldOut = Boolean(item.soldOut) || item.stockLeft === 0;
      menu[index] = item; await saveMenu(menu); return send(response, 200, { item });
    } catch (error) { return send(response, 400, { error: error instanceof Error ? error.message : "Could not update menu item." }); }
  }

  if (request.method === "POST" && request.url === "/api/admin/menu") {
    if (!requireAdmin(request, response)) return;
    try {
      const input = await readBody(request); const menu = await readMenu();
      const id = String(input.id || `menu-${randomUUID().slice(0, 8)}`).trim();
      if (menu.some((item) => item.id === id)) return send(response, 409, { error: "That menu ID already exists." });
      const item = { id, name: String(input.name || "").trim(), category: input.category, price: Number(input.price), image: String(input.image || "").trim(), stockLeft: Number(input.stockLeft), totalBatch: Number(input.totalBatch), soldOut: Boolean(input.soldOut) };
      if (!item.name || !["pockets", "fancy", "classics", "goodies", "sugar"].includes(item.category) || !Number.isFinite(item.price) || item.price < 0 || !Number.isInteger(item.totalBatch) || item.totalBatch < 0 || !Number.isInteger(item.stockLeft) || item.stockLeft < 0) return send(response, 400, { error: "Name, category, price, availability, and stock are required." });
      item.stockLeft = Math.min(item.stockLeft, item.totalBatch); item.soldOut = item.soldOut || item.stockLeft === 0; menu.push(item); await saveMenu(menu); return send(response, 201, { item });
    } catch (error) { return send(response, 400, { error: error instanceof Error ? error.message : "Could not create menu item." }); }
  }

  if (request.method === "DELETE" && request.url?.startsWith("/api/admin/menu/")) {
    if (!requireAdmin(request, response)) return;
    const id = decodeURIComponent(request.url.slice("/api/admin/menu/".length)); const menu = await readMenu(); const next = menu.filter((item) => item.id !== id);
    if (next.length === menu.length) return send(response, 404, { error: "Menu item not found." }); await saveMenu(next); return send(response, 200, { ok: true });
  }

  if (request.method === "GET" && request.url === "/api/admin/menu") {
    if (!requireAdmin(request, response)) return; return send(response, 200, { menu: await readMenu() });
  }

  if (request.method === "POST" && request.url === "/api/delivery/calculate") {
    try {
      const input = await readBody(request);
      const subtotal = Number(input.subtotal);
      if (!Number.isFinite(subtotal) || subtotal < 0) return send(response, 400, { error: "Invalid order subtotal." });
      const areaFee = Number(deliveryFeesByArea[input.area] ?? 40);
      if (![40, 50, 80].includes(areaFee)) return send(response, 400, { error: "This delivery area does not have a valid fee configured." });
      const deliveryFee = subtotal >= 999 ? 0 : areaFee;
      return send(response, 200, {
        area: input.area,
        deliveryFee,
        freeDelivery: deliveryFee === 0,
        message: deliveryFee === 0 ? "Free delivery" : `₹${deliveryFee} delivery`,
      });
    } catch (error) {
      return send(response, 400, { error: error instanceof Error ? error.message : "Unable to calculate delivery distance." });
    }
  }

  if (request.method === "POST" && request.url === "/api/orders") {
    try {
      const input = await readBody(request);
      if (!input.name || !input.phone || !Array.isArray(input.lines) || input.lines.length === 0) {
        return send(response, 400, { error: "Name, phone, and at least one item are required." });
      }
      const menu = await readMenu();
      const priced = await priceOrder(input, menu);
      const order = {
        ...input,
        ...priced,
        id: input.id || `SAS-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        status: "received",
        createdAt: new Date().toISOString(),
      };
      const orders = await readOrders();
      orders.push(order);
      await saveOrders(orders);
      const orderedQty = new Map();
      for (const line of priced.lines) {
        const productId = String(line.productId);
        orderedQty.set(productId, (orderedQty.get(productId) || 0) + Number(line.qty));
      }
      const updatedMenu = menu.map((item) => {
        const quantity = orderedQty.get(item.id) || 0;
        if (!quantity) return item;
        const stockLeft = Math.max(0, Number(item.stockLeft) - quantity);
        return { ...item, stockLeft, soldOut: stockLeft === 0 };
      });
      await saveMenu(updatedMenu);
      const notifications = await Promise.all(
        Object.entries(notificationTargets).map(([channel, url]) => notifyChannel(channel, url, order))
      );
      return send(response, 201, { order, notifications, menu: updatedMenu });
    } catch (error) {
      return send(response, 400, { error: error instanceof Error ? error.message : "Could not create order." });
    }
  }

  if (request.method === "GET" && request.url?.startsWith("/api/orders/")) {
    const id = decodeURIComponent(request.url.slice("/api/orders/".length));
    const order = (await readOrders()).find((entry) => entry.id === id);
    return order ? send(response, 200, { order }) : send(response, 404, { error: "Order not found." });
  }

  if (await serveStatic(request, response)) return;
  send(response, 404, { error: "Not found." });
});

await ensureDataFiles();
server.listen(port, () => {
  console.log(`Sauce And Sugar listening on http://localhost:${port}`);
});