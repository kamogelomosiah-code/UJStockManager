import React from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Package, 
  MapPin, 
  Clock, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Card, CardContent } from './Card';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryListProps {
  items: InventoryItem[];
  onAdjustStock: (id: string) => void;
  currency: string;
  searchTerm: string;
  onQuickReplenish: (itemId: string, quantity: number, type: 'In' | 'Out', reason: string) => void;
}

export default function InventoryList({ 
  items, 
  onAdjustStock, 
  currency,
  searchTerm: globalSearchTerm,
  onQuickReplenish
}: InventoryListProps) {
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [successToast, setSuccessToast] = React.useState<{itemId: string, message: string} | null>(null);

  const searchTerm = globalSearchTerm || localSearchTerm;
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const searchString = `${item.name} ${item.sku} ${item.category} ${item.location}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleQuickAction = (itemId: string, qty: number, type: 'In' | 'Out', reason: string, itemName: string) => {
    onQuickReplenish(itemId, qty, type, reason);
    setSuccessToast({
      itemId,
      message: `${type === 'In' ? '+' : '-'}${qty} ${itemName} updated instantly!`
    });
    setTimeout(() => {
      setSuccessToast(null);
    }, 2500);
  };

  // Helper to generate rule-based AI recommendations for store owner to act quickly
  const getAiSuggestion = (item: InventoryItem) => {
    const isTomato = item.name.toLowerCase().includes('tomato');
    const isBread = item.name.toLowerCase().includes('bread') || item.name.toLowerCase().includes('bun');
    
    if (item.status === 'Out of Stock') {
      const restockQty = Math.max(15, item.minThreshold * 2);
      return {
        text: `${isTomato ? '🍅' : isBread ? '🍞' : '📦'} AI Alert: ${item.name} is completely empty! Critical restock of ${restockQty} units is recommended to prevent general student complaints during lunchtime.`,
        buttonText: `⚡ AI Restock +${restockQty}`,
        action: () => handleQuickAction(item.id, restockQty, 'In', 'AI Critical Out-of-Stock Auto Restock', item.name)
      };
    }
    
    if (item.status === 'Low Stock' || item.quantity <= item.minThreshold) {
      const restockQty = Math.max(10, Math.ceil(item.minThreshold * 1.5 - item.quantity));
      return {
        text: `✨ AI Suggests: ${item.name} levels are dipping (${item.quantity} units). Refill ${restockQty} units to restore standard cafeteria safety levels.`,
        buttonText: `⚡ AI Restock +${restockQty}`,
        action: () => handleQuickAction(item.id, restockQty, 'In', 'AI Recommended Safety Replenishment', item.name)
      };
    }

    // Expiry check triggers
    if (item.expiryDate) {
      const daysLeft = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24));
      if (daysLeft < 3) {
        return {
          text: `⚠️ Waste Risk: Expiry approaching in ${daysLeft > 0 ? `${daysLeft} days` : 'today'}! Tap to write-off damaged or stale items from shelves.`,
          buttonText: `⚡ Quick Clear / Log Write-off`,
          action: () => onAdjustStock(item.id)
        };
      }
    }

    // Normal items action suggestions
    return {
      text: `✅ Operational check: ${item.name} stock levels are stable. Register daily standard consumption of 1 unit.`,
      buttonText: `⚡ Log Cafeteria Consumed (-1)`,
      action: () => handleQuickAction(item.id, 1, 'Out', 'Regular Cafeteria Daily Dispensation', item.name)
    };
  };

  return (
    <div className="space-y-4 max-w-md mx-auto relative">
      
      {/* Search Bar - Modern Rounded Pill */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input 
          type="text" 
          placeholder="Search items, categories, shelves..." 
          className="w-full pl-12 pr-4 py-3 bg-neutral-100 text-neutral-900 border-none rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 font-sans transition-all placeholder:text-neutral-500"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
      </div>

      {/* Horizontal Scroll bar for Category filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth snap-x">
        {categories.map((cat) => {
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-full border transition-all shrink-0 cursor-pointer snap-center font-sans tracking-wide",
                isActive 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-neutral-600 border-neutral-200"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Card List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const aiSuggest = getAiSuggestion(item);
            const isCritical = item.status === 'Out of Stock' || item.status === 'Low Stock';
            // Safety stock percentage visualization
            const fillPercent = Math.min(100, Math.max(4, (item.quantity / Math.max(1, item.minThreshold * 1.8)) * 100));

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-neutral-200/60 rounded-2xl p-4.5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Active toast per-card confirmation feedback */}
                <AnimatePresence>
                  {successToast && successToast.itemId === item.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 p-4 text-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-[#137333] animate-bounce" />
                      <p className="text-xs font-bold text-neutral-900">{successToast.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card Header Info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 block font-display">
                      {item.category} • Shelf {item.location}
                    </span>
                    <h3 className="text-base font-display font-black tracking-tight text-neutral-900 leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  
                  {/* Status Badging */}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    item.status === 'In Stock' && "bg-[#E6F4EA] text-[#137333]",
                    item.status === 'Low Stock' && "bg-[#FEF7E0] text-[#B06000]",
                    item.status === 'Out of Stock' && "bg-[#FCE8E6] text-[#C5221F]"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      item.status === 'In Stock' && "bg-[#137333]",
                      item.status === 'Low Stock' && "bg-[#B06000]",
                      item.status === 'Out of Stock' && "bg-[#C5221F]"
                    )} />
                    {item.status}
                  </span>
                </div>

                {/* Visual Level indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-end justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-lg font-mono font-black",
                        isCritical ? "text-red-600" : "text-neutral-900"
                      )}>
                        {item.quantity}
                      </span>
                      <span className="text-xs text-neutral-400">/ {item.minThreshold} levels</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-neutral-800">
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>

                  {/* High contrast minimal progress stock meter */}
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.status === 'In Stock' && "bg-[#137333]",
                        item.status === 'Low Stock' && "bg-amber-500",
                        item.status === 'Out of Stock' && "bg-red-600"
                      )}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  
                  {item.expiryDate && (
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-1 font-semibold">
                      <Clock className="w-3 h-3" /> Expiration: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* AI dynamic action card recommendations nested natively */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2.5">
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-700 leading-normal font-medium">
                      {aiSuggest.text}
                    </p>
                  </div>
                  
                  {/* Immediate clickable quick action button */}
                  <button
                    onClick={aiSuggest.action}
                    className="w-full py-2 bg-black text-white hover:bg-neutral-900 active:scale-95 transition-all rounded-full text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {aiSuggest.buttonText}
                  </button>
                </div>

                {/* Manual precise adjustment secondary action link */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => onAdjustStock(item.id)}
                    className="text-[11px] font-bold text-neutral-500 hover:text-black flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer"
                  >
                    <ArrowUpDown className="w-3 h-3" /> Precise Logs / Custom Adjust
                  </button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty Search/Filter State */}
      {filteredItems.length === 0 && (
        <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl space-y-4">
          <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-200">
            <Package className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-display font-bold text-neutral-900 text-sm">No items match filters</h4>
            <p className="text-xs text-neutral-500">Simplify your categories or searching term above to monitor stock.</p>
          </div>
          <button 
            onClick={() => { setCategoryFilter('All'); setLocalSearchTerm(''); }}
            className="m3-button-tonal py-2 px-4 text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
      
    </div>
  );
}
