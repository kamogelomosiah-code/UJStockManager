import React from 'react';
import { 
  BarChart3, 
  Box, 
  History, 
  LayoutDashboard, 
  Menu, 
  MoreVertical, 
  Plus, 
  Search, 
  Settings, 
  Package,
  Bell,
  User,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { User as UserType, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  user: UserType | null;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export default function Layout({ 
  children, 
  activeView, 
  onViewChange, 
  user,
  notifications,
  onNotificationRead,
  searchTerm,
  onSearchChange
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'history', label: 'Stock History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-[#E2E2E2]">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full border-r border-[#E5E5E5] bg-white transition-all duration-300 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-bottom border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              {isSidebarOpen && <span className="font-bold tracking-tight text-lg">StockMaster</span>}
            </div>
          </div>

          <nav className="flex-1 px-3 py-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-tight",
                  activeView === item.id 
                    ? "bg-black text-white shadow-lg shadow-black/10 scale-[1.02]" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-black"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", activeView === item.id ? "text-white" : "text-gray-400")} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-[#E5E5E5]">
             <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
               UJ Cafeteria v1.0
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          isSidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        {/* Header */}
        <header className="h-16 border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="Find anything..." 
                className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-black/5 w-64 transition-all focus:w-96 focus:bg-white"
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (activeView !== 'inventory') onViewChange('inventory');
                }}
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 hover:bg-gray-100 rounded-full relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xl z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b flex items-center justify-between">
                      <span className="font-bold">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <p className="text-sm">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button 
                            key={n.id}
                            onClick={() => onNotificationRead(n.id)}
                            className={cn(
                              "w-full text-left p-4 hover:bg-gray-50 transition-colors border-b last:border-0",
                              !n.read && "bg-blue-50/30"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                !n.read ? "bg-red-500" : "bg-gray-300"
                              )} />
                              <div>
                                <p className="text-xs font-bold text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-2">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-[#E5E5E5]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{user?.role || 'Staff'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-black/5 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
