import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

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

// API Routes
app.post("/api/gemini/magic", async (req, res) => {
  const { description } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an AI assistant for a Cafeteria Stock Manager. Given a product description, extract the details into a simple JSON object matching this schema. Write ONLY raw JSON back. No markdown wrapping.
      
      {
        "name": "string (the product name)",
        "sku": "string (short uppercase SKU like BEV-RED-500)",
        "category": "Food" | "Beverages" | "Books" | "Stationery" | "Apparel",
        "quantity": "number (reasonable guess or 10 if unsure)",
        "minThreshold": "number (reasonable guess or 5 if unsure)",
        "price": "number (reasonable retail price in ZAR or USD based on standard values, e.g. 25.00)",
        "location": "string (e.g. 'Main Cooler', 'Bakery Counter', 'Shelf B-2')"
      }
      
      Product description: "${description}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let text = response.text || '';
      if (text.includes('```')) {
        text = text.replace(/```(json)?/g, '').trim();
      }
      return res.json(JSON.parse(text));
    } catch (err) {
      console.warn('Real Gemini server-side call failed, using smart local parser fallback', err);
    }
  }

  res.json(simulateLocalMagicParse(description));
});

app.post("/api/gemini/ask", async (req, res) => {
  const { question, inventory, movements } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const inventoryStr = JSON.stringify(inventory.map((item: any) => ({
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        location: item.location,
        status: item.status
      })), null, 2);

      const prompt = `You are "StockAI Analytics", an expert visual database assistant.
      Analyze this inventory state and answer the user question. Return ONLY raw JSON matching this TypeScript schema:
      
      {
        "answer": "string (Comprehensive answer in markdown format)",
        "chart": {
          "title": "string",
          "type": "line" | "bar" | "pie" | "area",
          "xAxisKey": "string",
          "yAxisKey": "string",
          "data": [{"key": "string | number"}]
        }
      }
      
      Inventory Data:
      ${inventoryStr}
      
      User request: "${question || 'Provide a general summary and restocking recommendation'}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (err) {
      console.warn('Real Gemini server ask-ai failed, using smart local generator', err);
    }
  }

  res.json(generateLocalSmartAnalysis(question, inventory, movements));
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
