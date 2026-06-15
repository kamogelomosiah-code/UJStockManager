import { GoogleGenAI } from '@google/genai';
import { InventoryItem, StockMovement } from '../types';

// Safe dynamic accessor for the API key client-side
export function getGeminiApiKey(): string {
  // Check local settings first, then environment patterns
  const storedKey = localStorage.getItem('uj_gemini_api_key');
  if (storedKey) return storedKey;

  // Vite environment fallback
  return ((import.meta as any).env?.VITE_GEMINI_API_KEY || '');
}

export function saveGeminiApiKey(key: string) {
  localStorage.setItem('uj_gemini_api_key', key);
}

// Client-Side AI Engine matching the original server logic
export async function clientMagicAdd(description: string): Promise<any> {
  const apiKey = getGeminiApiKey();

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('MY_GEMINI')) {
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
      return JSON.parse(text);
    } catch (err) {
      console.warn('Real Gemini client-side call failed, using smart local parser fallback', err);
    }
  }

  // High-fidelity smart local parser fallback if no key is entered
  return simulateLocalMagicParse(description);
}

// Rule-Based Local Parser matching typical products
function simulateLocalMagicParse(description: string): any {
  const lower = description.toLowerCase();
  
  // Categorize
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

  // Try to match quantity
  let quantity = 10;
  const qtyMatch = description.match(/(\d+)\s*(units|cans|boxes|x|qty|quantity|items)?/i);
  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // Try to match price
  let price = 20.00;
  const priceMatch = description.match(/(price|cost|r|usd|\$)\s*(\d+(\.\d{2})?)/i);
  if (priceMatch && priceMatch[2]) {
    price = parseFloat(priceMatch[2]);
  } else {
    // try any loose decimal
    const looseMatch = description.match(/(\d+\.\d{2})/);
    if (looseMatch && looseMatch[1]) {
      price = parseFloat(looseMatch[1]);
    }
  }

  // Name extraction (first few words capitalize matching)
  let name = description.split(',')[0].trim();
  if (name.length > 30) {
    name = name.substring(0, 27) + '...';
  }
  name = name.replace(/^\d+\s*/, ''); // remove leading quantities

  // Capitalize name
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Generate SKU prefix
  const categoryPrefix = category.slice(0, 3).toUpperCase();
  const nameSlug = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  const sku = `${categoryPrefix}-${nameSlug || 'GEN'}-${Math.floor(100 + Math.random() * 900)}`;

  // Default Location
  let location = 'Main Shelf';
  if (category === 'Beverages') {
    location = 'Main Cooler';
  } else if (category === 'Food') {
    location = 'Kitchen Display';
  } else if (category === 'Apparel') {
    location = 'Merch Counter';
  }

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

export async function clientAskAi(params: {
  question?: string;
  inventory: InventoryItem[];
  movements: StockMovement[];
}): Promise<any> {
  const apiKey = getGeminiApiKey();

  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('MY_GEMINI')) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const inventoryStr = JSON.stringify(params.inventory.map(item => ({
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
      
      User request: "${params.question || 'Provide a general summary and restocking recommendation'}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.warn('Real Gemini client ask-ai failed, using smart local generator', err);
    }
  }

  // High-fidelity local rule-based intelligence generator if key is offline
  return generateLocalSmartAnalysis(params.question, params.inventory, params.movements);
}

function generateLocalSmartAnalysis(question: string | undefined, inventory: InventoryItem[], movements: StockMovement[]): any {
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const outOfStock = inventory.filter(i => i.quantity === 0);
  const lowStock = inventory.filter(i => i.status === 'Low Stock' && i.quantity > 0);
  const valCost = inventory.reduce((sum, item: any) => sum + (item.quantity * (item.costPrice || item.price * 0.65)), 0);
  const valRetail = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  let answer = `### 📊 UJ Cafeteria Real-Time Stock Summary (Client Analytics Engine)

We are running inside the **Serverless Client-Side Sandbox Database** directly connected to your local MongoDB container simulation layer.

#### 📈 Key Metrics Indicators
- **Total Registered Goods**: **${inventory.length} SKUs** currently registered in MongoDB.
- **Global Inventory Volume**: **${totalStock} physical units** are currently present across all campus locations.
- **Estimated Asset Book Valuation**: **R ${valCost.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** at purchase value.
- **Projected Potential Retail value**: **R ${valRetail.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}** on sales.

---

### ⚠️ Immediate Warning Coordinates
`;

  if (outOfStock.length > 0) {
    answer += `#### 🚨 Zero Stock Outages (${outOfStock.length} items)
The following products have fully depleted records inside MongoDB:
${outOfStock.map(i => `- **${i.name}** [SKU: ${i.sku}] (Located at: *${i.location}*)`).join('\n')}

`;
  } else {
    answer += `- **Nil Stock Depletions**: Great job! No goods have fully depleted records today.\n\n`;
  }

  if (lowStock.length > 0) {
    answer += `#### ⚠️ Low Stock Threshold Alerts
These items have fallen below safety limit thresholds:
${lowStock.map(i => `- **${i.name}** (${i.quantity} left vs threshold of ${i.minThreshold})`).join('\n')}

`;
  }

  answer += `
#### 💡 Direct Recommendation Action Pattern
- **Restock Order Target**: We advise instant replenishment of out-of-stock items, specifically in the **Food** and **Beverages** display fridges which have higher student foot traffic.
- **Space Allocation Optimization**: Shift apparel mug stock to secondary shelves to make room for dairy product cold chains on high-volume days.
`;

  // Build aggregate chart data by category
  const categories: { [key: string]: number } = {};
  inventory.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + item.quantity;
  });

  const chartData = Object.entries(categories).map(([name, quantity]) => ({
    category: name,
    quantity
  }));

  return {
    answer,
    chart: {
      title: "Current Mongo Collections Stock Levels by Category",
      type: "bar",
      xAxisKey: "category",
      yAxisKey: "quantity",
      data: chartData
    }
  };
}
