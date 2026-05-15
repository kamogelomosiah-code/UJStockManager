import React from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { motion } from 'motion/react';
import { InventoryItem } from '../types';

interface AdjustStockModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSubmit: (quantity: number, type: 'In' | 'Out', reason: string) => void;
}

export default function AdjustStockModal({ item, onClose, onSubmit }: AdjustStockModalProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [type, setType] = React.useState<'In' | 'Out'>('In');
  const [reason, setReason] = React.useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <CardTitle className="text-xl font-bold">Adjust Stock</CardTitle>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product</p>
              <p className="font-bold">{item.name}</p>
              <p className="text-xs text-gray-500">Current Stock: <span className="font-bold text-black">{item.quantity}</span></p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setType('In')}
                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${type === 'In' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-transparent bg-gray-100 text-gray-500'}`}
              >
                Stock In (+)
              </button>
              <button 
                onClick={() => setType('Out')}
                className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${type === 'Out' ? 'border-red-500 bg-red-50 text-red-700' : 'border-transparent bg-gray-100 text-gray-500'}`}
              >
                Stock Out (-)
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-3 border-2 rounded-xl text-xl font-bold focus:border-black focus:outline-none transition-colors"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reason / Reference</label>
              <textarea 
                placeholder="e.g. Supplier delivery, Customer sale..."
                className="w-full px-4 py-3 border-2 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button 
              onClick={() => onSubmit(quantity, type, reason)}
              disabled={!reason}
              className="w-full py-4 bg-black hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg mt-4"
            >
              Update Stock
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
