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
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-container">
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 flex items-center justify-around h-[80px] pb-safe">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex flex-col items-center justify-center w-full h-full gap-1"
            >
              <div className={cn(
                "w-16 h-8 rounded-full flex items-center justify-center transition-colors",
                isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
              )}>
                <item.icon className="w-6 h-6 shrink-0" />
              </div>
              <span className={cn(
                "text-[12px] font-medium tracking-wide",
                isActive ? "text-on-surface" : "text-on-surface-variant"
              )}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Navigation Rail */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-[88px] bg-surface flex-col items-center py-6 z-50">
        <div className="w-12 h-12 bg-primary rounded-[16px] flex items-center justify-center mb-8 shadow-sm">
          <Box className="w-7 h-7 text-on-primary" />
        </div>

        <nav className="flex-1 flex flex-col gap-6 w-full">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className="flex flex-col items-center justify-center w-full gap-1 relative group"
              >
                <div className={cn(
                  "w-14 h-[32px] rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer",
                  isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant group-hover:bg-surface-variant"
                )}>
                  <item.icon className="w-5 h-5 shrink-0" />
                </div>
                <span className={cn(
                  "text-[12px] font-medium tracking-wide",
                  isActive ? "text-on-surface" : "text-on-surface-variant"
                )}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:pl-[88px] pb-20 md:pb-0 transition-all duration-300 min-h-screen flex flex-col">
        {/* Top App Bar */}
        <header className="h-[64px] bg-surface sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
          <h1 className="text-title-large font-bold tracking-tight text-on-surface md:hidden">StockMaster</h1>
          <div className="hidden md:block"></div>
          
          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-12 pr-4 py-2.5 bg-surface-variant text-on-surface border-none rounded-full text-sm focus:outline-none focus:ring-0 w-40 md:w-64 transition-all md:focus:w-96 placeholder:text-on-surface-variant/70"
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
                className="p-2 hover:bg-surface-variant rounded-full relative text-on-surface-variant"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-error text-on-error text-[10px] flex items-center justify-center rounded-full font-bold">
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
                    className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant rounded-[24px] shadow-md z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                      <span className="font-medium text-title-medium">Notifications</span>
                      {unreadCount > 0 && <span className="text-[10px] bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant">
                          <p className="text-sm">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button 
                            key={n.id}
                            onClick={() => onNotificationRead(n.id)}
                            className={cn(
                              "w-full text-left p-4 hover:bg-surface-variant transition-colors",
                              !n.read && "bg-secondary-container/20"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                !n.read ? "bg-error" : "bg-outline-variant"
                              )} />
                              <div>
                                <p className="text-sm font-medium text-on-surface">{n.title}</p>
                                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-outline mt-2">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
            
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="DP" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-on-secondary-container" />
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
