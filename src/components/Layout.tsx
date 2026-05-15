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

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({ children, activeView, onViewChange }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

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

          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                  activeView === item.id 
                    ? "bg-black text-white" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-black"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
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
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-[#E5E5E5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 w-64 transition-all focus:w-80"
              />
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-[#E5E5E5]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">Admin User</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Manager</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-black/5 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
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
