export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  avatar?: string;
  joinedDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minThreshold: number;
  price: number;
  location: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  expiryDate?: string; // For food items
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'In' | 'Out' | 'Adjustment';
  quantity: number;
  date: string;
  reason: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}
