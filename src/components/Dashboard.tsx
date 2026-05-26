import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  TrendingDown,
  Activity,
  Sparkles,
  Loader2,
  CornerDownLeft,
  Calendar,
  Truck,
  HelpCircle,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { InventoryItem, StockMovement } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';

interface DashboardProps {
  items: InventoryItem[];
  movements: StockMovement[];
  currency: string;
  onAdjustStock: (id: string) => void;
  onViewChange: (view: string) => void;
}

export default function Dashboard({ items, movements, currency, onAdjustStock, onViewChange }: DashboardProps) {
  // Urgent notifications logic
  const lowStockItems = items.filter(i => i.status === 'Low Stock');
  const outOfStockItems = items.filter(i => i.status === 'Out of Stock');
  const expiringItems = items.filter(i => {
    if (!i.expiryDate) return false;
    const daysLeft = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    return daysLeft >= 0 && daysLeft <= 3;
  });

  // Incoming deliveries (recent movements with "In" type that mention delivery, supplier, restock)
  const incomingDeliveries = movements.filter(m => 
    m.type === 'In' && 
    (m.reason.toLowerCase().includes('delivery') || 
     m.reason.toLowerCase().includes('supplier') || 
     m.reason.toLowerCase().includes('restock'))
  );

  // Ask AI Chat State
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiAnswer, setAiAnswer] = React.useState<string>('');
  const [aiChart, setAiChart] = React.useState<any | null>(null);
  const [customQuestion, setCustomQuestion] = React.useState('');
  const [aiError, setAiError] = React.useState('');

  // Initial AI summary fetch
  React.useEffect(() => {
    fetchAiSummary();
  }, [items]);

  const fetchAiSummary = async (question?: string) => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question || '',
          inventory: items,
          movements: movements
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAiAnswer(data.answer);
        setAiChart(data.chart || null);
      } else {
        setAiError(data.error || 'Failed to generate AI insights');
      }
    } catch (err) {
      console.error(err);
      setAiError('Connection to AI service failed. Please verify setup.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    fetchAiSummary(customQuestion);
    setCustomQuestion('');
  };

  const handleQuickPrompt = (promptText: string) => {
    fetchAiSummary(promptText);
  };

  // Helper to render formatting from markdown responses
  function parseMarkdown(text: string) {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      // Bullet points starting with * or -
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="list-disc ml-6 mb-1 text-on-surface-variant text-sm">
            {parseInline(content)}
          </li>
        );
      }
      // Numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="list-decimal ml-6 mb-1 text-on-surface-variant text-sm">
            {parseInline(numMatch[2])}
          </li>
        );
      }
      // Headers
      if (line.trim().startsWith('###')) {
        return (
          <h4 key={idx} className="text-title-small font-bold text-on-surface mt-4 mb-2">
            {parseInline(line.replace('###', '').trim())}
          </h4>
        );
      }
      if (line.trim().startsWith('##')) {
        return (
          <h3 key={idx} className="text-title-medium font-bold text-on-surface mt-4 mb-2 border-b border-outline-variant/50 pb-1">
            {parseInline(line.replace('##', '').trim())}
          </h3>
        );
      }
      if (line.trim().startsWith('#')) {
        return (
          <h2 key={idx} className="text-title-large font-bold text-on-surface mt-4 mb-2">
            {parseInline(line.replace('#', '').trim())}
          </h2>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-2" />;
      
      return (
        <p key={idx} className="text-body-medium text-on-surface-variant mb-2 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    });
  }

  function parseInline(text: string) {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-[#6750A4]">{part}</strong>;
      }
      return part;
    });
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Streamlined Live Terminal Header */}
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#6750A4] font-display">
            Live Overview
          </span>
          <h2 className="text-xl font-display font-black tracking-tight text-neutral-900 uppercase">
            Store Terminal
          </h2>
          <p className="text-xs text-neutral-500 leading-normal font-medium">
            Real-time critical stock alerts & smart AI-generated insights.
          </p>
        </div>
        <div>
          <button 
            onClick={() => onViewChange('inventory')}
            className="w-full py-3 bg-neutral-950 text-white hover:bg-neutral-900 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
          >
            Go to Level Monitor <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main vertical flow optimized for mobile viewports */}
      <div className="space-y-6">
        
        {/* Urgent alerts shelf */}
        <div className="space-y-4">
          <Card className="border-l-4 border-l-[#C5221F] bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 border-b-0">
              <CardTitle className="text-xs font-display font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 pt-1">
                <ShieldAlert className="w-4.5 h-4.5 text-[#C5221F]" />
                Critical Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              
              {/* Deliveries block */}
              {incomingDeliveries.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#6750A4] font-bold flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Recent Deliveries Receivals
                  </h4>
                  <div className="space-y-1.5">
                    {incomingDeliveries.slice(0, 2).map((move) => (
                      <div key={move.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{move.itemName}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{move.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-[#137333] font-mono">
                          +{move.quantity} U
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of Stock alert block */}
              {outOfStockItems.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-neutral-100/60 mt-1">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#C5221F] font-bold">
                    Critical Red Alert: Out Of Stock ({outOfStockItems.length})
                  </h4>
                  <div className="space-y-2">
                    {outOfStockItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-3 bg-[#FCE8E6] border border-transparent rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#C5221F]">{item.name}</p>
                          <p className="text-[10px] text-[#C5221F]/80 mt-0.5">Shelf Location: {item.location}</p>
                        </div>
                        <button 
                          onClick={() => onAdjustStock(item.id)}
                          className="px-3.5 py-1.5 bg-[#C5221F] hover:bg-[#A51D1A] text-white rounded-full text-[10px] font-bold tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer font-sans"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Stock warn block */}
              {lowStockItems.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-neutral-100/60 mt-1">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#B06000] font-bold">
                    Attention Alert: Low Level ({lowStockItems.length})
                  </h4>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-3 bg-[#FEF7E0] border border-transparent rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#B06000]">{item.name}</p>
                          <p className="text-[10px] text-[#B06000]/80 mt-0.5">{item.quantity} left (Min: {item.minThreshold})</p>
                        </div>
                        <button 
                          onClick={() => onAdjustStock(item.id)}
                          className="px-3.5 py-1.5 bg-[#B06000] hover:bg-[#804000] text-white rounded-full text-[10px] font-bold tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer font-sans"
                        >
                          Replenish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expiry alerts block */}
              {expiringItems.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-neutral-100/60 mt-1">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#B06000] font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B06000]" /> Approaching Expiry ({expiringItems.length})
                  </h4>
                  <div className="space-y-2">
                    {expiringItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                          <p className="text-[10px] text-red-600 font-bold mt-0.5">
                            Expiration: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <button 
                          onClick={() => onAdjustStock(item.id)}
                          className="px-3 py-1.5 bg-neutral-200 text-neutral-800 rounded-full text-[10px] font-bold hover:bg-neutral-300 transition-all active:scale-95 cursor-pointer font-sans"
                        >
                          Write Off
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when everything is perfect */}
              {incomingDeliveries.length === 0 && outOfStockItems.length === 0 && lowStockItems.length === 0 && expiringItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#137333] font-bold text-xs uppercase tracking-wider">● All levels online & stable</p>
                  <p className="text-[11px] text-neutral-500 mt-1">No cafeteria items are presently running low.</p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Ask AI Smart Assistance panel */}
        <div className="space-y-4">
          <Card className="shadow-none bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="p-4 bg-[#6750A4] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-display font-extrabold uppercase tracking-widest text-white leading-none">AI Smart Assist</h3>
                  <p className="text-[10px] text-white/70 block mt-0.5 font-semibold">Store level forecasts and anomalies</p>
                </div>
              </div>
              {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            </div>

            <CardContent className="p-6 space-y-6">
              
              {/* Quick Prompts Shelf */}
              <div className="space-y-2">
                <span className="text-label-small text-outline font-bold uppercase tracking-wider block">Recommended Queries</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleQuickPrompt("Generate a comprehensive summary of stock levels and current trends")}
                    className="px-3.5 py-1.5 bg-surface-variant hover:bg-[#eaddff] text-on-surface-variant hover:text-[#21005d] text-xs font-medium rounded-full cursor-pointer transition-colors border border-transparent hover:border-primary-container"
                  >
                    Summarize Inventory
                  </button>
                  <button 
                    onClick={() => handleQuickPrompt("Which locations contain the items that are running low or out of stock? Give me a listing.")}
                    className="px-3.5 py-1.5 bg-surface-variant hover:bg-[#eaddff] text-on-surface-variant hover:text-[#21005d] text-xs font-medium rounded-full cursor-pointer transition-colors border border-transparent hover:border-primary-container"
                  >
                    Check Storage Anomalies
                  </button>
                  <button 
                    onClick={() => handleQuickPrompt("What is the total monetary value of our stock across categories, and what should we restock first?")}
                    className="px-3.5 py-1.5 bg-surface-variant hover:bg-[#eaddff] text-on-surface-variant hover:text-[#21005d] text-xs font-medium rounded-full cursor-pointer transition-colors border border-transparent hover:border-primary-container"
                  >
                    Assess Stock Value
                  </button>
                </div>
              </div>

              {/* Chat Text Screen */}
              <div className="border border-outline-variant/60 rounded-2xl bg-surface/40 p-5.5 min-h-[300px] max-h-[520px] overflow-y-auto space-y-4">
                {aiLoading && !aiAnswer ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-outline">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analyzing stock data levels...</p>
                  </div>
                ) : aiError ? (
                  <div className="p-4 bg-[#FCE8E6] text-[#C5221F] rounded-xl text-sm font-medium">
                    {aiError}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-indigo max-w-none">
                      {parseMarkdown(aiAnswer)}
                    </div>

                    {/* Inline dynamic charts of historical pattern/anomalies */}
                    {aiChart && aiChart.data && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-2xl bg-white border border-outline-variant/60 shadow-sm"
                      >
                        <div className="mb-4">
                          <h5 className="text-body-medium font-bold text-on-surface flex items-center gap-1.5">
                            <Activity className="w-5 h-5 text-[#6750A4]" />
                            {aiChart.title}
                          </h5>
                          <span className="text-[10px] text-outline block mt-0.5">Dynamic AI Generated Visual Chart</span>
                        </div>
                        
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            {aiChart.type === 'bar' ? (
                              <BarChart data={aiChart.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                <XAxis dataKey={aiChart.xAxisKey} stroke="#757575" fontSize={10} tickLine={false} />
                                <YAxis stroke="#757575" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e1e1e1', borderRadius: '12px' }} />
                                <Bar dataKey={aiChart.yAxisKey} fill="#6750A4" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            ) : aiChart.type === 'pie' ? (
                              <PieChart>
                                <Pie
                                  data={aiChart.data}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={65}
                                  paddingAngle={4}
                                  dataKey={aiChart.yAxisKey}
                                  nameKey={aiChart.xAxisKey}
                                >
                                  {aiChart.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#6750A4', '#03AAC9', '#B06000', '#C5221F', '#137333'][index % 5]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            ) : aiChart.type === 'area' ? (
                              <AreaChart data={aiChart.data}>
                                <defs>
                                  <linearGradient id="aiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6750A4" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#6750A4" stopOpacity={0.01}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                                <XAxis dataKey={aiChart.xAxisKey} stroke="#757575" fontSize={10} />
                                <YAxis stroke="#757575" fontSize={10} />
                                <Tooltip />
                                <Area type="monotone" dataKey={aiChart.yAxisKey} stroke="#6750A4" fillOpacity={1} fill="url(#aiAreaGrad)" />
                              </AreaChart>
                            ) : (
                              <LineChart data={aiChart.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                                <XAxis dataKey={aiChart.xAxisKey} stroke="#757575" fontSize={10} />
                                <YAxis stroke="#757575" fontSize={10} />
                                <Tooltip />
                                <Line type="monotone" dataKey={aiChart.yAxisKey} stroke="#6750A4" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Input Console */}
              <form onSubmit={handleAsk} className="relative flex items-center">
                <input 
                  type="text" 
                  disabled={aiLoading}
                  placeholder="Ask stock quantities, restock plans, valuations..."
                  className="w-full pl-5 pr-14 py-4.5 bg-surface-variant rounded-2xl outline-none text-sm text-on-surface border border-transparent focus:border-primary transition-all placeholder:text-on-surface-variant/60 disabled:opacity-50"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={aiLoading || !customQuestion.trim()}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-30 transition-opacity cursor-pointer shadow-sm active:scale-95"
                >
                  <CornerDownLeft className="w-5 h-5" />
                </button>
              </form>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
