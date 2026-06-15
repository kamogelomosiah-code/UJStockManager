import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Sparkles, ArrowRight, Loader2, Plus, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clientAskAi } from '../lib/geminiClient';
import { InventoryItem, StockMovement } from '../types';

interface CopilotViewProps {
  items: InventoryItem[];
  movements: StockMovement[];
}

export default function CopilotView({ items, movements }: CopilotViewProps) {
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user', content: string }>>([
    { role: 'ai', content: "Hello! I'm your Stock Copilot. What can I help you analyze or predict today?" }
  ]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || loading) return;

    const question = customQuestion;
    setCustomQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const data = await clientAskAi({
        question,
        inventory: items,
        movements: movements
      });
      if (data && data.answer) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer! }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: "I couldn't generate an analysis for that." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred while connecting to the smart assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setCustomQuestion(promptText);
  };

  function parseMarkdown(text: string) {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="list-disc ml-6 mb-1 text-sm">
            {parseInline(content)}
          </li>
        );
      }
      if (line.trim().startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-bold mt-3 mb-1">
            {parseInline(line.replace('###', '').trim())}
          </h4>
        );
      }
      if (line.trim().startsWith('##')) {
        return (
          <h3 key={idx} className="text-base font-bold mt-4 mb-2">
            {parseInline(line.replace('##', '').trim())}
          </h3>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-1.5" />;
      return (
        <p key={idx} className="text-sm mb-1.5 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    });
  }

  function parseInline(text: string) {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold">{part}</strong>;
      }
      return part;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] sm:h-[calc(100vh-180px)] w-full mx-auto max-w-2xl px-2 sm:px-0 relative">
      <div className="flex items-center justify-between py-2 mb-2 shrink-0">
        <h1 className="text-2xl font-display font-black tracking-tight text-neutral-900 uppercase">
          Copilot
        </h1>
        <span className="text-[10px] uppercase tracking-widest font-bold text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" /> Online
        </span>
      </div>

      <Card className="m3-card !p-0 flex flex-col flex-1 overflow-hidden bg-surface-variant/40 border border-neutral-200">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto w-full p-4 space-y-6 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-[20px] p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-[4px]' 
                    : 'bg-white text-on-surface border border-neutral-100 rounded-tl-[4px]'
                }`}
              >
                {msg.role === 'ai' ? (
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5 relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
                      <div className="w-6 h-6 rounded-full bg-primary-container text-primary flex items-center justify-center relative">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-sm">
                      {parseMarkdown(msg.content)}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start w-full"
            >
               <div className="max-w-[85%] rounded-[20px] rounded-tl-[4px] p-4 bg-white border border-neutral-100 shadow-sm flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-container text-primary flex items-center justify-center animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest animate-pulse mt-0.5">Thinking...</span>
               </div>
            </motion.div>
          )}
        </div>

        {/* Suggestion Chips */}
        {messages.length < 3 && (
        <div className="px-4 py-3 shrink-0 flex gap-2 overflow-x-auto no-scrollbar border-t border-neutral-100/50">
          <button onClick={() => handleQuickPrompt("What should we restock first?")} className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-1.5 shadow-sm active:scale-95">
            Restock Priority <ArrowRight className="w-3 h-3" />
          </button>
          <button onClick={() => handleQuickPrompt("Summarize expiring items")} className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-1.5 shadow-sm active:scale-95">
            Expiry Report <ArrowRight className="w-3 h-3" />
          </button>
          <button onClick={() => handleQuickPrompt("Give me a financial summary of current stock")} className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-colors flex items-center gap-1.5 shadow-sm active:scale-95">
            Financial Health <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        )}

        <div className="p-3 bg-white shrink-0 border-t border-neutral-200 z-10">
          <form onSubmit={handleAsk} className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Message Copilot..."
              className="w-full bg-surface-variant rounded-[24px] pl-5 pr-14 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-on-surface shadow-inner transition-all placeholder:text-neutral-400"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={!customQuestion.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:scale-95 shadow-md active:scale-95 group"
            >
              <CornerDownLeft className="w-4 h-4 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
