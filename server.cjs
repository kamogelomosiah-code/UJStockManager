var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/magic-add", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an AI assistant for a Cafeteria Stock Manager. Given a product description, extract the details into a JSON object matching this TypeScript interface (no markdown tags, just pure JSON).
      
      interface InventoryItem {
        name: string; // The product name
        sku: string; // A newly generated short SKU block like BEV-SPR-500
        category: "Food" | "Beverages" | "Books" | "Stationery" | "Apparel"; // Most likely Food or Beverages 
        quantity: number; // Reasonable guess or 10 if unsure
        minThreshold: number; // Reasonable guess or 5 if unsure
        price: number; // Reasonable price in ZAR based on item (e.g., 20.00)
        location: string; // E.g., 'Main Cooler', 'Dry Shelf 1', 'Kitchen'
      }
      
      Product description: "${description}"
      `;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      let text = response.text || "";
      try {
        if (text.includes("```")) {
          text = text.replace(/\`\`\`(json)?/g, "").trim();
        }
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (err) {
        console.error("Parse failed", err, text);
        res.status(500).json({ error: "Failed to generate product details" });
      }
    } catch (err) {
      console.error("AI Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
