import React from 'react';
import { StockMovement } from '../types';
import { Card, CardContent } from './Card';
import { ArrowUpRight, ArrowDownRight, Clock, Box } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface StockHistoryProps {
  movements: StockMovement[];
}

export default function StockHistory({ movements }: StockHistoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Stock History</h2>
        <p className="text-gray-500 text-sm mt-1">Timeline of all stock movements and adjustments.</p>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-100 hidden sm:block" />

        <div className="space-y-8">
          {movements.map((move, i) => (
            <motion.div 
              key={move.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center group"
            >
              {/* Timeline marker */}
              <div className={cn(
                "hidden sm:flex w-16 h-16 rounded-full border-4 border-white shadow-sm items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110",
                move.type === 'In' ? "bg-emerald-50 text-emerald-600" : move.type === 'Out' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
              )}>
                {move.type === 'In' ? <ArrowUpRight className="w-6 h-6" /> : move.type === 'Out' ? <ArrowDownRight className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>

              <Card className="flex-1 w-full group-hover:border-black/10 transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                        "sm:hidden w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        move.type === 'In' ? "bg-emerald-50 text-emerald-600" : move.type === 'Out' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {move.type === 'In' ? <ArrowUpRight className="w-5 h-5" /> : move.type === 'Out' ? <ArrowDownRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{move.itemName}</span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                            move.type === 'In' ? "bg-emerald-100 text-emerald-700" : move.type === 'Out' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {move.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{move.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                      <span className={cn(
                        "text-lg font-bold",
                        move.type === 'In' ? "text-emerald-600" : move.type === 'Out' ? "text-red-600" : "text-blue-600"
                      )}>
                        {move.type === 'In' ? '+' : move.type === 'Out' ? '-' : ''}{move.quantity}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {formatDate(move.date)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {movements.length === 0 && (
            <div className="py-20 text-center">
              <History className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-500 font-semibold mt-4">No history recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
