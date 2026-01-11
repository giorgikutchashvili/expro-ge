'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, doc, deleteDoc } from 'firebase/firestore';
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
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';

// Crane icon component
const CraneLiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6" />
    <path d="M3 10v10a1 1 0 0 0 1 1h4" />
    <path d="M21 10v10a1 1 0 0 0-1 1h-4" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 10l5-6 5 6" />
    <path d="M12 4v6" />
  </svg>
);

interface Order {
  id: string;
  serviceType: 'cargo' | 'evacuator' | 'crane';
  subType: string;
  pickup: { address: string };
  dropoff?: { address: string };
  distance?: number;
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

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    window.location.href = `/admin/orders/${orderId}?edit=true`;
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'orders', orderToDelete.id));
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('შეკვეთის წაშლა ვერ მოხერხდა');
    } finally {
      setIsDeleting(false);
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'cargo':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'evacuator':
        return <Truck className="w-4 h-4 text-orange-400" />;
      case 'crane':
        return <CraneLiftIcon className="w-4 h-4 text-emerald-400" />;
      default:
        return <Package className="w-4 h-4 text-slate-400" />;
    }
  };

  const getServiceBgColor = (serviceType: string) => {
    switch (serviceType) {
      case 'cargo':
        return 'bg-blue-500/20';
      case 'evacuator':
        return 'bg-orange-500/20';
      case 'crane':
        return 'bg-emerald-500/20';
      default:
        return 'bg-slate-500/20';
    }
  };

  const getServiceLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'cargo':
        return 'ტვირთი';
      case 'evacuator':
        return 'ევაკუატორი';
      case 'crane':
        return 'ამწე ლიფტი';
      default:
        return serviceType;
    }
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
      <div className="bg-[#1E293B] rounded-xl p-4 border border-[#475569]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ძებნა ტელეფონით..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-slate-400 bg-[#334155]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-[#334155] text-white"
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
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white bg-[#334155]"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white bg-[#334155]"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-slate-400">
          ნაპოვნია: {filteredOrders.length} შეკვეთა
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1E293B] rounded-xl border border-[#475569] overflow-hidden">
        {paginatedOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>შეკვეთები არ მოიძებნა</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#334155]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    სერვისი
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    აყვანა
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    ჩაბარება
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                    მოქმედებები
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#475569]">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#334155] cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-slate-400">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getServiceBgColor(order.serviceType)}`}>
                          {getServiceIcon(order.serviceType)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {getServiceLabel(order.serviceType)}
                          </p>
                          <p className="text-xs text-slate-400">{order.subType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white truncate max-w-[200px]">
                        {order.pickup?.address || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white truncate max-w-[200px]">
                        {order.serviceType === 'crane' ? '-' : (order.dropoff?.address || '-')}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-white">
                        {formatPrice(order.customerPrice)}
                      </p>
                      <p className="text-xs text-green-400">
                        მოგება: {formatPrice(order.customerPrice - order.driverPrice)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => handleEditClick(e, order.id)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="რედაქტირება"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, order)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="წაშლა"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#475569]">
            <div className="text-sm text-slate-400">
              გვერდი {currentPage} / {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#475569] hover:bg-[#334155] text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#475569] hover:bg-[#334155] text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#1E293B] rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-[#475569]">
            {/* Close button */}
            <button
              onClick={() => !isDeleting && setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg"
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white text-center mb-2">
              შეკვეთის წაშლა
            </h3>

            {/* Description */}
            <p className="text-slate-400 text-center mb-6">
              დარწმუნებული ხართ, რომ გსურთ შეკვეთის წაშლა{' '}
              <span className="font-mono font-semibold text-white">
                #{orderToDelete.id.slice(-6).toUpperCase()}
              </span>
              ? ეს მოქმედება შეუქცევადია.
            </p>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-[#475569] text-slate-300 rounded-lg hover:bg-[#334155] font-medium transition-colors disabled:opacity-50"
              >
                გაუქმება
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'წაშლა'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
