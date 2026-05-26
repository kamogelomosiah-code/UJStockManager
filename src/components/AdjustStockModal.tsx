import React from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
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
        <div className="bg-surface rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
          <div className="flex flex-row items-center justify-between p-6 pb-2">
            <h3 className="text-title-large font-bold text-on-surface">Adjust Stock</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 pt-2 space-y-6">
            <div className="p-4 bg-surface-variant rounded-[16px]">
              <p className="text-label-small text-on-surface-variant uppercase tracking-wider mb-1">Product</p>
              <p className="font-bold text-body-large">{item.name}</p>
              <p className="text-body-small text-on-surface-variant mt-1">Current Stock: <span className="font-bold text-on-surface">{item.quantity}</span></p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setType('In')}
                className={`flex-1 py-4 rounded-[16px] border-2 transition-all font-medium text-sm flex flex-col items-center gap-2 ${type === 'In' ? 'border-[#137333] bg-[#E6F4EA] text-[#137333]' : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-variant'}`}
              >
                <ArrowUpCircle className="w-6 h-6" />
                Stock In (+)
              </button>
              <button 
                onClick={() => setType('Out')}
                className={`flex-1 py-4 rounded-[16px] border-2 transition-all font-medium text-sm flex flex-col items-center gap-2 ${type === 'Out' ? 'border-[#C5221F] bg-[#FCE8E6] text-[#C5221F]' : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-variant'}`}
              >
                <ArrowDownCircle className="w-6 h-6" />
                Stock Out (-)
              </button>
            </div>

            <div className="space-y-4">
              <input 
                type="number" 
                min="1"
                placeholder="Quantity"
                className="m3-input w-full text-center text-title-large py-4"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />

              <textarea 
                placeholder="Reason / Reference (e.g. Supplier delivery)"
                className="m3-input w-full resize-none"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-4 gap-3 border-t border-outline-variant">
              <button 
                type="button"
                onClick={onClose}
                className="m3-button-text"
              >
                Cancel
              </button>
              <button 
                onClick={() => onSubmit(quantity, type, reason)}
                disabled={!reason}
                className="m3-button"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
