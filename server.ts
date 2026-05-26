import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API endpoints
  app.post('/api/magic-add', async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ error: 'Description is required' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let text = response.text || '';
      try {
        // Strip markdown blocks if any
        if (text.includes('\`\`\`')) {
          text = text.replace(/\`\`\`(json)?/g, '').trim();
        }
        const parsed = JSON.parse(text);
        res.json(parsed);
      } catch (err) {
        console.error("Parse failed", err, text);
        res.status(500).json({ error: 'Failed to generate product details' });
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/ask-ai', async (req, res) => {
    try {
      const { question, inventory, movements } = req.body;
      if (!inventory) {
        return res.status(400).json({ error: 'Inventory data is required' });
      }

      // Initialize the safe server-side AI client with recommended user-agent tracking
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      
      const inventoryStr = JSON.stringify(inventory.map((item: any) => ({
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        minThreshold: item.minThreshold,
        price: item.price,
        location: item.location,
        status: item.status,
        expiryDate: item.expiryDate
      })), null, 2);

      const movementsStr = movements ? JSON.stringify(movements.slice(0, 35).map((move: any) => ({
        itemName: move.itemName,
        type: move.type,
        quantity: move.quantity,
        date: move.date,
        reason: move.reason
      })), null, 2) : "[]";

      const systemPrompt = `You are "StockAI Analytics", an expert visual database assistant for a school/cafeteria/general store.
      Below is the real-time inventory list and chronological stock transaction log (history of In, Out, and Adjustments).
      Analyze these coordinates and answer the user's specific request or query. Avoid generic descriptions; provide highly useful, business-oriented recommendations (e.g. tracking sales volume relative to restock, highlighting specific locations or food waste risk).

      Real-time Inventory Data:
      ${inventoryStr}

      Chronological Movement Logs:
      ${movementsStr}

      You MUST respond with a raw JSON object matching this TypeScript interface definition. Do not wrap it in tick marks other than standard JSON format:
      \`\`\`ts
      interface AiResponse {
        answer: string; // Comprehensive answer text in Beautiful Markdown. Include bold items, recommendation bullet points, and insights.
        chart?: { // Optional chart data. Include this if the user asks for historical patterns, category spreads, safety levels, valuation bars, or if it helps visualize the stock levels.
          title: string; // Concise chart title
          type: 'line' | 'bar' | 'pie' | 'area';
          xAxisKey: string; // The attribute name to use for x-axis labels (e.g., "name", "category", or "date")
          yAxisKey: string; // The attribute name to use for y-axis numeric values (e.g., "quantity", "price", "count", "value")
          data: Array<{ [key: string]: string | number }>; // Flat objects mapping keys to values (e.g. [ { "name": "Buns", "quantity": 10 }, { "name": "Apples", "quantity": 40 } ])
        }
      }
      \`\`\`

      If the user is asking for a general summary/overview or has not specified a specific question, generate:
      1. A short summary of total stock levels & safety.
      2. Recommendation of what category or shelf to check next.
      3. A companion chart displaying category volumes, low stock frequencies, or monetary values.
      `;

      const contents = question ? `User's Question: "${question}"` : "Please review the inventory and generate a stock summary with recommendations and charts.";

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || "{}";
      try {
        const parsedJson = JSON.parse(responseText.trim());
        res.json(parsedJson);
      } catch (jsonErr) {
        console.error("Gemini JSON parse failed, returning fallback text", responseText);
        res.json({
          answer: responseText,
          chart: undefined
        });
      }
    } catch (err: any) {
      console.error('AI Ask Error:', err);
      res.status(500).json({ error: 'Failed to generate answer from AI' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
