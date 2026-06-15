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
import { clientAskAi } from '../lib/geminiClient';
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
      const data = await clientAskAi({
        question: question || '',
        inventory: items,
        movements: movements
      });
      if (data) {
        setAiAnswer(data.answer || 'No analysis feedback generated.');
        setAiChart(data.chart || null);
      } else {
        setAiError('Failed to generate local AI analytics feedback.');
      }
    } catch (err) {
      console.error(err);
      setAiError('AI intelligence processing failed. Please check client API keys.');
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
    <div className="space-y-4 w-full mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <h1 className="text-2xl font-display font-black tracking-tight text-neutral-900 uppercase">
          Dashboard
        </h1>
        <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 font-mono">
          System Live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Column (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="m3-card !bg-surface !border-l-[6px] !border-l-[#C5221F]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Out of Stock</p>
                <div className="flex items-center gap-3 mt-2">
                  <AlertTriangle className="w-6 h-6 text-[#C5221F]" />
                  <p className="text-3xl font-black text-on-surface">{outOfStockItems.length}</p>
                </div>
            </Card>
            <Card className="m3-card !bg-surface !border-l-[6px] !border-l-[#B06000]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Low Stock</p>
                <div className="flex items-center gap-3 mt-2">
                  <TrendingDown className="w-6 h-6 text-[#B06000]" />
                  <p className="text-3xl font-black text-on-surface">{lowStockItems.length}</p>
                </div>
            </Card>
          </div>

          {/* Urgent actions list */}
          {outOfStockItems.length > 0 && (
            <Card className="m3-card !p-0">
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-on-surface flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C5221F]" /> Attention Needed
                </h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {outOfStockItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-4 bg-white flex justify-between items-center group hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-on-surface">{item.name}</p>
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">SKU: {item.sku}</p>
                    </div>
                    <button onClick={() => onAdjustStock(item.id)} className="m3-button-text !text-xs !px-4 !py-1.5 border border-primary/20 text-primary group-hover:bg-primary-container">Restock</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* AI Assistant Column (1/3 width, persistent on desktop) */}
        <div className="flex flex-col h-[480px] m3-card !p-0 !bg-surface-variant overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-primary text-white shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                 <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">Stock Copilot AI</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 text-sm text-on-surface-variant leading-relaxed font-sans relative">
             <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'}}></div>
            {aiLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-primary relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-[#FF3B30] animate-pulse">Analyzing...</span>
              </div>
            ) : (
               <div className="relative z-10 text-[13px]">
                 {parseMarkdown(aiAnswer) || <p className="opacity-70 text-center italic mt-10">No recent insights from the copilot.</p>}
               </div>
            )}
          </div>
          
          <div className="p-3 bg-surface border-t border-outline-variant/30 shrink-0">
             <form onSubmit={handleAsk} className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Ask stock copilot info..."
                  className="w-full bg-surface-variant rounded-full pl-5 pr-12 py-3.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 text-on-surface transition-shadow"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  disabled={aiLoading}
                />
                <button 
                  type="submit"
                  disabled={!customQuestion.trim() || aiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
