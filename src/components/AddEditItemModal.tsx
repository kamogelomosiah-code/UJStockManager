import React from 'react';
import { InventoryItem } from '../types';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { motion, AnimatePresence } from 'motion/react';
import { clientMagicAdd } from '../lib/geminiClient';

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
  
  const [magicPrompt, setMagicPrompt] = React.useState('');
  const [isMagicLoading, setIsMagicLoading] = React.useState(false);
  const [magicError, setMagicError] = React.useState('');

  const handleMagicFill = async () => {
    if (!magicPrompt) return;
    setIsMagicLoading(true);
    setMagicError('');
    try {
      const data = await clientMagicAdd(magicPrompt);
      if (data && data.name) {
        setFormData(prev => ({
          ...prev,
          ...data
        }));
        setMagicPrompt('');
      } else {
        setMagicError('Failed to parse description accurately. Please try describing name, category and quantity clearly.');
      }
    } catch (err) {
      setMagicError('Auto-fill parsing failed.');
    } finally {
      setIsMagicLoading(false);
    }
  };

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
        <div className="bg-surface rounded-[28px] shadow-2xl overflow-hidden flex flex-col">
          <div className="flex flex-row items-center justify-between p-6 pb-2">
            <h3 className="text-title-large font-bold text-on-surface">
              {item ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 pt-2 overflow-y-auto max-h-[80vh]">
            {!item && (
              <div className="mb-6 p-4 bg-primary-container rounded-[16px] space-y-3">
                <div className="flex items-center gap-2 text-on-primary-container font-medium mb-1">
                  <Sparkles className="w-4 h-4" /> 
                  <span className="text-sm tracking-tight text-on-primary-container">AI Auto-Fill</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. 50 cans of Red Bull, costs 25" 
                    className="flex-1 px-4 py-2 bg-on-primary text-on-surface border border-transparent rounded-[8px] focus:outline-none text-sm placeholder:text-outline"
                    value={magicPrompt}
                    onChange={(e) => setMagicPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMagicFill()}
                  />
                  <button 
                    onClick={handleMagicFill}
                    disabled={isMagicLoading || !magicPrompt}
                    className="m3-button px-4 py-2"
                  >
                    {isMagicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Parse'}
                  </button>
                </div>
                {magicError && <p className="text-xs text-error font-medium">{magicError}</p>}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <input 
                  required
                  type="text" 
                  placeholder="Product Name"
                  className="m3-input w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder="SKU"
                    className="m3-input w-full"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                  
                  <select 
                    required
                    className="m3-input w-full cursor-pointer"
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

                  <input 
                    required
                    type="number" 
                    placeholder="Initial Quantity"
                    className="m3-input w-full"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  />

                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="Price (USD)"
                    className="m3-input w-full"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  />

                  <input 
                    required
                    type="number" 
                    placeholder="Min Threshold"
                    className="m3-input w-full"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})}
                  />

                  <input 
                    required
                    type="text" 
                    placeholder="Location (e.g. A-12)"
                    className="m3-input w-full"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                {formData.category === 'Food' && (
                  <div className="w-full">
                    <label className="text-label-small text-outline mb-1 block">Expiry Date</label>
                    <input 
                      type="datetime-local" 
                      className="m3-input w-full block"
                      value={formData.expiryDate?.split('Z')[0]}
                      onChange={(e) => setFormData({...formData, expiryDate: new Date(e.target.value).toISOString()})}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="m3-button-text"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="m3-button"
                >
                  {item ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
