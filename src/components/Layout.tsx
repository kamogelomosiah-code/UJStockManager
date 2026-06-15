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
  Download,
  LogOut
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
  onNotificationsClick: () => void;
  onLogout: () => void;
}

export default function Layout({ 
  children, 
  activeView, 
  onViewChange, 
  user,
  notifications,
  onNotificationRead,
  searchTerm,
  onSearchChange,
  onNotificationsClick,
  onLogout
}: LayoutProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ArrowUpRight },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex justify-center text-on-surface font-sans selection:bg-primary-container">
      {/* Centered responsive constraint */}
      <div className="w-full max-w-4xl min-h-screen bg-white flex flex-col shadow-sm sm:border-x border-neutral-200 relative pb-[80px]">
        {/* Top App Bar */}
        <header className="h-[64px] bg-white sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-100 shrink-0">
          <h1 className="text-base font-display font-extrabold tracking-tight text-on-surface uppercase flex items-center gap-1.5">
            <Box className="w-5 h-5 text-primary" />
            Stock<span className="text-primary">Master</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={onNotificationsClick}
                className="p-2 hover:bg-neutral-50 rounded-full relative text-on-surface-variant cursor-pointer active:scale-95 transition-all"
                title="Open Notifications Center"
              >
                <Bell className="w-5 h-5 text-neutral-800" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-primary text-on-primary text-[9px] flex items-center justify-center rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            <button 
                onClick={onLogout}
                className="p-2 hover:bg-neutral-50 rounded-full text-neutral-600 cursor-pointer active:scale-95 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            
            <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
              {user?.avatar ? (
                <img src={user.avatar} alt="DP" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-neutral-600" />
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Content wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overflow-x-hidden bg-neutral-50/50">
          {children}
        </div>

        {/* Dynamic Navigation Bar (Bottom) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-white/95 backdrop-blur-md border-t border-neutral-100 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] z-50 flex items-center justify-around h-[80px] px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="flex flex-col items-center justify-center w-full h-full gap-[4px]"
              >
                <div className={cn(
                  "w-16 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95",
                  isActive ? "bg-primary-container text-primary" : "text-neutral-500 hover:text-neutral-900"
                )}>
                  <item.icon className="w-5 h-5 shrink-0" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-tight font-sans transition-colors",
                  isActive ? "text-primary" : "text-neutral-400"
                )}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
