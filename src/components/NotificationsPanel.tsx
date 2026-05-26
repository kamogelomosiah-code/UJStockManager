import React from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Clock, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Calendar, 
  Zap, 
  CheckCircle, 
  ArrowUpRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  Plus,
  Minus
} from 'lucide-react';
import { Notification, InventoryItem } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { Card, CardContent } from './Card';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  items: InventoryItem[];
  currency: string;
  onNotificationRead: (id: string) => void;
  onNotificationDelete: (id: string) => void;
  onSnoozeNotification: (id: string, snoozeMs: number) => void;
  onQuickReplenish: (itemId: string, quantity: number, type: 'In' | 'Out', reason: string) => void;
}

export default function NotificationsPanel({
  isOpen,
  onClose,
  notifications,
  items,
  currency,
  onNotificationRead,
  onNotificationDelete,
  onSnoozeNotification,
  onQuickReplenish
}: NotificationsPanelProps) {
  const [filter, setFilter] = React.useState<'All' | 'Unread' | 'Low Stock' | 'Expiry'>('All');
  const [activeReplenishId, setActiveReplenishId] = React.useState<string | null>(null);
  const [replenishQty, setReplenishQty] = React.useState<number>(10);
  const [replenishReason, setReplenishReason] = React.useState<string>('Emergency Restock');

  if (!isOpen) return null;

  // Derive target item for action handlers
  const getItemFromNotification = (notif: Notification) => {
    // Notifications have ID format: alert-itemId-status or expiry-itemId
    const itemId = notif.id.replace('alert-', '').replace('-Low Stock', '').replace('-Out of Stock', '').replace('expiry-', '');
    return items.find(i => i.id === itemId || i.sku === itemId);
  };

  const filteredNotifs = notifications.filter(n => {
    // Check local storage snooze filter
    const snoozeTime = (n as any).snoozedUntil;
    if (snoozeTime && new Date(snoozeTime).getTime() > Date.now()) {
      return false; // Snoozed and still active, hide from view
    }

    if (filter === 'Unread') return !n.read;
    if (filter === 'Low Stock') return n.type === 'Low Stock' && n.title !== 'Expiring Soon';
    if (filter === 'Expiry') return n.type === 'Expiry' || n.title === 'Expiring Soon';
    return true;
  });

  const handleSnooze = (id: string, hours: number) => {
    const ms = hours * 60 * 60 * 1000;
    onSnoozeNotification(id, ms);
  };

  const handleExecuteReplenish = (itemId: string, type: 'In' | 'Out', defaultMsg: string) => {
    onQuickReplenish(itemId, replenishQty, type, replenishReason || defaultMsg);
    setActiveReplenishId(null);
    setReplenishQty(10);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-surface-variant/40 backdrop-blur-md flex items-center justify-center p-0 md:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        className="w-full h-full md:max-w-4xl md:h-[90vh] bg-surface md:rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-outline-variant"
      >
        {/* Header bar */}
        <div className="px-6 py-5 bg-primary text-on-primary flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Notifications Center</h2>
              <p className="text-xs text-white/80 mt-0.5">Manage low-stock levels, action items, and fresh stock alerts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 active:bg-white/20 text-on-primary rounded-full transition-transform active:scale-90"
            aria-label="Close panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-3 bg-surface border-b border-outline-variant/50 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Unread', 'Low Stock', 'Expiry'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer",
                  filter === t 
                    ? "bg-primary-container text-on-primary-container" 
                    : "bg-surface hover:bg-surface-variant text-on-surface-variant"
                )}
              >
                {t} {t === 'Unread' && notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
              </button>
            ))}
          </div>
          <p className="text-xs text-outline">{filteredNotifs.length} alerts pending</p>
        </div>

        {/* List of Notification Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {filteredNotifs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center space-y-4"
              >
                <div className="p-5 bg-secondary-container/30 rounded-full border border-outline-variant">
                  <CheckCircle className="w-12 h-12 text-[#137333]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">No notifications fit this category</h3>
                  <p className="text-body-small text-outline py-0">You are fully compliant with standard safety levels!</p>
                </div>
              </motion.div>
            ) : (
              filteredNotifs.map((n) => {
                const item = getItemFromNotification(n);
                const isReplenishing = activeReplenishId === n.id;
                
                return (
                  <motion.div
                    key={n.id}
                    layoutId={n.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={cn(
                      "p-5 rounded-3xl border transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between",
                      !n.read 
                        ? "bg-[#6750A4]/5 border-primary-container shadow-sm" 
                        : "bg-surface border-outline-variant"
                    )}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Left colored accent icon */}
                      <div className={cn(
                        "p-3 rounded-2xl shrink-0 mt-0.5",
                        n.type === 'Low Stock' ? "bg-[#FEF7E0] text-[#B06000]" : "bg-[#FCE8E6] text-[#C5221F]"
                      )}>
                        {n.type === 'Low Stock' ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      </div>

                      {/* Text details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-on-surface text-sm md:text-base">{n.title}</h4>
                          {!n.read && (
                            <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {n.message}
                        </p>
                        
                        {item && (
                          <div className="flex flex-wrap gap-2 pt-1 text-xs text-outline font-medium">
                            <span className="bg-surface-variant px-2.5 py-0.5 rounded-full border border-outline-variant">
                              Location ID: {item.location}
                            </span>
                            <span className="bg-surface-variant px-2.5 py-0.5 rounded-full border border-outline-variant">
                              Total Cost: {formatCurrency(item.price, currency)}
                            </span>
                          </div>
                        )}

                        <span className="text-[10px] text-outline block pt-1.5">
                          Detected on {new Date(n.date).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Operational Action Column */}
                    <div className="w-full md:w-auto flex flex-col gap-2 items-stretch shrink-0">
                      
                      {/* In-place restock toggle form */}
                      {isReplenishing ? (
                        <div className="bg-surface-variant p-4 rounded-2xl border border-primary-container space-y-3 shadow-inner">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-on-surface-variant">Replenish Quantity:</span>
                            <div className="flex items-center gap-1">
                              <button 
                                type="button" 
                                onClick={() => setReplenishQty(Math.max(1, replenishQty - 5))}
                                className="w-8 h-8 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-on-surface active:scale-90"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-on-surface">{replenishQty}</span>
                              <button 
                                type="button" 
                                onClick={() => setReplenishQty(replenishQty + 5)}
                                className="w-8 h-8 rounded-full bg-surface border border-outline-variant flex items-center justify-center text-on-surface active:scale-90"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <input 
                            type="text" 
                            className="w-full text-xs px-3 py-2 border border-outline-variant rounded-xl bg-surface text-on-surface outline-none focus:border-primary"
                            placeholder="Reason (Optional)"
                            value={replenishReason}
                            onChange={(e) => setReplenishReason(e.target.value)}
                          />

                          <div className="flex gap-2 justify-end pt-1">
                            <button 
                              onClick={() => { setActiveReplenishId(null); setReplenishQty(10); }}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-[#C5221F] rounded-lg hover:bg-[#FCE8E6]"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => {
                                if (item) {
                                  handleExecuteReplenish(item.id, 'In', 'Manual safety level adjustment');
                                }
                              }}
                              className="px-3 py-1.5 text-[11px] font-bold bg-[#137333] text-white rounded-lg hover:bg-opacity-90 active:scale-95"
                            >
                              Replenish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-row md:flex-col lg:flex-row gap-2 items-center justify-end">
                          
                          {/* Main smart action solver */}
                          {item && (
                            <button
                              onClick={() => {
                                setReplenishReason(n.type === 'Expiry' ? 'Expired food write-off' : 'Urgent supplier replenishing');
                                setReplenishQty(n.type === 'Expiry' ? item.quantity : 15);
                                setActiveReplenishId(n.id);
                              }}
                              className={cn(
                                "flex-1 md:w-full lg:flex-none px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer text-white",
                                n.type === 'Expiry' 
                                  ? "bg-outline hover:bg-outline/80" 
                                  : "bg-primary hover:bg-primary/95"
                              )}
                            >
                              <Zap className="w-3.5 h-3.5" />
                              {n.type === 'Expiry' ? 'Quick Write off' : 'Replenish'}
                            </button>
                          )}

                          {/* Marks read toggle */}
                          {!n.read && (
                            <button
                              onClick={() => onNotificationRead(n.id)}
                              className="p-2 bg-secondary-container hover:bg-opacity-80 text-on-secondary-container rounded-xl flex items-center justify-center cursor-pointer"
                              title="Dismiss / Mark Read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Snooze Timer Options */}
                          <div className="relative group">
                            <button
                              className="p-2 bg-surface hover:bg-surface-variant border border-outline-variant text-outline rounded-xl flex items-center justify-center cursor-pointer"
                              title="Snooze Alert"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <div className="hidden group-hover:flex flex-col absolute bottom-full md:bottom-auto md:top-full right-0 bg-surface border border-outline-variant rounded-xl shadow-lg z-[110] py-1 mt-1 w-28">
                              <button 
                                onClick={() => handleSnooze(n.id, 1)} 
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-variant text-on-surface font-medium"
                              >
                                Snooze 1 hr
                              </button>
                              <button 
                                onClick={() => handleSnooze(n.id, 8)} 
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-variant text-on-surface font-medium"
                              >
                                Snooze 8 hrs
                              </button>
                              <button 
                                onClick={() => handleSnooze(n.id, 24)} 
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-surface-variant text-on-surface font-medium"
                              >
                                Snooze 1 day
                              </button>
                            </div>
                          </div>

                          {/* Standard Delete option */}
                          <button
                            onClick={() => onNotificationDelete(n.id)}
                            className="p-2 text-[#C5221F] hover:bg-[#FCE8E6] rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Action Bottom buttons */}
        <div className="px-6 py-4 bg-surface-variant/20 border-t border-outline-variant/60 flex items-center justify-between">
          <button 
            onClick={() => {
              notifications.forEach(n => onNotificationRead(n.id));
            }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Mark all read
          </button>
          <p className="text-[11px] text-outline">Manage active restock loops securely</p>
        </div>
      </motion.div>
    </div>
  );
}
