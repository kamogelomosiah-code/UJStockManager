import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Scan, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerProps {
  items: InventoryItem[];
  onScanReceived: (itemId: string, quantity: number) => void;
}

export default function Scanner({ items, onScanReceived }: ScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setScannedItem(null);
    setSuccess(false);
    
    // Simulate network/camera delay
    setTimeout(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setScannedItem(randomItem);
      setQuantity(10);
      setScanning(false);
    }, 1500);
  };

  const handleConfirm = () => {
    if (scannedItem) {
      onScanReceived(scannedItem.id, quantity);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setScannedItem(null);
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-title-large font-bold text-on-surface">Stock Receiver</h1>
          <p className="text-body-medium text-on-surface-variant">Scan incoming deliveries or backroom stock.</p>
        </div>
      </div>

      <Card className="m3-card relative overflow-hidden border-2 border-dashed border-primary/30 bg-surface-variant/30">
        <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
             <div className={`absolute inset-0 bg-primary/20 rounded-full blur-xl ${scanning ? 'animate-pulse' : 'hidden'}`}></div>
             <div className={`p-5 rounded-full bg-primary-container text-primary relative z-10 transition-transform ${scanning ? 'scale-110' : ''}`}>
               <Scan className={`w-12 h-12 ${scanning ? 'animate-pulse' : ''}`} />
             </div>
          </div>
          
          <div>
            <h3 className="text-title-medium font-bold text-on-surface">
              {scanning ? 'Scanning Barcode...' : 'Ready to Scan'}
            </h3>
            <p className="text-body-small text-on-surface-variant mt-1">
              {scanning ? 'Hold camera steady over the item barcode.' : 'Tap below to simulate a barcode scan.'}
            </p>
          </div>

          <button 
            onClick={simulateScan} 
            disabled={scanning}
            className="m3-button mt-4 !px-8"
          >
            {scanning ? 'Scanning...' : 'Simulate Scan'}
          </button>
        </div>
      </Card>

      <AnimatePresence>
        {scannedItem && !success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="m3-card border-primary/20">
              <CardHeader className="pb-2 border-b border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-title-medium font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Item Detected
                  </CardTitle>
                  <span className="text-label-small font-mono bg-surface-variant px-2 py-1 rounded-md">{scannedItem.sku}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="text-body-large font-bold text-on-surface">{scannedItem.name}</h4>
                  <p className="text-body-small text-on-surface-variant">Category: {scannedItem.category}</p>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="flex-1">
                     <label className="text-label-small text-on-surface-variant font-bold uppercase tracking-wider mb-1 block">Received Qty</label>
                     <input 
                       type="number" 
                       value={quantity}
                       onChange={(e) => setQuantity(Number(e.target.value))}
                       className="m3-input w-full text-lg font-bold"
                       min="1"
                     />
                   </div>
                   <button onClick={handleConfirm} className="m3-button h-[46px] mt-5">
                     Confirm <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-green-50 text-green-700 rounded-2xl flex items-center gap-3 border border-green-200"
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Stock Updated Successfully</p>
              <p className="text-xs opacity-80">The system has logged the transaction.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
