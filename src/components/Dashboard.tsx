import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  TrendingDown,
  Activity,
  Sparkles,
  Loader2,
  CornerDownLeft,
  Calendar,
  Truck,
  HelpCircle,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { InventoryItem, StockMovement } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  items: InventoryItem[];
  movements: StockMovement[];
  currency: string;
  onAdjustStock: (id: string) => void;
  onViewChange: (view: string) => void;
}

export default function Dashboard({ items, movements, currency, onAdjustStock, onViewChange }: DashboardProps) {
  const lowStockItems = items.filter(i => i.status === 'Low Stock');
  const outOfStockItems = items.filter(i => i.status === 'Out of Stock');
  
  const today = new Date().toISOString().split('T')[0];
  const todaysReceipts = movements.filter(m => m.type === 'In' && m.date.startsWith(today)).length;
  const pendingCounts = 3; // Mock value for Pending Counts

  return (
    <div className="space-y-6 w-full mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-display font-black tracking-tight text-neutral-900">
            Welcome, Sarah
          </h1>
          <p className="text-sm text-neutral-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="m3-card !bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total SKUs</p>
          <div className="flex items-center gap-3 mt-2">
            <Package className="w-6 h-6 text-primary" />
            <p className="text-3xl font-black text-on-surface">{items.length}</p>
          </div>
        </Card>
        <Card className="m3-card !bg-surface p-4 border-l-[6px] border-l-[#FF6F00]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Low Stock</p>
          <div className="flex items-center gap-3 mt-2">
            <TrendingDown className="w-6 h-6 text-[#FF6F00]" />
            <p className={`text-3xl font-black ${lowStockItems.length > 0 ? 'text-[#FF6F00]' : 'text-on-surface'}`}>{lowStockItems.length + outOfStockItems.length}</p>
          </div>
        </Card>
        <Card className="m3-card !bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Today's Receipts</p>
          <div className="flex items-center gap-3 mt-2">
            <ArrowRight className="w-6 h-6 text-[#2E7D32]" />
            <p className="text-3xl font-black text-on-surface">{todaysReceipts}</p>
          </div>
        </Card>
        <Card className="m3-card !bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pending Counts</p>
          <div className="flex items-center gap-3 mt-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <p className="text-3xl font-black text-on-surface">{pendingCounts}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Alerts (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="m3-card !p-0 overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-red-50">
              <h3 className="text-sm font-bold uppercase text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-700" /> Low Stock Alerts
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-100">
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Department</th>
                    <th className="p-4 font-bold">Current Qty</th>
                    <th className="p-4 font-bold">Threshold</th>
                    <th className="p-4 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {[...outOfStockItems, ...lowStockItems].slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-4">
                        <p className="text-xs font-bold text-on-surface">{item.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{item.sku}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">{item.category}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold ${item.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-neutral-500 font-mono">{item.minThreshold}</span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => onAdjustStock(item.id)} className="m3-button-text !text-[10px] !px-3 !py-1.5 border border-primary/20 text-primary hover:bg-primary-container">
                          Create PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Live Activity Feed (1/3 width) */}
        <Card className="m3-card !p-0 flex flex-col h-[400px]">
          <div className="p-5 border-b border-neutral-100 bg-surface">
            <h3 className="text-sm font-bold uppercase text-on-surface flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Live Activity Feed
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {movements.slice(0, 8).map((move) => (
              <div key={move.id} className="flex gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  move.type === 'In' ? 'bg-green-500' : 
                  move.type === 'Out' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    {move.type === 'In' ? 'Stock Received' : move.type === 'Out' ? 'Stock Moved' : 'Stock Counted'} 
                    <span className="text-primary ml-1">{move.quantity > 0 ? '+' : ''}{move.quantity}</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Item: {items.find(i => i.id === move.itemId)?.name || move.itemId}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(move.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Floor Staff</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
