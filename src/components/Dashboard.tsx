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
  currency: string;
}

export default function Dashboard({ items, movements, currency }: DashboardProps) {
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

  const COLORS = ['#6750A4', '#938F99', '#79747E', '#49454F', '#1C1B1F'];

  const stats = [
    {
      title: 'Current Inventory',
      value: totalItems,
      icon: Package,
      change: '+12%',
      trend: 'up',
      color: 'bg-primary-container text-on-primary-container'
    },
    {
      title: 'Operational Value',
      value: formatCurrency(totalValue, currency),
      icon: DollarSign,
      change: '+8.2%',
      trend: 'up',
      color: 'bg-[#E6F4EA] text-[#137333]'
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: AlertTriangle,
      description: `${outOfStockCount} items out of stock`,
      color: 'bg-[#FEF7E0] text-[#B06000]'
    },
    {
      title: 'Recent Activity',
      value: movements.length,
      icon: Activity,
      description: 'System actions today',
      color: 'bg-[#FCE8E6] text-[#C5221F]'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-small font-normal tracking-tight text-on-surface">Overview</h2>
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
                  <div className={cn("p-2 rounded-[12px]", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  {stat.change && (
                    <div className={cn(
                      "flex items-center gap-1 text-label-small font-medium px-2.5 py-1 rounded-full tracking-wide",
                      stat.trend === 'up' ? "bg-[#E6F4EA] text-[#137333]" : "bg-[#FCE8E6] text-[#C5221F]"
                    )}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-label-small font-medium text-on-surface-variant uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-display-small font-normal mt-1">{stat.value}</h3>
                  {stat.description && (
                    <p className="text-body-small text-outline mt-2">{stat.description}</p>
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
            <CardTitle className="text-title-medium">Stock by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  fontSize={12}
                  tick={{ fill: 'var(--color-on-surface-variant)' }}
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   fontSize={12}
                   tick={{ fill: 'var(--color-on-surface-variant)' }}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-variant)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid var(--color-outline-variant)', 
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
          <CardHeader className="flex flex-row items-center justify-between border-b-0">
            <CardTitle className="text-title-medium">Recent Activity</CardTitle>
            <button className="text-label-small font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {movements.slice(0, 5).map((move, i) => (
                <div key={move.id} className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    move.type === 'In' ? "bg-[#E6F4EA] text-[#137333]" : "bg-[#FCE8E6] text-[#C5221F]"
                  )}>
                    {move.type === 'In' ? <ArrowRight className="w-5 h-5 rotate-45" /> : <ArrowRight className="w-5 h-5 -rotate-45" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium font-medium truncate text-on-surface">{move.itemName}</p>
                    <p className="text-body-small text-on-surface-variant mt-0.5 line-clamp-1">{move.reason}</p>
                    <p className="text-label-small text-outline mt-1">{new Date(move.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex items-center">
                    <p className={cn(
                      "text-body-large font-bold tracking-tight",
                      move.type === 'In' ? "text-[#137333]" : "text-[#C5221F]"
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
