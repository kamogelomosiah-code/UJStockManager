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
