import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "2mb" }));

// ---------------------------------------------------------------------------------------------
// MasterAPI: the shared backend. It holds the stock data (so every phone sees the same stock) and
// does the AI. This server keeps the key; the browser never sees it. Optional: without it the app
// works from each browser's own storage, as before.
// ---------------------------------------------------------------------------------------------
const MASTERAPI_URL = (process.env.MASTERAPI_URL || "").replace(/\/$/, "");
const MASTERAPI_KEY = process.env.MASTERAPI_KEY || "";
const masterApiOn = Boolean(MASTERAPI_URL && MASTERAPI_KEY);
const STATE_KEY = "uj-state";

async function masterApi(method: string, apiPath: string, body?: unknown, timeoutMs = 10000): Promise<any> {
  const res = await fetch(`${MASTERAPI_URL}/api/v1${apiPath}`, {
    method,
    headers: { "x-api-key": MASTERAPI_KEY, ...(body !== undefined ? { "content-type": "application/json" } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.error || `MasterAPI answered HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------------------------------------------------------------------------------------------
// Sign-in. The passcodes live on the server (OWNER_PASSCODE, ADMIN_PASSCODE), never in the page.
// In development, if neither is set, the old demo passcodes work so the app can be tried locally.
// In production with nothing set, nobody can sign in.
// ---------------------------------------------------------------------------------------------
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const OWNER_PASSCODE = (process.env.OWNER_PASSCODE || "").trim();
const ADMIN_PASSCODE = (process.env.ADMIN_PASSCODE || "").trim();
const DEMO_MODE = !OWNER_PASSCODE && !ADMIN_PASSCODE && process.env.NODE_ENV !== "production";
const SESSION_MS = 12 * 60 * 60 * 1000;

if (DEMO_MODE) console.warn("[AUTH] OWNER_PASSCODE and ADMIN_PASSCODE are not set: using the demo passcodes (development only).");
if (process.env.NODE_ENV === "production" && !OWNER_PASSCODE && !ADMIN_PASSCODE) {
  console.warn("[AUTH] OWNER_PASSCODE and ADMIN_PASSCODE are not set: nobody can sign in until you set them.");
}

type Role = "Admin" | "Staff";
const sha = (v: string) => crypto.createHash("sha256").update(v).digest();
const sameSecret = (a: string, b: string) => crypto.timingSafeEqual(sha(a), sha(b));

function signToken(role: Role): string {
  const body = Buffer.from(JSON.stringify({ role, exp: Date.now() + SESSION_MS }), "utf-8").toString("base64url");
  return `${body}.${crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url")}`;
}
function readToken(token: string): { role: Role } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    return typeof p.exp === "number" && p.exp > Date.now() && (p.role === "Admin" || p.role === "Staff") ? { role: p.role } : null;
  } catch {
    return null;
  }
}

function userFor(role: Role) {
  return role === "Admin"
    ? { id: "user-admin", name: "Chief Supply Administrator", email: "admin@uj.ac.za", role: "Admin" as const, joinedDate: new Date().toISOString() }
    : { id: "user-owner", name: "Cafeteria Owner", email: "owner@uj.ac.za", role: "Staff" as const, joinedDate: new Date().toISOString() };
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const h = req.headers.authorization || "";
  const session = h.startsWith("Bearer ") ? readToken(h.slice(7).trim()) : null;
  if (!session) return res.status(401).json({ error: "Please sign in again." });
  (req as any).session = session;
  return next();
}

// Five wrong passcodes from one address locks it out for 15 minutes.
const loginFails = new Map<string, { n: number; until: number }>();
function loginKey(req: express.Request) {
  return req.ip || "unknown";
}

app.post("/api/login", (req, res) => {
  const key = loginKey(req);
  const f = loginFails.get(key);
  if (f && f.until > Date.now() && f.n >= 5) {
    return res.status(429).json({ error: "Too many wrong passcodes. Try again in 15 minutes." });
  }
  const role: Role | null = req.body?.role === "Admin" ? "Admin" : req.body?.role === "Staff" ? "Staff" : null;
  const passcode = typeof req.body?.passcode === "string" ? req.body.passcode : "";
  if (!role) return res.status(400).json({ error: "Choose Owner or Admin." });
  const expected = role === "Admin" ? ADMIN_PASSCODE || (DEMO_MODE ? "admin123" : "") : OWNER_PASSCODE || (DEMO_MODE ? "owner123" : "");
  if (!expected) {
    return res.status(503).json({ error: "Sign-in is not set up on this server yet. Set OWNER_PASSCODE and ADMIN_PASSCODE." });
  }
  if (!passcode || !sameSecret(passcode, expected)) {
    const now = Date.now();
    if (!f || f.until < now) loginFails.set(key, { n: 1, until: now + 15 * 60_000 });
    else f.n++;
    if (loginFails.size > 2000) loginFails.clear();
    return res.status(401).json({ error: "Wrong passcode." });
  }
  loginFails.delete(key);
  return res.json({ token: signToken(role), user: userFor(role) });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: userFor((req as any).session.role), shared: masterApiOn });
});

// ---------------------------------------------------------------------------------------------
// Shared stock. The whole app state is one saved document in MasterAPI; the newest change wins.
// ---------------------------------------------------------------------------------------------
app.get("/api/state", requireAuth, async (_req, res) => {
  if (!masterApiOn) return res.status(503).json({ error: "Shared storage is not connected.", shared: false });
  try {
    const r = await masterApi("GET", `/kv/${STATE_KEY}`);
    return res.json({ shared: true, state: r.value?.state ?? null, at: r.value?.at ?? 0 });
  } catch (e: any) {
    if (e.status === 404) return res.json({ shared: true, state: null, at: 0 });
    return res.status(502).json({ error: "Could not reach shared storage.", shared: true });
  }
});

app.put("/api/state", requireAuth, async (req, res) => {
  if (!masterApiOn) return res.status(503).json({ error: "Shared storage is not connected.", shared: false });
  const { state, at } = req.body || {};
  if (!state || typeof state !== "object" || !Array.isArray(state.items)) {
    return res.status(400).json({ error: "The saved state must include a list of items." });
  }
  const stamp = typeof at === "number" && Number.isFinite(at) ? Math.min(at, Date.now() + 5 * 60_000) : Date.now();
  try {
    await masterApi("PUT", `/kv/${STATE_KEY}`, { value: { state, at: stamp } });
    return res.json({ ok: true, at: stamp });
  } catch {
    return res.status(502).json({ error: "Could not save to shared storage.", shared: true });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", shared: masterApiOn, signIn: Boolean(OWNER_PASSCODE || ADMIN_PASSCODE || DEMO_MODE) });
});

// ---------------------------------------------------------------------------------------------
// AI. MasterAPI's AI service first, then Gemini if a key is set, then the built-in rules.
// ---------------------------------------------------------------------------------------------
/** Pulls the first JSON object out of a model reply, which may be wrapped in text or code fences. */
function extractJson(text: string): any | null {
  const cleaned = (text || "").replace(/```(json)?/gi, "");
  const a = cleaned.indexOf("{");
  const b = cleaned.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(cleaned.slice(a, b + 1));
  } catch {
    return null;
  }
}

async function askMasterApiJson(system: string, prompt: string): Promise<any | null> {
  if (!masterApiOn) return null;
  try {
    const r = await masterApi("POST", "/ai/chat", { system, prompt, maxTokens: 900, temperature: 0.2 }, 62_000);
    return extractJson(r.reply);
  } catch (e: any) {
    console.warn(`[AI] MasterAPI AI unavailable: ${e.message}`);
    return null;
  }
}

// Helper for simulating local rules if key not found on server
function simulateLocalMagicParse(description: string): any {
  const lower = description.toLowerCase();
  
  let category = 'Food';
  if (lower.includes('drink') || lower.includes('water') || lower.includes('coke') || lower.includes('can') || lower.includes('beverage') || lower.includes('juice') || lower.includes('soda') || lower.includes('coffee')) {
    category = 'Beverages';
  } else if (lower.includes('book') || lower.includes('novel') || lower.includes('textbook')) {
    category = 'Books';
  } else if (lower.includes('pen') || lower.includes('pencil') || lower.includes('ruler') || lower.includes('stationery') || lower.includes('notebook')) {
    category = 'Stationery';
  } else if (lower.includes('shirt') || lower.includes('cap') || lower.includes('hoodie') || lower.includes('mug') || lower.includes('apparel')) {
    category = 'Apparel';
  }

  let quantity = 10;
  const qtyMatch = description.match(/(\d+)\s*(units|cans|boxes|x|qty|quantity|items)?/i);
  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  let price = 20.00;
  const priceMatch = description.match(/(price|cost|r|usd|\$)\s*(\d+(\.\d{2})?)/i);
  if (priceMatch && priceMatch[2]) {
    price = parseFloat(priceMatch[2]);
  } else {
    const looseMatch = description.match(/(\d+\.\d{2})/);
    if (looseMatch && looseMatch[1]) {
      price = parseFloat(looseMatch[1]);
    }
  }

  let name = description.split(',')[0].trim();
  if (name.length > 30) {
    name = name.substring(0, 27) + '...';
  }
  name = name.replace(/^\d+\s*/, '');
  name = name.charAt(0).toUpperCase() + name.slice(1);

  const categoryPrefix = category.slice(0, 3).toUpperCase();
  const nameSlug = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  const sku = `${categoryPrefix}-${nameSlug || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;

  let location = 'Main Shelf';
  if (category === 'Beverages') location = 'Main Cooler';
  else if (category === 'Food') location = 'Kitchen Display';
  else if (category === 'Apparel') location = 'Merch Counter';

  return {
    name,
    sku,
    category,
    quantity,
    minThreshold: Math.max(5, Math.floor(quantity * 0.2)),
    price,
    location
  };
}

function generateLocalSmartAnalysis(question: string | undefined, inventory: any[], movements: any[]): any {
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const outOfStock = inventory.filter(i => i.quantity === 0);
  const lowStock = inventory.filter(i => i.status === 'Low Stock' && i.quantity > 0);
  const valCost = inventory.reduce((sum, item: any) => sum + (item.quantity * (item.costPrice || item.price * 0.65)), 0);
  const valRetail = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  let answer = `### 📊 UJ Cafeteria Real-Time Stock Summary (Server Analytics Engine)\n\n`;
  answer += `We are running connected to the central API and local dataset overlay.\n\n`;
  answer += `#### 📈 Key Metrics Indicators\n`;
  answer += `- **Total Registered Goods**: **${inventory.length} SKUs** currently registered.\n`;
  answer += `- **Global Inventory Volume**: **${totalStock} physical units** are currently present.\n`;
  answer += `- **Estimated Asset Book Valuation**: **R ${valCost.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** at purchase value.\n`;
  answer += `- **Projected Potential Retail value**: **R ${valRetail.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on sales.\n\n`;
  answer += `---\n\n### ⚠️ Immediate Warning Coordinates\n`;

  if (outOfStock.length > 0) {
    answer += `#### 🚨 Zero Stock Outages (${outOfStock.length} items)\n`;
    answer += `The following products have fully depleted records:\n`;
    answer += `${outOfStock.map(i => `- **${i.name}** [SKU: ${i.sku}] (Located at: *${i.location}*)`).join('\n')}\n\n`;
  } else {
    answer += `- **Nil Stock Depletions**: Great job! No goods have fully depleted records today.\n\n`;
  }

  if (lowStock.length > 0) {
    answer += `#### ⚠️ Low Stock Threshold Alerts\n`;
    answer += `These items have fallen below safety limit thresholds:\n`;
    answer += `${lowStock.map(i => `- **${i.name}** (${i.quantity} left vs threshold of ${i.minThreshold})`).join('\n')}\n\n`;
  }

  answer += `#### 💡 Direct Recommendation Action Pattern\n`;
  answer += `- **Restock Order Target**: We advise instant replenishment of out-of-stock items.\n`;
  answer += `- **Space Allocation Optimization**: Ensure high-volume goods have front-shelf placement.\n`;

  const categories: { [key: string]: number } = {};
  inventory.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + item.quantity;
  });

  const chartData = Object.entries(categories).map(([category, quantity]) => ({
    category,
    quantity
  }));

  return {
    answer,
    chart: {
      title: "Current Server Logic Stock Levels by Category",
      type: "bar",
      xAxisKey: "category",
      yAxisKey: "quantity",
      data: chartData
    }
  };
}

// API Routes (sign-in required, so nobody can run up the AI bill)
const MAGIC_SCHEMA = `{
  "name": "string (the product name)",
  "sku": "string (short uppercase SKU like BEV-RED-500)",
  "category": "Food" | "Beverages" | "Books" | "Stationery" | "Apparel",
  "quantity": "number (reasonable guess or 10 if unsure)",
  "minThreshold": "number (reasonable guess or 5 if unsure)",
  "price": "number (reasonable retail price in ZAR or USD based on standard values, e.g. 25.00)",
  "location": "string (e.g. 'Main Cooler', 'Bakery Counter', 'Shelf B-2')"
}`;
const CATEGORIES = ["Food", "Beverages", "Books", "Stationery", "Apparel"];
const num = (v: any, fallback: number) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : fallback);

/** Makes sure a model's answer has every field in the right shape. */
function normaliseMagic(m: any): any {
  return {
    name: String(m.name).trim().slice(0, 120),
    sku: String(m.sku || "").trim().toUpperCase().slice(0, 40) || "SKU-" + Math.floor(Math.random() * 100000),
    category: CATEGORIES.includes(m.category) ? m.category : "Food",
    quantity: Math.round(num(m.quantity, 10)),
    minThreshold: Math.round(num(m.minThreshold, 5)),
    price: num(m.price, 25),
    location: String(m.location || "Shelf A1").trim().slice(0, 60),
  };
}

app.post("/api/gemini/magic", requireAuth, async (req, res) => {
  const description = typeof req.body?.description === "string" ? req.body.description.trim().slice(0, 500) : "";
  if (!description) return res.status(400).json({ error: "Describe the product first." });

  // 1. MasterAPI's AI service (Hugging Face models)
  const viaMaster = await askMasterApiJson(
    "You are an AI assistant for a Cafeteria Stock Manager. Given a product description, extract the details into a JSON object matching this schema. Reply with ONLY the raw JSON object, no other text.\n" + MAGIC_SCHEMA,
    `Product description: "${description}"`,
  );
  if (viaMaster && typeof viaMaster.name === "string" && viaMaster.name.trim()) return res.json(normaliseMagic(viaMaster));

  // 2. Gemini, if a key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an AI assistant for a Cafeteria Stock Manager. Given a product description, extract the details into a simple JSON object matching this schema. Write ONLY raw JSON back.\n\n${MAGIC_SCHEMA}\n\nProduct description: "${description}"`,
      });
      const parsed = extractJson(response.text || "");
      if (parsed && typeof parsed.name === "string" && parsed.name.trim()) return res.json(normaliseMagic(parsed));
    } catch (err) {
      console.warn("Gemini call failed, using the built-in parser", err);
    }
  }

  // 3. Built-in rules
  res.json(simulateLocalMagicParse(description));
});

const ASK_SCHEMA = `{
  "answer": "string (Comprehensive answer in markdown format)",
  "chart": {
    "title": "string",
    "type": "line" | "bar" | "pie" | "area",
    "xAxisKey": "string",
    "yAxisKey": "string",
    "data": [{"key": "string | number"}]
  }
}`;

app.post("/api/gemini/ask", requireAuth, async (req, res) => {
  const { question, inventory, movements } = req.body || {};
  const items = Array.isArray(inventory) ? inventory.slice(0, 300) : [];
  const q = typeof question === "string" && question.trim() ? question.trim().slice(0, 500) : "Provide a general summary and restocking recommendation";
  const inventoryStr = JSON.stringify(
    items.map((item: any) => ({ name: item.name, sku: item.sku, category: item.category, quantity: item.quantity, price: item.price, location: item.location, status: item.status })),
  );

  const valid = (a: any) => a && typeof a.answer === "string" && a.answer.trim();

  // 1. MasterAPI's AI service
  const viaMaster = await askMasterApiJson(
    "You are \"StockAI Analytics\", an expert assistant for a cafeteria's stock. Analyse the inventory and answer the user's question. Reply with ONLY a raw JSON object matching this schema, no other text.\n" + ASK_SCHEMA,
    `Inventory data:\n${inventoryStr}\n\nUser request: "${q}"`,
  );
  if (valid(viaMaster)) return res.json(viaMaster);

  // 2. Gemini, if a key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are "StockAI Analytics", an expert visual database assistant.\nAnalyze this inventory state and answer the user question. Return ONLY raw JSON matching this TypeScript schema:\n\n${ASK_SCHEMA}\n\nInventory Data:\n${inventoryStr}\n\nUser request: "${q}"`,
        config: { responseMimeType: "application/json" },
      });
      const parsed = extractJson(response.text || "");
      if (valid(parsed)) return res.json(parsed);
    } catch (err) {
      console.warn("Gemini ask failed, using the built-in analysis", err);
    }
  }

  // 3. Built-in analysis
  res.json(generateLocalSmartAnalysis(question, items, movements));
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Since we're using Express 4.x in package.json (4.21.2)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
