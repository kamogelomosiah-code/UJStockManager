/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import StockHistory from './components/StockHistory';
import AddEditItemModal from './components/AddEditItemModal';
import AdjustStockModal from './components/AdjustStockModal';
import Settings from './components/Settings';
import Auth from './components/Auth';
import NotificationsPanel from './components/NotificationsPanel';
import { DEMO_ITEMS, DEMO_MOVEMENTS } from './constants';
import { InventoryItem, StockMovement, User } from './types';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeView, setActiveView] = React.useState('dashboard');
  const [user, setUser] = React.useState<User | null>(null);
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [currency, setCurrency] = React.useState('USD');
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [globalSearch, setGlobalSearch] = React.useState('');
  
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialization
  React.useEffect(() => {
    const savedUser = localStorage.getItem('uj_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedItems = localStorage.getItem('uj_inventory');
    const savedMovements = localStorage.getItem('uj_movements');
    const savedCurrency = localStorage.getItem('uj_currency');
    const savedNotifications = localStorage.getItem('uj_notifications');

    setItems(savedItems ? JSON.parse(savedItems) : DEMO_ITEMS);
    setMovements(savedMovements ? JSON.parse(savedMovements) : DEMO_MOVEMENTS);
    
    if (savedCurrency) {
      setCurrency(savedCurrency);
    } else {
      // Default to South African Rand (R) representing UJ Cafeteria environment
      setCurrency('ZAR');
    }

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    
    // Non-intrusive geolocation background check on first run
    if (!savedCurrency && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // South Africa coordinates matching
          if (latitude < -20 && latitude > -36 && longitude > 15 && longitude < 35) {
            setCurrency('ZAR');
          } else if (latitude > 35 && latitude < 70 && longitude > -10 && longitude < 30) {
            setCurrency('EUR');
          } else {
            setCurrency('USD');
          }
        },
        () => {
          // Fallback is already set to ZAR
        },
        { timeout: 5000 }
      );
    }
    
    setIsInitialized(true);

    // Global hack for import capability
    (window as any).importItems = (newItems: InventoryItem[]) => {
      setItems(prev => {
        const merged = [...newItems, ...prev];
        const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
        return unique;
      });
    };
  }, []);

  // Persistence
  React.useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('uj_inventory', JSON.stringify(items));
    localStorage.setItem('uj_movements', JSON.stringify(movements));
    localStorage.setItem('uj_currency', currency);
    localStorage.setItem('uj_notifications', JSON.stringify(notifications));
  }, [items, movements, currency, notifications, isInitialized]);

  // Check for alerts
  React.useEffect(() => {
    const newNotifications: any[] = [];
    items.forEach(item => {
      if (item.status === 'Low Stock' || item.status === 'Out of Stock') {
        const id = `alert-${item.id}-${item.status}`;
        if (!notifications.find(n => n.id === id)) {
           newNotifications.push({
             id,
             title: item.status,
             message: `${item.name} is currently ${item.status.toLowerCase()} (${item.quantity} left).`,
             type: 'Low Stock',
             date: new Date().toISOString(),
             read: false
           });
        }
      }
      if (item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 86400000 * 3)) { // 3 days
         const id = `expiry-${item.id}`;
         if (!notifications.find(n => n.id === id)) {
           newNotifications.push({
             id,
             title: 'Expiring Soon',
             message: `${item.name} will expire on ${new Date(item.expiryDate).toLocaleDateString()}.`,
             type: 'Expiry',
             date: new Date().toISOString(),
             read: false
           });
         }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50));
    }
  }, [items]);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = React.useState<InventoryItem | null>(null);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const addItem = (newItem: Partial<InventoryItem>) => {
    const item: InventoryItem = {
      ...newItem as InventoryItem,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString(),
      status: newItem.quantity === 0 ? 'Out of Stock' : 
              newItem.quantity! <= newItem.minThreshold! ? 'Low Stock' : 'In Stock'
    };
    setItems([item, ...items]);
    
    // Add movement record
    const movement: StockMovement = {
      id: 'm' + Date.now(),
      itemId: item.id,
      itemName: item.name,
      type: 'In',
      quantity: item.quantity,
      date: new Date().toISOString(),
      reason: 'Initial stock'
    };
    setMovements([movement, ...movements]);
    setIsAddModalOpen(false);
  };

  const updateItem = (updatedItem: Partial<InventoryItem>) => {
    setItems(items.map(i => i.id === editingItem?.id ? { 
      ...i, 
      ...updatedItem,
      status: updatedItem.quantity === 0 ? 'Out of Stock' : 
              updatedItem.quantity! <= updatedItem.minThreshold! ? 'Low Stock' : 'In Stock'
    } as InventoryItem : i));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleAdjustStock = (quantity: number, type: 'In' | 'Out', reason: string) => {
    if (!adjustingItem) return;

    const newQuantity = type === 'In' ? adjustingItem.quantity + quantity : adjustingItem.quantity - quantity;
    
    // Update items
    setItems(items.map(i => i.id === adjustingItem.id ? {
      ...i,
      quantity: newQuantity,
      lastUpdated: new Date().toISOString(),
      status: newQuantity === 0 ? 'Out of Stock' : 
              newQuantity <= i.minThreshold ? 'Low Stock' : 'In Stock'
    } : i));

    // Record movement
    const movement: StockMovement = {
      id: 'm' + Date.now(),
      itemId: adjustingItem.id,
      itemName: adjustingItem.name,
      type: type === 'In' ? 'In' : 'Out',
      quantity,
      date: new Date().toISOString(),
      reason
    };
    setMovements([movement, ...movements]);
    setAdjustingItem(null);
  };

  const handleNotificationDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSnoozeNotification = (id: string, snoozeMs: number) => {
    const snoozedUntil = new Date(Date.now() + snoozeMs).toISOString();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, snoozedUntil } : n));
  };

  const handleQuickReplenish = (itemId: string, quantity: number, type: 'In' | 'Out', reason: string) => {
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return;

    const newQuantity = type === 'In' ? targetItem.quantity + quantity : Math.max(0, targetItem.quantity - quantity);

    setItems(prevItems => prevItems.map(i => i.id === itemId ? {
      ...i,
      quantity: newQuantity,
      lastUpdated: new Date().toISOString(),
      status: newQuantity === 0 ? 'Out of Stock' : 
              newQuantity <= i.minThreshold ? 'Low Stock' : 'In Stock'
    } as InventoryItem : i));

    const movement: StockMovement = {
      id: 'm' + Date.now(),
      itemId,
      itemName: targetItem.name,
      type,
      quantity,
      date: new Date().toISOString(),
      reason
    };
    setMovements(prevMoves => [movement, ...prevMoves]);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            items={items} 
            movements={movements} 
            currency={currency} 
            onAdjustStock={(id) => setAdjustingItem(items.find(i => i.id === id) || null)}
            onViewChange={setActiveView}
          />
        );
      case 'inventory':
        return (
          <InventoryList 
            items={items} 
            onAdjustStock={(id) => setAdjustingItem(items.find(i => i.id === id) || null)}
            currency={currency}
            searchTerm={globalSearch}
            onQuickReplenish={handleQuickReplenish}
          />
        );
      case 'history':
        return <StockHistory movements={movements} />;
      case 'settings':
        return (
          <Settings 
            user={user} 
            onLogout={() => { localStorage.removeItem('uj_user'); setUser(null); }} 
            onUpdateUser={setUser}
            currency={currency}
            onUpdateCurrency={setCurrency}
          />
        );
      default:
        return (
          <Dashboard 
            items={items} 
            movements={movements} 
            currency={currency} 
            onAdjustStock={(id) => setAdjustingItem(items.find(i => i.id === id) || null)}
            onViewChange={setActiveView}
          />
        );
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      user={user} 
      notifications={notifications}
      onNotificationRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))}
      searchTerm={globalSearch}
      onSearchChange={setGlobalSearch}
      onNotificationsClick={() => setIsNotificationsOpen(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={activeView}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {(isAddModalOpen || editingItem) && (
          <AddEditItemModal 
            item={editingItem}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingItem(null);
            }}
            onSubmit={editingItem ? updateItem : addItem}
          />
        )}
        {adjustingItem && (
          <AdjustStockModal 
            item={adjustingItem}
            onClose={() => setAdjustingItem(null)}
            onSubmit={handleAdjustStock}
          />
        )}
        {isNotificationsOpen && (
          <NotificationsPanel 
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            items={items}
            currency={currency}
            onNotificationRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))}
            onNotificationDelete={handleNotificationDelete}
            onSnoozeNotification={handleSnoozeNotification}
            onQuickReplenish={handleQuickReplenish}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

