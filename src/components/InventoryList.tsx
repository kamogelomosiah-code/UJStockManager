import React from 'react';
import { 
  MoreVertical, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  AlertCircle,
  Package
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrency, cn, formatDate } from '../lib/utils';
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
          // In a real app we'd validate the schema here
          // For demo, we just trigger the update in App.tsx via a callback
          if (confirm(`Import ${json.length} items? This will merge with current data.`)) {
            // We need a prop for this
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
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track your products across all locations.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
            <Filter className="w-4 h-4" /> Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Filters Bar */}
          <div className="p-4 border-b border-[#E5E5E5] flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or SKU..." 
                className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</span>
                <select 
                  className="bg-gray-50 border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                <select 
                  className="bg-gray-50 border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
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
                <tr className="bg-gray-50/80">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">SKU / Loc</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Stock Info</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.tr 
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{item.name}</span>
                          {item.expiryDate && (
                            <span className={cn(
                              "text-[10px] mt-1 flex items-center gap-1",
                              new Date(item.expiryDate) < new Date() ? "text-red-500 font-bold" : "text-gray-400"
                            )}>
                              {new Date(item.expiryDate) < new Date() ? 'Expiried!' : `Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                            {item.sku}
                          </span>
                          <span className="text-[11px] text-gray-400 mt-1">{item.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-sm font-bold",
                            item.quantity <= item.minThreshold ? "text-orange-600" : ""
                          )}>
                            {item.quantity} units
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">Min: {item.minThreshold}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {formatCurrency(item.price, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          item.status === 'In Stock' && "bg-emerald-50 text-emerald-600 border border-emerald-100",
                          item.status === 'Low Stock' && "bg-orange-50 text-orange-600 border border-orange-100",
                          item.status === 'Out of Stock' && "bg-red-50 text-red-600 border border-red-100"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.status === 'In Stock' && "bg-emerald-600",
                            item.status === 'Low Stock' && "bg-orange-600",
                            item.status === 'Out of Stock' && "bg-red-600"
                          )} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onAdjustStock(item.id)}
                            className="p-2 hover:bg-black hover:text-white rounded-xl transition-all shadow-sm border border-gray-100"
                            title="Adjust Stock"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onEdit(item)}
                            className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-gray-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => onDelete(item.id)}
                            className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all shadow-sm border border-gray-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredItems.length === 0 && (
                   <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 text-gray-200" />
                        <p className="font-semibold">No items found</p>
                        <p className="text-xs">Adjust your search or filters to see more results.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filteredItems.length}</span> of <span className="font-semibold text-gray-600">{items.length}</span> items
            </p>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded border border-[#E5E5E5] disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded border border-[#E5E5E5] disabled:opacity-50" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
