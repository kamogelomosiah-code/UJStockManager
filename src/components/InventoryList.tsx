import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Package
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Card, CardContent } from './Card';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryListProps {
  items: InventoryItem[];
  onAdjustStock: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  currency: string;
  searchTerm: string;
}

export default function InventoryList({ 
  items, 
  onAdjustStock, 
  onEdit, 
  onDelete,
  onAddNew,
  currency,
  searchTerm: globalSearchTerm
}: InventoryListProps) {
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');

  const searchTerm = globalSearchTerm || localSearchTerm;

  const categories = ['All', ...new Set(items.map(i => i.category))];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "uj_inventory_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm(`Import ${json.length} items? This will merge with current data.`)) {
            (window as any).importItems(json);
          }
        }
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const filteredItems = items.filter(item => {
    const searchString = `${item.name} ${item.sku} ${item.category} ${item.location}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-display-small font-normal tracking-tight text-on-surface">Inventory</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="m3-button-tonal cursor-pointer">
            <Filter className="w-4 h-4" /> Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={handleExport}
            className="m3-button-tonal"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Filters Bar */}
          <div className="p-4 border-b border-outline-variant flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-12 pr-4 py-2 bg-surface-variant text-on-surface border-none rounded-full text-sm focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/70"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <select 
                  className="bg-surface-variant text-on-surface border-none rounded-t-[4px] px-4 py-2 border-b border-outline text-sm focus:outline-none focus:border-b-2 focus:border-primary transition-all cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select 
                  className="bg-surface-variant text-on-surface border-none rounded-t-[4px] px-4 py-2 border-b border-outline text-sm focus:outline-none focus:border-b-2 focus:border-primary transition-all cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface">
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider">SKU / Loc</th>
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider">Stock Info</th>
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-label-small font-medium text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.tr 
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-surface-variant transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-body-medium font-medium">{item.name}</span>
                          {item.expiryDate && (
                            <span className={cn(
                              "text-label-small mt-1 flex items-center gap-1",
                              new Date(item.expiryDate) < new Date() ? "text-error font-medium" : "text-outline"
                            )}>
                              {new Date(item.expiryDate) < new Date() ? 'Expiried!' : `Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-label-small font-mono text-on-surface-variant bg-surface-variant border border-outline-variant px-2 py-1 rounded w-fit">
                            {item.sku}
                          </span>
                          <span className="text-label-small text-outline mt-1">{item.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-body-small text-on-surface-variant">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-body-medium font-medium",
                            item.quantity <= item.minThreshold ? "text-error" : ""
                          )}>
                            {item.quantity} units
                          </span>
                          <span className="text-label-small text-outline mt-0.5">Min: {item.minThreshold}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-body-medium">
                        {formatCurrency(item.price, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-small font-medium tracking-wide",
                          item.status === 'In Stock' && "bg-[#E6F4EA] text-[#137333]",
                          item.status === 'Low Stock' && "bg-[#FEF7E0] text-[#B06000]",
                          item.status === 'Out of Stock' && "bg-[#FCE8E6] text-[#C5221F]"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.status === 'In Stock' && "bg-[#137333]",
                            item.status === 'Low Stock' && "bg-[#B06000]",
                            item.status === 'Out of Stock' && "bg-[#C5221F]"
                          )} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onAdjustStock(item.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary transition-all shadow-sm border border-transparent hover:border-outline-variant"
                            title="Adjust Stock"
                          >
                            <ArrowUpDown className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onEdit(item)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface hover:text-primary transition-all shadow-sm border border-transparent hover:border-outline-variant"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onDelete(item.id)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-all shadow-sm border border-transparent hover:border-outline-variant"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredItems.length === 0 && (
                   <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 text-outline-variant" />
                        <p className="font-medium">No items found</p>
                        <p className="text-body-small">Adjust your search or filters to see more results.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between">
            <p className="text-body-small text-outline">
              Showing <span className="font-medium text-on-surface">{filteredItems.length}</span> of <span className="font-medium text-on-surface">{items.length}</span> items
            </p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant hover:bg-surface-variant disabled:opacity-30 transition-colors" disabled>
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-outline-variant hover:bg-surface-variant disabled:opacity-30 transition-colors" disabled>
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <button 
        onClick={onAddNew}
        className="fixed bottom-[96px] md:bottom-8 right-4 md:right-8 bg-primary text-on-primary rounded-[16px] shadow-lg shadow-black/20 px-4 py-4 flex items-center gap-3 z-40 transition-transform active:scale-95 group hover:opacity-90"
      >
        <Plus className="w-6 h-6" />
        <span className="font-medium text-sm pr-2 hidden md:block">New Product</span>
      </button>
    </div>
  );
}
