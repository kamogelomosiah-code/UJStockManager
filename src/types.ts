export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Low Stock' | 'Expiry' | 'General';
  date: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  avatar?: string;
  joinedDate: string;
}

export type ItemCategory = 'Produce' | 'Butchery' | 'Bakery' | 'Dry Goods' | 'Beverages' | 'Household';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: ItemCategory | string;
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
