'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import {
  Search,
  Filter,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface Order {
  id: string;
  serviceType: 'cargo' | 'evacuator';
  subType: string;
  pickup: { address: string };
  dropoff: { address: string };
  distance: number;
  customerPrice: number;
  driverPrice: number;
  phone: string;
  status: string;
  createdAt: Timestamp;
}

const statusOptions = [
  { value: 'all', label: 'ყველა' },
  { value: 'pending', label: 'მოლოდინში' },
  { value: 'accepted', label: 'მიღებული' },
  { value: 'in_progress', label: 'მიმდინარე' },
  { value: 'completed', label: 'დასრულებული' },
  { value: 'cancelled', label: 'გაუქმებული' },
];

const ITEMS_PER_PAGE = 10;

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Search by phone
    if (searchQuery) {
      result = result.filter((order) =>
        order.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.pickup?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.dropoff?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((order) => {
        if (!order.createdAt) return false;
        return order.createdAt.toDate() >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((order) => {
        if (!order.createdAt) return false;
        return order.createdAt.toDate() <= end;
      });
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, statusFilter, searchQuery, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'მოლოდინში' },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'მიღებული' },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'მიმდინარე' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'დასრულებული' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'გაუქმებული' },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძებნა ტელეფონით..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-gray-900"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          ნაპოვნია: {filteredOrders.length} შეკვეთა
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {paginatedOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>შეკვეთები არ მოიძებნა</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    სერვისი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    აყვანა
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ჩაბარება
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ფასი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    სტატუსი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    თარიღი
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${order.serviceType === 'cargo' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                          {order.serviceType === 'cargo' ? (
                            <Package className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Truck className="w-4 h-4 text-orange-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {order.serviceType === 'cargo' ? 'ტვირთი' : 'ევაკუატორი'}
                          </p>
                          <p className="text-xs text-gray-500">{order.subType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 truncate max-w-[200px]">
                        {order.pickup?.address || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 truncate max-w-[200px]">
                        {order.dropoff?.address || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatPrice(order.customerPrice)}
                      </p>
                      <p className="text-xs text-green-600">
                        მოგება: {formatPrice(order.customerPrice - order.driverPrice)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              გვერდი {currentPage} / {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
