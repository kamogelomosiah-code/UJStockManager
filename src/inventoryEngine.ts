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
          name: 'Fresh Spinach',
          sku: 'PRO-SPI-001',
          category: 'Produce',
          quantity: 50,
          minThreshold: 15,
          price: 25.00,
          costPrice: 12.00,
          retailPrice: 25.00,
          lowStockThreshold: 15,
          location: 'Veg Fridge',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
          expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        },
        {
          id: '2',
          name: 'Premium Beef Mince',
          sku: 'BUT-MIN-002',
          category: 'Butchery',
          quantity: 12,
          minThreshold: 15,
          price: 85.00,
          costPrice: 50.00,
          retailPrice: 85.00,
          lowStockThreshold: 15,
          location: 'Meat Display',
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
          name: 'Jungle Oats 1kg',
          sku: 'DRY-OAT-500',
          category: 'Dry Goods',
          quantity: 200,
          minThreshold: 48,
          price: 38.50,
          costPrice: 21.50,
          retailPrice: 38.50,
          lowStockThreshold: 48,
          location: 'Aisle 4',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '5',
          name: 'Fresh Croissants (4-pack)',
          sku: 'BAK-CRO-004',
          category: 'Bakery',
          quantity: 0,
          minThreshold: 10,
          price: 45.00,
          costPrice: 15.00,
          retailPrice: 45.00,
          lowStockThreshold: 10,
          location: 'Bakery Counter',
          lastUpdated: new Date().toISOString(),
          status: 'Out of Stock',
        },
        {
          id: '6',
          name: 'Dishwashing Liquid 750ml',
          sku: 'HOU-DSH-01',
          category: 'Household',
          quantity: 45,
          minThreshold: 10,
          price: 35.00,
          costPrice: 15.00,
          retailPrice: 35.00,
          lowStockThreshold: 10,
          location: 'Aisle 7',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '7',
          name: 'Brown Bread',
          sku: 'BAK-BRD-01',
          category: 'Bakery',
          quantity: 5,
          minThreshold: 10,
          price: 18.00,
          costPrice: 8.00,
          retailPrice: 18.00,
          lowStockThreshold: 10,
          location: 'Bakery Aisle',
          lastUpdated: new Date().toISOString(),
          status: 'Low Stock',
          expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        },
        {
          id: '8',
          name: 'Washing Powder 2kg',
          sku: 'HOU-WSH-001',
          category: 'Household',
          quantity: 300,
          minThreshold: 50,
          price: 85.00,
          costPrice: 45.00,
          retailPrice: 85.00,
          lowStockThreshold: 50,
          location: 'Aisle 8',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '9',
          name: 'Rice 5kg',
          sku: 'DRY-RCE-02',
          category: 'Dry Goods',
          quantity: 24,
          minThreshold: 15,
          price: 110.00,
          costPrice: 80.00,
          retailPrice: 110.00,
          lowStockThreshold: 15,
          location: 'Aisle 5',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
        },
        {
          id: '10',
          name: 'Tomato Sauce',
          sku: 'DRY-TOM-01',
          category: 'Dry Goods',
          quantity: 80,
          minThreshold: 100,
          price: 35.00,
          costPrice: 20.00,
          retailPrice: 35.00,
          lowStockThreshold: 100,
          location: 'Aisle 4',
          lastUpdated: new Date().toISOString(),
          status: 'Low Stock',
        },
        {
          id: '11',
          name: 'Orange Juice 1L',
          sku: 'BEV-OJ-001',
          category: 'Beverages',
          quantity: 400,
          minThreshold: 50,
          price: 32.50,
          costPrice: 18.00,
          retailPrice: 32.50,
          lowStockThreshold: 50,
          location: 'Main Cooler',
          lastUpdated: new Date().toISOString(),
          status: 'In Stock',
          expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
        {
          id: '12',
          name: 'Free Range Chicken Whole',
          sku: 'BUT-CHK-001',
          category: 'Butchery',
          quantity: 8,
          minThreshold: 10,
          price: 95.00,
          costPrice: 60.00,
          retailPrice: 95.00,
          lowStockThreshold: 10,
          location: 'Meat Fridge',
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
