import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  TrendingDown,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { InventoryItem, StockMovement } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  items: InventoryItem[];
  movements: StockMovement[];
}

export default function Dashboard({ items, movements }: DashboardProps) {
  const totalItems = items.length;
  const lowStockCount = items.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = items.filter(i => i.status === 'Out of Stock').length;
  const totalValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const categoryData = Object.entries(
    items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#000000', '#404040', '#737373', '#A3A3A3', '#D4D4D4'];

  const stats = [
    {
      title: 'Total Products',
      value: totalItems,
      icon: Package,
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Total Stock Value',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      change: '+4.5%',
      trend: 'up',
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: AlertTriangle,
      description: `${outOfStockCount} Out of stock`,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Activity Today',
      value: movements.length,
      icon: Activity,
      description: 'Incoming & Outgoing',
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-gray-500 text-sm mt-1">Real-time inventory statistics and performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  {stat.change && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                      stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  {stat.description && (
                    <p className="text-xs text-gray-400 mt-2">{stat.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Stock by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   fontSize={12}
                   tick={{ fill: '#6B7280' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <button className="text-xs font-semibold text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {movements.slice(0, 5).map((move, i) => (
                <div key={move.id} className="flex gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                    move.type === 'In' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                  )}>
                    {move.type === 'In' ? <ArrowRight className="w-4 h-4 rotate-45" /> : <ArrowRight className="w-4 h-4 -rotate-45" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{move.itemName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{move.reason}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(move.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold",
                      move.type === 'In' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {move.type === 'In' ? '+' : '-'}{move.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
