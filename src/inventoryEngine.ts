import { InventoryItem, StockMovement } from './types';

// Let's extend InventoryItem with FunctionHead specs (costPrice, retailPrice, etc.)
export interface EnhancedInventoryItem extends InventoryItem {
  costPrice: number;
  retailPrice: number;
  lowStockThreshold: number;
}

// Memory-based central state wrapper for local testing & runtime operations with parities
class InventoryEngine {
  private items: EnhancedInventoryItem[] = [];
  private auditLogs: { id: string; timestamp: string; action: string; details: string }[] = [];

  constructor() {
    this.loadState();
  }

  // Load from local storage or initialize with defaults mapped to UJ Cafeteria and mock items
  private loadState() {
    let storedItems: any = null;
    let storedLogs: any = null;

    try {
      const stored = localStorage.getItem('functionhead_inventory');
      if (stored) {
        storedItems = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing inventory', e);
      localStorage.removeItem('functionhead_inventory');
    }

    try {
      const logs = localStorage.getItem('functionhead_audit_logs');
      if (logs) {
        storedLogs = JSON.parse(logs);
      }
    } catch (e) {
      console.error('Error parsing logs', e);
      localStorage.removeItem('functionhead_audit_logs');
    }
      
    if (storedItems && Array.isArray(storedItems)) {
      this.items = storedItems;
    } else {
      // Fallback to initial seeds mapped with costPrice & retailPrice
      this.items = [
        {
          id: '1',
          name: 'Grilled Chicken Sandwich',
          sku: 'FOOD-GCS-001',
          category: 'Food',
          quantity: 50,
          minThreshold: 15,
          price: 45.00,
          costPrice: 28.00,
          retailPrice: 45.00,
          lowStockThreshold: 15,
          location: 'Kitchen Fridge',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
          expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        },
        {
          id: '2',
          name: 'Fresh Garden Salad',
          sku: 'FOOD-SAL-002',
          category: 'Food',
          quantity: 12,
          minThreshold: 15,
          price: 35.00,
          costPrice: 20.00,
          retailPrice: 35.00,
          lowStockThreshold: 15,
          location: 'Display Fridge A',
          lastUpdated: new Date().toISOString(),
          status: 'Low Stock',
          expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        },
        {
          id: '3',
          name: 'Sparkling Mineral Water',
          sku: 'BEV-SPW-003',
          category: 'Beverages',
          quantity: 120,
          minThreshold: 30,
          price: 15.00,
          costPrice: 9.00,
          retailPrice: 15.00,
          lowStockThreshold: 30,
          location: 'Cooler 2',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '4',
          name: 'Coca-Cola 500ml',
          sku: 'BEV-COKE-500',
          category: 'Beverages',
          quantity: 200,
          minThreshold: 48,
          price: 18.50,
          costPrice: 11.50,
          retailPrice: 18.50,
          lowStockThreshold: 48,
          location: 'Main Cooler',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '5',
          name: 'Double Chocolate Muffin',
          sku: 'FOOD-MUF-004',
          category: 'Food',
          quantity: 0,
          minThreshold: 10,
          price: 25.00,
          costPrice: 15.00,
          retailPrice: 25.00,
          lowStockThreshold: 10,
          location: 'Bakery Counter',
          lastUpdated: new Date().toISOString(),
          status: 'Out of Stock',
        },
        {
          id: '6',
          name: 'UJ Student Campus Mug',
          sku: 'APP-MUG-01',
          category: 'Apparel',
          quantity: 45,
          minThreshold: 10,
          price: 85.00,
          costPrice: 45.00,
          retailPrice: 85.00,
          lowStockThreshold: 10,
          location: 'Merch Shelf',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '7',
          name: 'Apple iPhone 15 Pro Max',
          sku: 'ELEC-IPH-01',
          category: 'Electronics',
          quantity: 5,
          minThreshold: 10,
          price: 25000.00,
          costPrice: 21000.00,
          retailPrice: 25000.00,
          lowStockThreshold: 10,
          location: 'Secure Vault A',
          lastUpdated: new Date().toISOString(),
          status: 'Low Stock',
        },
        {
          id: '8',
          name: 'Bic Blue Ballpoint Pens (Box of 50)',
          sku: 'STAT-BIC-001',
          category: 'Stationery',
          quantity: 300,
          minThreshold: 50,
          price: 120.00,
          costPrice: 65.00,
          retailPrice: 120.00,
          lowStockThreshold: 50,
          location: 'Aisle 3',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '9',
          name: 'Wireless Logitech Mouse',
          sku: 'ELEC-LOG-02',
          category: 'Electronics',
          quantity: 24,
          minThreshold: 15,
          price: 350.00,
          costPrice: 180.00,
          retailPrice: 350.00,
          lowStockThreshold: 15,
          location: 'Shelf C',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '10',
          name: 'A4 Printing Paper (Ream)',
          sku: 'STAT-A4-01',
          category: 'Stationery',
          quantity: 80,
          minThreshold: 100,
          price: 95.00,
          costPrice: 55.00,
          retailPrice: 95.00,
          lowStockThreshold: 100,
          location: 'Storage Room 1',
          lastUpdated: new Date().toISOString(),
          status: 'Low Stock',
        },
        {
          id: '11',
          name: 'Red Bull Energy Drink',
          sku: 'BEV-RB-001',
          category: 'Beverages',
          quantity: 400,
          minThreshold: 50,
          price: 26.50,
          costPrice: 16.00,
          retailPrice: 26.50,
          lowStockThreshold: 50,
          location: 'Main Cooler 2',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '12',
          name: 'Vegan Wrap',
          sku: 'FOOD-VG-001',
          category: 'Food',
          quantity: 8,
          minThreshold: 10,
          price: 55.00,
          costPrice: 30.00,
          retailPrice: 55.00,
          lowStockThreshold: 10,
          location: 'Display Fridge A',
          lastUpdated: new Date().toISOString(),
          status: 'Low Stock',
          expiryDate: new Date(Date.now() + 86400000 * 1).toISOString(),
        }
      ];
      this.saveState();
    }

    if (storedLogs && Array.isArray(storedLogs)) {
      this.auditLogs = storedLogs;
    } else {
      this.logAction('SYSTEM_INIT', 'Engine initialized successfully from May 2026 specifications Blueprint');
    }
  }

  private saveState() {
    localStorage.setItem('functionhead_inventory', JSON.stringify(this.items));
    localStorage.setItem('functionhead_audit_logs', JSON.stringify(this.auditLogs));
  }

  public getItems(): EnhancedInventoryItem[] {
    return [...this.items];
  }

  public getAuditLogs() {
    return [...this.auditLogs];
  }

  // Pure log registration with unique tracking IDs
  public logAction(action: string, details: string) {
    const log = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details
    };
    this.auditLogs = [log, ...this.auditLogs].slice(0, 500);
    this.saveState();
  }

  // Feature Set A: Global Product Factory
  public createProduct(params: {
    name: string;
    sku: string;
    category: string;
    quantity: number;
    costPrice: number;
    retailPrice: number;
    lowStockThreshold: number;
    location: string;
    expiryDate?: string;
  }): EnhancedInventoryItem {
    const defaultMarkup = params.retailPrice || (params.costPrice * 1.5);
    
    // Type checking & strict conversion as specified in implementation step 2
    const qty = Number(params.quantity) || 0;
    const cost = Number(params.costPrice) || 0;
    const retail = Number(params.retailPrice) || defaultMarkup;
    const threshold = Number(params.lowStockThreshold) || 10;

    const newItem: EnhancedInventoryItem = {
      id: 'ph-' + Math.random().toString(36).substr(2, 9),
      name: params.name,
      sku: params.sku || 'SKU-' + Date.now(),
      category: params.category || 'General',
      quantity: Math.max(0, qty),
      price: retail,
      costPrice: cost,
      retailPrice: retail,
      minThreshold: threshold,
      lowStockThreshold: threshold,
      location: params.location || 'Warehouse Shelf',
      lastUpdated: new Date().toISOString(),
      status: qty === 0 ? 'Out of Stock' : (qty <= threshold ? 'Low Stock' : 'In Stock'),
      expiryDate: params.expiryDate || undefined
    };

    this.items.push(newItem);
    this.logAction(
      'PRODUCT_CREATED', 
      `Created product "${newItem.name}" [SKU:${newItem.sku}] - Qty: ${newItem.quantity}, Cost: ${newItem.costPrice}, Retail: ${newItem.price}`
    );
    this.saveState();
    return newItem;
  }

  // Feature Set A: Atomic Delta Adjustment
  // formula: Q_{final} = Q_{initial} + Delta Q  (Ensure Q_final >= 0)
  public adjustStockDelta(itemId: string, deltaQ: number, reason: string): EnhancedInventoryItem | null {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) return null;

    const initialQ = Number(this.items[index].quantity) || 0;
    const change = Number(deltaQ) || 0;
    const finalQ = Math.max(0, initialQ + change);

    // Keep it atomic & mutate state safely inside engine file
    const oldQty = this.items[index].quantity;
    this.items[index].quantity = finalQ;
    this.items[index].lastUpdated = new Date().toISOString();
    
    // Status resolution guidelines
    this.items[index].status = finalQ === 0 ? 'Out of Stock' : 
                               (finalQ <= this.items[index].minThreshold ? 'Low Stock' : 'In Stock');

    this.logAction(
      'DELTA_ADJUSTMENT', 
      `Adjusted "${this.items[index].name}" stock levels. Delta Q: ${change > 0 ? '+' : ''}${change} units. Q_initial: ${oldQty} -> Q_final: ${finalQ}. Reason: ${reason}`
    );
    
    this.saveState();
    return { ...this.items[index] };
  }

  // Feature Set A: Evaluative Metric Projections
  // formula: V = \sum (Quantity * costPrice)
  public evaluateTotalAssetValuation(): number {
    return this.items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const cp = Number(item.costPrice) || 0;
      return sum + (q * cp);
    }, 0);
  }

  // Advanced Valuation metrics (Retail value to assess margins)
  public evaluateTotalRetailValue(): number {
    return this.items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const rp = Number(item.price) || 0;
      return sum + (q * rp);
    }, 0);
  }

  // Global markup adjustments (Controls standard margins instantly across category items)
  public applyGlobalCategoryMarkupFormula(category: string, markupPercent: number) {
    let affectedCount = 0;
    const percent = Number(markupPercent) || 0;
    
    this.items = this.items.map(item => {
      if (item.category.toLowerCase() === category.toLowerCase() || category === 'All') {
        const cost = Number(item.costPrice) || 0;
        const newRetail = cost * (1 + percent / 100);
        affectedCount++;
        
        return {
          ...item,
          price: Number(newRetail.toFixed(2)),
          retailPrice: Number(newRetail.toFixed(2)),
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });

    this.logAction(
      'CATEGORY_MARKUP_FORMULA_APPLIED',
      `Recalculated pricing for category "${category}" applying standard +${percent}% markup limit. Impacted ${affectedCount} items.`
    );
    this.saveState();
  }

  // Fast reset back to standard parameters (Emulates recovery)
  public resetToSeeds() {
    localStorage.removeItem('functionhead_inventory');
    localStorage.removeItem('functionhead_audit_logs');
    this.loadState();
  }
}

export const inventoryEngine = new InventoryEngine();
