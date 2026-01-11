'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Truck,
  Package,
} from 'lucide-react';

interface Order {
  id: string;
  serviceType: 'cargo' | 'evacuator';
  subType: string;
  pickup: { address: string };
  dropoff: { address: string };
  customerPrice: number;
  driverPrice: number;
  phone: string;
  status: string;
  createdAt: Timestamp;
}

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    // Listen to recent orders
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
      setIsLoading(false);
    });

    // Listen to all orders for stats
    const allOrdersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeStats = onSnapshot(allOrdersQuery, (snapshot) => {
      let todayOrders = 0;
      let todayRevenue = 0;
      let pendingOrders = 0;
      let completedOrders = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp;

        // Check if order is from today
        if (createdAt && createdAt.toMillis() >= todayTimestamp.toMillis()) {
          todayOrders++;
          todayRevenue += (data.customerPrice || 0) - (data.driverPrice || 0);
        }

        // Count by status
        if (data.status === 'pending') {
          pendingOrders++;
        } else if (data.status === 'completed') {
          completedOrders++;
        }
      });

      setStats({
        todayOrders,
        todayRevenue,
        pendingOrders,
        completedOrders,
      });
    });

    return () => {
      unsubscribeOrders();
      unsubscribeStats();
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'მოლოდინში' },
      accepted: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'მიღებული' },
      in_progress: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'მიმდინარე' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'დასრულებული' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'გაუქმებული' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleDateString('ka-GE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statsCards = [
    {
      title: 'დღეს შეკვეთები',
      value: stats.todayOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'დღეს მოგება',
      value: formatPrice(stats.todayRevenue),
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'მოლოდინში',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'დასრულებული',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-[#1E293B] rounded-xl p-6 border border-[#475569]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-[#1E293B] rounded-xl border border-[#475569]">
        <div className="flex items-center justify-between p-6 border-b border-[#475569]">
          <h2 className="text-lg font-semibold text-white">ბოლო შეკვეთები</h2>
          <Link
            href="/admin/orders"
            className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            ყველას ნახვა
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>შეკვეთები არ არის</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#334155]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    სერვისი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    მისამართი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    ფასი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    სტატუსი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    თარიღი
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#475569]">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#334155] cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${order.serviceType === 'cargo' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                          {order.serviceType === 'cargo' ? (
                            <Package className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Truck className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {order.serviceType === 'cargo' ? 'ტვირთი' : 'ევაკუატორი'}
                          </p>
                          <p className="text-xs text-slate-400">{order.subType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white truncate max-w-xs">
                        {order.pickup?.address}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">
                        → {order.dropoff?.address}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-white">
                        {formatPrice(order.customerPrice)}
                      </p>
                      <p className="text-xs text-green-400">
                        +{formatPrice(order.customerPrice - order.driverPrice)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
