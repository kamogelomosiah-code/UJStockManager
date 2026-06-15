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
  // Urgent notifications logic
  const lowStockItems = items.filter(i => i.status === 'Low Stock');
  const outOfStockItems = items.filter(i => i.status === 'Out of Stock');
  const expiringItems = items.filter(i => {
    if (!i.expiryDate) return false;
    const daysLeft = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    return daysLeft >= 0 && daysLeft <= 3;
  });

  // Incoming deliveries (recent movements with "In" type that mention delivery, supplier, restock)
  const incomingDeliveries = movements.filter(m => 
    m.type === 'In' && 
    (m.reason.toLowerCase().includes('delivery') || 
     m.reason.toLowerCase().includes('supplier') || 
     m.reason.toLowerCase().includes('restock'))
  );

  return (
    <div className="space-y-4 w-full mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-display font-black tracking-tight text-neutral-900 uppercase">
          Dashboard
        </h1>
        <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 font-mono">
          System Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Column (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="m3-card !bg-surface !border-l-[6px] !border-l-[#C5221F]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Out of Stock</p>
                <div className="flex items-center gap-3 mt-2">
                  <AlertTriangle className="w-6 h-6 text-[#C5221F]" />
                  <p className="text-3xl font-black text-on-surface">{outOfStockItems.length}</p>
                </div>
            </Card>
            <Card className="m3-card !bg-surface !border-l-[6px] !border-l-[#B06000]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Low Stock</p>
                <div className="flex items-center gap-3 mt-2">
                  <TrendingDown className="w-6 h-6 text-[#B06000]" />
                  <p className="text-3xl font-black text-on-surface">{lowStockItems.length}</p>
                </div>
            </Card>
          </div>

          {/* Urgent actions list */}
          {outOfStockItems.length > 0 && (
            <Card className="m3-card !p-0">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-on-surface flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C5221F]" /> Attention Needed
                </h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {outOfStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-4 bg-white flex justify-between items-center group hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-on-surface">{item.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">SKU: {item.sku}</p>
                    </div>
                    <button onClick={() => onAdjustStock(item.id)} className="m3-button-text !text-xs !px-4 !py-1.5 border border-primary/20 text-primary group-hover:bg-primary-container">Restock</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* AI Assistant Column (1/3 width, persistent on desktop) */}
        <div className="flex flex-col h-[480px] m3-card !p-0 !bg-surface-variant overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-primary text-white shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                 <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">Stock Copilot AI</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center z-10">
            <Sparkles className="w-12 h-12 text-primary/40 mb-4" />
            <h3 className="text-sm font-bold text-on-surface mb-2">Smart Inventory Analysis</h3>
            <p className="text-xs text-neutral-500 max-w-[200px] mb-6">
              Chat with your AI assistant to generate dynamic stock trends and restock reports.
            </p>
            <button 
              onClick={() => onViewChange('copilot')}
              className="m3-button !px-8 hover:scale-105 transition-transform"
            >
              Open Copilot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
