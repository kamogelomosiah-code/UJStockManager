import React from 'react';
import { InventoryItem } from '../types';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { motion, AnimatePresence } from 'motion/react';

interface AddEditItemModalProps {
  item?: InventoryItem | null;
  onClose: () => void;
  onSubmit: (item: Partial<InventoryItem>) => void;
}

export default function AddEditItemModal({ item, onClose, onSubmit }: AddEditItemModalProps) {
  const [formData, setFormData] = React.useState<Partial<InventoryItem>>(
    item || {
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      minThreshold: 5,
      price: 0,
      location: '',
      status: 'In Stock'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <CardTitle className="text-xl font-bold">
              {item ? 'Edit Product' : 'Add New Product'}
            </CardTitle>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">SKU</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Books">Books</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Initial Quantity</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (USD)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Min Threshold</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. A-12"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                {formData.category === 'Food' && (
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black/5"
                      value={formData.expiryDate?.split('Z')[0]}
                      onChange={(e) => setFormData({...formData, expiryDate: new Date(e.target.value).toISOString()})}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  {item ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
