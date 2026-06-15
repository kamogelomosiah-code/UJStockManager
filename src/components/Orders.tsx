import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';

export default function Orders() {
  const mockOrders = [
    { id: 'ORD-001', type: 'Sales', status: 'Completed', total: 1500, date: '2026-06-15' },
    { id: 'ORD-002', type: 'Purchase', status: 'Pending', total: 3200, date: '2026-06-14' },
    { id: 'ORD-003', type: 'Purchase', status: 'Completed', total: 850, date: '2026-06-14' },
    { id: 'ORD-004', type: 'Sales', status: 'Failed', total: 95, date: '2026-06-13' },
    { id: 'ORD-005', type: 'Sales', status: 'Completed', total: 240, date: '2026-06-13' },
    { id: 'ORD-006', type: 'Refund', status: 'Processing', total: -150, date: '2026-06-12' },
  ];

  return (
    <div className="space-y-6 w-full mx-auto">
      <Card className="m3-card">
        <CardHeader>
          <CardTitle className="text-title-medium font-bold text-on-surface">Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map(order => (
              <div key={order.id} className="p-4 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${order.type === 'Sales' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {order.type === 'Sales' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{order.id} - {order.type}</p>
                    <p className="text-xs text-neutral-500">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface">R {order.total.toFixed(2)}</p>
                  <p className={`text-xs font-bold ${
                    order.status === 'Completed' ? 'text-green-600' : 
                    order.status === 'Pending' ? 'text-orange-600' :
                    order.status === 'Processing' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
