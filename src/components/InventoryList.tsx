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
  const categories = ['All', 'Produce', 'Butchery', 'Bakery', 'Dry Goods', 'Beverages', 'Household'];

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
    <div className="space-y-6 w-full mx-auto relative px-4 sm:px-6">
      
      {/* Search Bar - Modern Rounded Pill */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input 
          type="text" 
          placeholder="Search by product name, barcode, or SKU..." 
          className="w-full pl-12 pr-4 py-3 bg-white text-neutral-900 border border-neutral-200 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-neutral-500 shadow-sm"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
        />
      </div>

      {/* Horizontal Scroll bar for Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth snap-x">
        {categories.map((cat) => {
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-5 py-2 text-sm font-semibold rounded-full transition-all shrink-0 cursor-pointer snap-center tracking-wide",
                isActive 
                  ? "bg-primary text-white shadow-md" 
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Card List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
               className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-[12px] border border-neutral-200 border-dashed"
             >
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 mb-2">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No items found</h3>
                <p className="text-sm text-neutral-500 max-w-sm">We couldn't find any inventory matching your search. Try adjusting your filters.</p>
             </motion.div>
          ) : (
          filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => onAdjustStock(item.id)}
                className="bg-white rounded-[12px] p-4 shadow-sm border border-neutral-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 justify-between sm:items-center relative group"
              >
                <div className="flex-1 space-y-2">
                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary transition-colors">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-neutral-500 font-mono">
                    <span>SKU: {item.sku}</span>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full hidden sm:block" />
                    <span>Barcode: {item.id.padStart(12, '0')}</span>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full hidden sm:block" />
                    <span className="font-sans font-semibold bg-neutral-100 px-2 py-0.5 rounded-md">{item.category}</span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
                  <div className="flex flex-col items-start sm:items-end w-1/3 sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Total Qty</span>
                    <span className="text-lg font-black text-neutral-900">{item.quantity}</span>
                  </div>
                  <div className="flex flex-col items-start sm:items-end w-1/3 sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Floor</span>
                    <span className="text-lg font-bold text-green-700">{Math.floor(item.quantity * 0.8)}</span>
                  </div>
                  <div className="flex flex-col items-start sm:items-end w-1/3 sm:w-auto">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Back-room</span>
                    <span className="text-lg font-bold text-blue-700">{Math.ceil(item.quantity * 0.2)}</span>
                  </div>
                  
                  <div className="w-full sm:w-[100px] flex justify-start sm:justify-end mt-2 sm:mt-0">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'In Stock' && "bg-green-100 text-green-800",
                      item.status === 'Low Stock' && "bg-orange-100 text-orange-800",
                      item.status === 'Out of Stock' && "bg-red-100 text-red-800"
                    )}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
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
