import React from 'react';
import { StockMovement } from '../types';
import { Card, CardContent } from './Card';
import { ArrowUpRight, ArrowDownRight, Clock, Box, History } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface StockHistoryProps {
  movements: StockMovement[];
}

export default function StockHistory({ movements }: StockHistoryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-small font-normal tracking-tight text-on-surface">Stock History</h2>
        <p className="text-body-medium text-on-surface-variant mt-1">Timeline of all stock movements and adjustments.</p>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-outline-variant hidden sm:block" />

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
                "hidden sm:flex w-16 h-16 rounded-full border-4 border-surface shadow-sm items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110",
                move.type === 'In' ? "bg-[#E6F4EA] text-[#137333]" : move.type === 'Out' ? "bg-[#FCE8E6] text-[#C5221F]" : "bg-primary-container text-on-primary-container"
              )}>
                {move.type === 'In' ? <ArrowUpRight className="w-6 h-6" /> : move.type === 'Out' ? <ArrowDownRight className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>

              <Card className="m3-card flex-1 w-full !p-0 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                        "sm:hidden w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0",
                        move.type === 'In' ? "bg-[#E6F4EA] text-[#137333]" : move.type === 'Out' ? "bg-[#FCE8E6] text-[#C5221F]" : "bg-primary-container text-on-primary-container"
                      )}>
                        {move.type === 'In' ? <ArrowUpRight className="w-5 h-5" /> : move.type === 'Out' ? <ArrowDownRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-body-large font-bold text-on-surface">{move.itemName}</span>
                          <span className={cn(
                            "text-label-small font-medium tracking-wide px-2 py-0.5 rounded-full",
                            move.type === 'In' ? "bg-[#E6F4EA] text-[#137333]" : move.type === 'Out' ? "bg-[#FCE8E6] text-[#C5221F]" : "bg-primary-container text-on-primary-container"
                          )}>
                            {move.type}
                          </span>
                        </div>
                        <p className="text-body-small text-on-surface-variant flex items-center gap-1 mt-1">{move.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                      <span className={cn(
                        "text-title-large font-bold",
                        move.type === 'In' ? "text-[#137333]" : move.type === 'Out' ? "text-[#C5221F]" : "text-primary"
                      )}>
                        {move.type === 'In' ? '+' : move.type === 'Out' ? '-' : ''}{move.quantity}
                      </span>
                      <span className="text-label-small text-outline">
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
              <History className="w-12 h-12 text-outline mx-auto" />
              <p className="text-body-large font-medium text-on-surface-variant mt-4">No history recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
