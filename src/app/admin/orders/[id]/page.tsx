'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import { ServiceVehicleType, CustomerVehicleType, EvacuatorAnswers, SERVICE_VEHICLE_LABELS, CUSTOMER_VEHICLE_LABELS, CargoSize, PaymentMethodType, PAYMENT_METHOD_LABELS, CraneFloor, CraneCargoType, CraneDuration, CRANE_FLOOR_LABELS, CRANE_CARGO_LABELS, CRANE_DURATION_LABELS } from '@/lib/types';
import { usePricing } from '@/hooks/usePricing';
import { TBILISI_FIXED_ZONE_KM } from '@/lib/constants';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { useGoogleMaps } from '@/components/GoogleMapsProvider';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Star,
  User,
  Banknote,
  CreditCard,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Save,
} from 'lucide-react';

interface Order {
  id: string;
  serviceType: 'cargo' | 'evacuator' | 'crane';
  subType: string;
  // New evacuator fields
  customerVehicleType?: CustomerVehicleType;
  serviceVehicleType?: ServiceVehicleType;
  evacuatorAnswers?: EvacuatorAnswers;
  // Crane fields
  craneFloor?: CraneFloor;
  craneCargoType?: CraneCargoType;
  craneDuration?: CraneDuration;
  pickup: { address: string; lat: number; lng: number };
  dropoff?: { address: string; lat: number; lng: number };
  distance?: number;
  customerPrice: number;
  driverPrice: number;
  phone: string;
  paymentMethod?: PaymentMethodType;
  status: string;
  driverId?: string;
  scheduledTime?: Timestamp;
  createdAt: Timestamp;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType?: string;
  serviceVehicleType?: ServiceVehicleType;
  craneDuration?: CraneDuration;
  baseLocation?: string;
  workingDays?: string[];
  workingHours?: { start: string; end: string };
}

const statusOptions = [
  { value: 'pending', label: 'მოლოდინში', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'accepted', label: 'მიღებული', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'in_progress', label: 'მიმდინარე', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'completed', label: 'დასრულებული', color: 'bg-green-500/20 text-green-400' },
  { value: 'cancelled', label: 'გაუქმებული', color: 'bg-red-500/20 text-red-400' },
];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

// Get current day of week as string
const getCurrentDayCode = (): string => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[new Date().getDay()];
};

// Check if current time is within working hours
const isWithinWorkingHours = (hours?: { start: string; end: string }): boolean => {
  if (!hours) return true; // If no hours set, assume available

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = hours.start.split(':').map(Number);
  const [endHour, endMin] = hours.end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

interface EditFormData {
  phone: string;
  customerPrice: number;
  driverPrice: number;
  status: string;
  notes: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded } = useGoogleMaps();
  const { calculateDetailedPrice, settings } = usePricing();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
  const [editForm, setEditForm] = useState<EditFormData>({
    phone: '',
    customerPrice: 0,
    driverPrice: 0,
    status: '',
    notes: '',
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get matching drivers for evacuator orders
  const matchingEvacuatorDrivers = useMemo(() => {
    if (!order || order.serviceType !== 'evacuator' || !order.serviceVehicleType) {
      return [];
    }

    const currentDay = getCurrentDayCode();

    return drivers
      .filter((driver) => {
        // Must have matching service vehicle type
        if (driver.serviceVehicleType !== order.serviceVehicleType) return false;

        // Check if working today
        if (driver.workingDays && !driver.workingDays.includes(currentDay)) return false;

        return true;
      })
      .map((driver) => ({
        ...driver,
        isAvailableNow: isWithinWorkingHours(driver.workingHours),
      }))
      .sort((a, b) => {
        // Prioritize available drivers
        if (a.isAvailableNow && !b.isAvailableNow) return -1;
        if (!a.isAvailableNow && b.isAvailableNow) return 1;
        return 0;
      });
  }, [order, drivers]);

  // Get matching drivers for cargo orders
  const matchingCargoDrivers = useMemo(() => {
    if (!order || order.serviceType !== 'cargo' || !order.subType) {
      return [];
    }

    const currentDay = getCurrentDayCode();

    return drivers
      .filter((driver) => {
        // Must be a cargo driver (has vehicleType but no serviceVehicleType)
        if (driver.serviceVehicleType) return false;

        // Must have matching vehicle type
        if (driver.vehicleType !== order.subType) return false;

        // Check if working today
        if (driver.workingDays && !driver.workingDays.includes(currentDay)) return false;

        return true;
      })
      .map((driver) => ({
        ...driver,
        isAvailableNow: isWithinWorkingHours(driver.workingHours),
      }))
      .sort((a, b) => {
        // Prioritize available drivers
        if (a.isAvailableNow && !b.isAvailableNow) return -1;
        if (!a.isAvailableNow && b.isAvailableNow) return 1;
        return 0;
      });
  }, [order, drivers]);

  // Get matching drivers for crane orders
  const matchingCraneDrivers = useMemo(() => {
    if (!order || order.serviceType !== 'crane') {
      return [];
    }

    const currentDay = getCurrentDayCode();

    return drivers
      .filter((driver) => {
        // Must be a crane driver (has craneDuration)
        if (!driver.craneDuration) return false;

        // Check if working today
        if (driver.workingDays && !driver.workingDays.includes(currentDay)) return false;

        return true;
      })
      .map((driver) => ({
        ...driver,
        isAvailableNow: isWithinWorkingHours(driver.workingHours),
      }))
      .sort((a, b) => {
        // Prioritize available drivers
        if (a.isAvailableNow && !b.isAvailableNow) return -1;
        if (!a.isAvailableNow && b.isAvailableNow) return 1;
        return 0;
      });
  }, [order, drivers]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDrivers = async () => {
      try {
        const driversSnapshot = await getDocs(collection(db, 'drivers'));
        const driversData = driversSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Driver[];
        setDrivers(driversData);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    fetchOrder();
    fetchDrivers();
  }, [orderId]);

  // Calculate route (only for non-crane orders with dropoff)
  useEffect(() => {
    if (!isLoaded || !order?.pickup || !order?.dropoff || order.serviceType === 'crane') return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: { lat: order.pickup.lat, lng: order.pickup.lng },
        destination: { lat: order.dropoff.lat, lng: order.dropoff.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, order]);

  // Populate edit form when order loads or edit mode changes
  useEffect(() => {
    if (order) {
      setEditForm({
        phone: order.phone || '',
        customerPrice: order.customerPrice || 0,
        driverPrice: order.driverPrice || 0,
        status: order.status || 'pending',
        notes: (order as Order & { notes?: string }).notes || '',
      });
    }
  }, [order]);

  // Handle edit form save
  const handleEditSave = async () => {
    if (!order) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        phone: editForm.phone,
        customerPrice: editForm.customerPrice,
        driverPrice: editForm.driverPrice,
        status: editForm.status,
        notes: editForm.notes,
      });
      setOrder({
        ...order,
        phone: editForm.phone,
        customerPrice: editForm.customerPrice,
        driverPrice: editForm.driverPrice,
        status: editForm.status,
      });
      setIsEditMode(false);
      // Remove edit query param from URL
      router.replace(`/admin/orders/${orderId}`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('შეკვეთის განახლება ვერ მოხერხდა');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    if (order) {
      setEditForm({
        phone: order.phone || '',
        customerPrice: order.customerPrice || 0,
        driverPrice: order.driverPrice || 0,
        status: order.status || 'pending',
        notes: (order as Order & { notes?: string }).notes || '',
      });
    }
    setIsEditMode(false);
    router.replace(`/admin/orders/${orderId}`);
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    if (!order) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      router.push('/admin/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('შეკვეთის წაშლა ვერ მოხერხდა');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDriverChange = async (driverId: string) => {
    if (!order) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { driverId });
      setOrder({ ...order, driverId });
    } catch (error) {
      console.error('Error updating driver:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!order) return '';

    if (order.serviceType === 'crane') {
      const addressMapLink = `https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`;

      const message = [
        '*ახალი შეკვეთა - ამწე ლიფტი*',
        '',
        `> მისამართი: ${order.pickup.address}`,
        addressMapLink,
        '',
        order.craneFloor ? `სართული: ${CRANE_FLOOR_LABELS[order.craneFloor].title}` : '',
        order.craneCargoType ? `ტვირთის ტიპი: ${CRANE_CARGO_LABELS[order.craneCargoType]}` : '',
        order.craneDuration ? `ხანგრძლივობა: ${CRANE_DURATION_LABELS[order.craneDuration]}` : '',
        '',
        `თქვენი: ${order.driverPrice} ლარი`,
        `კლიენტი: ${order.phone}`,
      ].filter(Boolean).join('\n');

      return encodeURIComponent(message);
    }

    const pickupMapLink = `https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`;
    const dropoffMapLink = order.dropoff ? `https://www.google.com/maps?q=${order.dropoff.lat},${order.dropoff.lng}` : '';

    const message = [
      '*ახალი შეკვეთა*',
      '',
      `> აყვანა: ${order.pickup.address}`,
      pickupMapLink,
      '',
      `> ჩაბარება: ${order.dropoff?.address || '-'}`,
      dropoffMapLink,
      '',
      `მანძილი: ${order.distance || 0} კმ`,
      `თქვენი: ${order.driverPrice} ლარი`,
      `კლიენტი: ${order.phone}`,
    ].join('\n');

    return encodeURIComponent(message);
  };

  // Format phone number for WhatsApp (must be international format without +)
  const formatPhoneForWhatsApp = (phone: string): string => {
    // Remove ALL non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with Georgian mobile prefix (5xx), add country code
    if (cleaned.startsWith('5') && cleaned.length === 9) {
      cleaned = '995' + cleaned;
    }

    // If 9 digits and doesn't start with 995, add it
    if (!cleaned.startsWith('995') && cleaned.length === 9) {
      cleaned = '995' + cleaned;
    }

    console.log('WhatsApp phone formatted:', phone, '->', cleaned);
    return cleaned;
  };

  const handleWhatsAppSend = () => {
    const selectedDriver = drivers.find((d) => d.id === order?.driverId);
    if (selectedDriver) {
      const phone = formatPhoneForWhatsApp(selectedDriver.phone);
      window.open(`https://wa.me/${phone}?text=${generateWhatsAppMessage()}`, '_blank');
    } else {
      // Open WhatsApp without specific number
      window.open(`https://wa.me/?text=${generateWhatsAppMessage()}`, '_blank');
    }
  };

  const handleCopyToClipboard = () => {
    if (!order) return;

    let text: string;

    if (order.serviceType === 'crane') {
      const addressMapLink = `https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`;

      text = [
        '*ახალი შეკვეთა - ამწე ლიფტი*',
        '',
        `> მისამართი: ${order.pickup.address}`,
        addressMapLink,
        '',
        order.craneFloor ? `სართული: ${CRANE_FLOOR_LABELS[order.craneFloor].title}` : '',
        order.craneCargoType ? `ტვირთის ტიპი: ${CRANE_CARGO_LABELS[order.craneCargoType]}` : '',
        order.craneDuration ? `ხანგრძლივობა: ${CRANE_DURATION_LABELS[order.craneDuration]}` : '',
        '',
        `თქვენი: ${order.driverPrice} ლარი`,
        `კლიენტი: ${order.phone}`,
      ].filter(Boolean).join('\n');
    } else {
      const pickupMapLink = `https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`;
      const dropoffMapLink = order.dropoff ? `https://www.google.com/maps?q=${order.dropoff.lat},${order.dropoff.lng}` : '';

      text = [
        '*ახალი შეკვეთა*',
        '',
        `> აყვანა: ${order.pickup.address}`,
        pickupMapLink,
        '',
        `> ჩაბარება: ${order.dropoff?.address || '-'}`,
        dropoffMapLink,
        '',
        `მანძილი: ${order.distance || 0} კმ`,
        `თქვენი: ${order.driverPrice} ლარი`,
        `კლიენტი: ${order.phone}`,
      ].join('\n');
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">შეკვეთა ვერ მოიძებნა</p>
        <Link href="/admin/orders" className="text-blue-400 hover:underline mt-2 inline-block">
          უკან დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">
                შეკვეთა #{order.id.slice(-6).toUpperCase()}
              </h1>
              {isEditMode && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                  რედაქტირება
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Edit/Delete/Save/Cancel buttons */}
        <div className="flex items-center space-x-2 ml-auto sm:ml-0">
          {isEditMode ? (
            <>
              <button
                onClick={handleEditCancel}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-[#475569] text-slate-300 rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">გაუქმება</span>
              </button>
              <button
                onClick={handleEditSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">შენახვა</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">რედაქტირება</span>
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">წაშლა</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Form */}
      {isEditMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="font-semibold text-blue-400 mb-4">შეკვეთის რედაქტირება</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                ტელეფონი
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white"
              />
            </div>

            {/* Customer Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                კლიენტის ფასი (₾)
              </label>
              <input
                type="number"
                value={editForm.customerPrice}
                onChange={(e) => setEditForm({ ...editForm, customerPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white"
              />
            </div>

            {/* Driver Price */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                მძღოლის ფასი (₾)
              </label>
              <input
                type="number"
                value={editForm.driverPrice}
                onChange={(e) => setEditForm({ ...editForm, driverPrice: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                სტატუსი
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-4 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                შენიშვნები
              </label>
              <input
                type="text"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="დამატებითი შენიშვნები..."
                className="w-full px-4 py-2 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Profit calculation */}
          <div className="mt-4 pt-4 border-t border-blue-500/30">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-400">მოგება:</span>
              <span className={`font-bold ${editForm.customerPrice - editForm.driverPrice >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {editForm.customerPrice - editForm.driverPrice}₾
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          {isLoaded && order.pickup && order.pickup.lat && order.pickup.lng ? (
            <div className="bg-[#1E293B] rounded-xl border border-[#475569] overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: order.pickup.lat, lng: order.pickup.lng }}
                zoom={order.serviceType === 'crane' ? 15 : 12}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {/* Route line only - for non-crane orders with dropoff */}
                {directions && order.serviceType !== 'crane' && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#3b82f6',
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}
                {/* Pickup marker */}
                <Marker
                  position={{ lat: order.pickup.lat, lng: order.pickup.lng }}
                  label={order.serviceType === 'crane' ? undefined : { text: 'A', color: 'white', fontWeight: 'bold' }}
                />
                {/* Dropoff marker - only for non-crane orders */}
                {order.serviceType !== 'crane' && order.dropoff?.lat && order.dropoff?.lng && (
                  <Marker
                    position={{ lat: order.dropoff.lat, lng: order.dropoff.lng }}
                    label={{ text: 'B', color: 'white', fontWeight: 'bold' }}
                  />
                )}
              </GoogleMap>
            </div>
          ) : (
            <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-6 text-center">
              <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">კოორდინატები არ არის შენახული</p>
            </div>
          )}

          {/* Locations */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#475569] space-y-4">
            <h3 className="font-semibold text-white">
              {order.serviceType === 'crane' ? 'მისამართი' : 'მისამართები'}
            </h3>

            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                order.serviceType === 'crane' ? 'bg-emerald-500/20' : 'bg-green-500/20'
              }`}>
                <MapPin className={`w-4 h-4 ${order.serviceType === 'crane' ? 'text-emerald-400' : 'text-green-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">
                  {order.serviceType === 'crane' ? 'მომსახურების მისამართი' : 'აყვანის ადგილი'}
                </p>
                <p className="text-white">{order.pickup?.address || '-'}</p>
                {order.pickup?.lat && order.pickup?.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-1 text-sm mt-1 ${
                      order.serviceType === 'crane'
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-green-400 hover:text-green-300'
                    }`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>გახსენი რუკაზე</span>
                  </a>
                )}
              </div>
            </div>

            {/* Dropoff - only for non-crane orders */}
            {order.serviceType !== 'crane' && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400">ჩაბარების ადგილი</p>
                  <p className="text-white">{order.dropoff?.address || '-'}</p>
                  {order.dropoff?.lat && order.dropoff?.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${order.dropoff.lat},${order.dropoff.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>გახსენი რუკაზე</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Distance - only for non-crane orders */}
            {order.serviceType !== 'crane' && order.distance && (
              <div className="pt-4 border-t border-[#475569]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">მანძილი:</span>
                  <span className="font-semibold text-white">{order.distance} კმ</span>
                </div>
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#475569]">
            <h3 className="font-semibold text-white mb-4">სერვისის დეტალები</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  order.serviceType === 'cargo' ? 'bg-blue-500/20' :
                  order.serviceType === 'crane' ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                }`}>
                  {order.serviceType === 'cargo' ? (
                    <Package className="w-5 h-5 text-blue-400" />
                  ) : order.serviceType === 'crane' ? (
                    <Package className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Truck className="w-5 h-5 text-orange-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-400">სერვისი</p>
                  <p className="font-medium text-white">
                    {order.serviceType === 'cargo' ? 'ტვირთი' :
                     order.serviceType === 'crane' ? 'ამწე ლიფტი' : 'ევაკუატორი'}
                  </p>
                </div>
              </div>

              {/* For cargo - show subType */}
              {order.serviceType === 'cargo' && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-500/20">
                    <Truck className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">ტიპი</p>
                    <p className="font-medium text-white">{order.subType}</p>
                  </div>
                </div>
              )}

              {/* For evacuator - show customer vehicle type */}
              {order.serviceType === 'evacuator' && order.customerVehicleType && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Truck className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">ავტომობილი</p>
                    <p className="font-medium text-white">
                      {CUSTOMER_VEHICLE_LABELS[order.customerVehicleType].title}
                    </p>
                  </div>
                </div>
              )}

              {/* For evacuator - show service vehicle type */}
              {order.serviceType === 'evacuator' && order.serviceVehicleType && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Truck className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">საჭირო ევაკუატორი</p>
                    <p className="font-medium text-white">
                      {SERVICE_VEHICLE_LABELS[order.serviceVehicleType]}
                    </p>
                  </div>
                </div>
              )}

              {/* For crane - show floor, cargo type, and duration */}
              {order.serviceType === 'crane' && order.craneFloor && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Package className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">სართული</p>
                    <p className="font-medium text-white">
                      {CRANE_FLOOR_LABELS[order.craneFloor].title}
                    </p>
                  </div>
                </div>
              )}

              {order.serviceType === 'crane' && order.craneCargoType && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Package className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">ტვირთის ტიპი</p>
                    <p className="font-medium text-white">
                      {CRANE_CARGO_LABELS[order.craneCargoType]}
                    </p>
                  </div>
                </div>
              )}

              {order.serviceType === 'crane' && order.craneDuration && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">ხანგრძლივობა</p>
                    <p className="font-medium text-white">
                      {CRANE_DURATION_LABELS[order.craneDuration]}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-500/20">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">ტელეფონი</p>
                  <a
                    href={`tel:${order.phone}`}
                    className="font-medium text-blue-400 hover:underline"
                  >
                    {order.phone}
                  </a>
                </div>
              </div>

              {order.scheduledTime && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-500/20">
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">დაგეგმილი დრო</p>
                    <p className="font-medium text-white">
                      {formatDate(order.scheduledTime)}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {order.paymentMethod && (
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${order.paymentMethod === 'cash' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                    {order.paymentMethod === 'cash' ? (
                      <Banknote className="w-5 h-5 text-green-400" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">გადახდის მეთოდი</p>
                    <p className="font-medium text-white">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Evacuator questionnaire answers */}
            {order.serviceType === 'evacuator' && order.evacuatorAnswers && (
              <div className="mt-4 pt-4 border-t border-[#475569]">
                <p className="text-sm font-medium text-slate-300 mb-2">კითხვარის პასუხები:</p>
                <div className="space-y-1 text-sm">
                  {order.evacuatorAnswers.wheelLocked !== undefined && (
                    <p className="text-slate-400">
                      საბურავი დაბლოკილია: {order.evacuatorAnswers.wheelLocked ? 'დიახ' : 'არა'}
                    </p>
                  )}
                  {order.evacuatorAnswers.steeringLocked !== undefined && (
                    <p className="text-slate-400">
                      საჭე დაბლოკილია: {order.evacuatorAnswers.steeringLocked ? 'დიახ' : 'არა'}
                    </p>
                  )}
                  {order.evacuatorAnswers.goesNeutral !== undefined && (
                    <p className="text-slate-400">
                      ვარდება ნეიტრალში: {order.evacuatorAnswers.goesNeutral ? 'დიახ' : 'არა'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Info */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#475569]">
            <h3 className="font-semibold text-white mb-4">ფინანსები</h3>

            {order.serviceType === 'crane' ? (
              // Simple pricing display for crane orders
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">კლიენტი იხდის:</span>
                  <span className="text-xl font-bold text-white">
                    {formatPrice(order.customerPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">მძღოლის წილი:</span>
                  <span className="font-semibold text-slate-300">
                    {formatPrice(order.driverPrice)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#475569] flex justify-between items-center">
                  <span className="text-slate-400">მოგება:</span>
                  <span className="text-lg font-bold text-green-400">
                    {formatPrice(order.customerPrice - order.driverPrice)}
                  </span>
                </div>
                {order.craneFloor && CRANE_FLOOR_LABELS[order.craneFloor].surcharge > 0 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    სართულის დამატება: +{CRANE_FLOOR_LABELS[order.craneFloor].surcharge}₾
                  </p>
                )}
              </div>
            ) : (
              (() => {
                // Calculate detailed pricing based on order type (cargo/evacuator)
                const isServiceVehicle = order.serviceType === 'evacuator' && order.serviceVehicleType;
                const subType = isServiceVehicle ? order.serviceVehicleType! : order.subType as CargoSize;
                const detailedPrice = calculateDetailedPrice(
                  order.serviceType,
                  subType,
                  order.distance || 0,
                  !!isServiceVehicle
                );
                const baseKm = settings.tbilisiFixedZoneKm || TBILISI_FIXED_ZONE_KM;

                return (
                  <div className="space-y-3">
                    {/* Show breakdown for orders over base km */}
                    {detailedPrice.isOverBase ? (
                      <>
                        {/* Base price */}
                        <div className="p-3 bg-[#334155] rounded-lg space-y-2">
                          <p className="text-xs font-medium text-slate-400 uppercase">ფიქსირებული ({baseKm} კმ)</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">კლიენტი:</span>
                            <span className="font-medium text-white">{formatPrice(detailedPrice.baseCustomerPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">მძღოლი:</span>
                            <span className="font-medium text-slate-300">{formatPrice(detailedPrice.baseDriverPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">მოგება:</span>
                            <span className="font-medium text-green-400">{formatPrice(detailedPrice.baseProfit)}</span>
                          </div>
                        </div>

                        {/* Extra km charges */}
                        <div className="p-3 bg-blue-500/10 rounded-lg space-y-2">
                          <p className="text-xs font-medium text-blue-400 uppercase">დამატებითი +{Math.round(detailedPrice.extraKm)} კმ</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">კლიენტი:</span>
                            <span className="font-medium text-white">+{formatPrice(detailedPrice.extraCustomerCharge)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">მძღოლი:</span>
                            <span className="font-medium text-slate-300">+{formatPrice(detailedPrice.extraDriverCharge)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">მოგება:</span>
                            <span className="font-medium text-green-400">+{formatPrice(detailedPrice.extraProfit)}</span>
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="pt-3 border-t border-[#475569] space-y-2">
                          <p className="text-xs font-medium text-slate-400 uppercase">სულ ({order.distance || 0} კმ)</p>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">კლიენტი იხდის:</span>
                            <span className="text-xl font-bold text-white">
                              {formatPrice(order.customerPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">მძღოლის წილი:</span>
                            <span className="font-semibold text-slate-300">
                              {formatPrice(order.driverPrice)}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-[#475569] flex justify-between items-center">
                            <span className="text-slate-400">სულ მოგება:</span>
                            <span className="text-lg font-bold text-green-400">
                              {formatPrice(order.customerPrice - order.driverPrice)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Simple display for orders within base km */}
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">კლიენტი იხდის:</span>
                          <span className="text-xl font-bold text-white">
                            {formatPrice(order.customerPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">მძღოლის წილი:</span>
                          <span className="font-semibold text-slate-300">
                            {formatPrice(order.driverPrice)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-[#475569] flex justify-between items-center">
                          <span className="text-slate-400">მოგება:</span>
                          <span className="text-lg font-bold text-green-400">
                            {formatPrice(order.customerPrice - order.driverPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 text-center pt-2">
                          ფიქსირებული ზონაში ({order.distance || 0} კმ / {baseKm} კმ)
                        </p>
                      </>
                    )}
                  </div>
                );
              })()
            )}
          </div>

          {/* Status */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#475569]">
            <h3 className="font-semibold text-white mb-4">სტატუსი</h3>

            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Assignment */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#475569]">
            <h3 className="font-semibold text-white mb-4">მძღოლის მინიჭება</h3>

            {/* Show matching drivers for evacuator orders */}
            {order.serviceType === 'evacuator' && order.serviceVehicleType && matchingEvacuatorDrivers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-orange-400" />
                  რეკომენდებული მძღოლები ({matchingEvacuatorDrivers.length})
                </p>
                <div className="space-y-2">
                  {matchingEvacuatorDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleDriverChange(driver.id)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        order.driverId === driver.id
                          ? 'border-orange-500 bg-orange-500/20'
                          : 'border-[#475569] hover:border-orange-500/50 hover:bg-orange-500/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.isAvailableNow ? 'bg-green-500/20' : 'bg-slate-500/20'
                        }`}>
                          <User className={`w-5 h-5 ${
                            driver.isAvailableNow ? 'text-green-400' : 'text-slate-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">{driver.name}</p>
                          <p className="text-sm text-slate-400">{driver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {driver.isAvailableNow ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            ხელმისაწვდომი
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {driver.workingHours?.start}-{driver.workingHours?.end}
                          </span>
                        )}
                        {order.driverId === driver.id && (
                          <Check className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no matching drivers for evacuator */}
            {order.serviceType === 'evacuator' && order.serviceVehicleType && matchingEvacuatorDrivers.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  {SERVICE_VEHICLE_LABELS[order.serviceVehicleType]} ტიპის მძღოლი ვერ მოიძებნა
                </p>
              </div>
            )}

            {/* Show matching drivers for cargo orders */}
            {order.serviceType === 'cargo' && order.subType && matchingCargoDrivers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-blue-400" />
                  რეკომენდებული მძღოლები ({matchingCargoDrivers.length})
                </p>
                <div className="space-y-2">
                  {matchingCargoDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleDriverChange(driver.id)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        order.driverId === driver.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-[#475569] hover:border-blue-500/50 hover:bg-blue-500/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.isAvailableNow ? 'bg-green-500/20' : 'bg-slate-500/20'
                        }`}>
                          <User className={`w-5 h-5 ${
                            driver.isAvailableNow ? 'text-green-400' : 'text-slate-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">{driver.name}</p>
                          <p className="text-sm text-slate-400">{driver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {driver.isAvailableNow ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            ხელმისაწვდომი
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {driver.workingHours?.start}-{driver.workingHours?.end}
                          </span>
                        )}
                        {order.driverId === driver.id && (
                          <Check className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no matching drivers for cargo */}
            {order.serviceType === 'cargo' && order.subType && matchingCargoDrivers.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  {order.subType} ზომის ტვირთის მძღოლი ვერ მოიძებნა
                </p>
              </div>
            )}

            {/* Show matching drivers for crane orders */}
            {order.serviceType === 'crane' && matchingCraneDrivers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-emerald-400" />
                  რეკომენდებული მძღოლები ({matchingCraneDrivers.length})
                </p>
                <div className="space-y-2">
                  {matchingCraneDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleDriverChange(driver.id)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        order.driverId === driver.id
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-[#475569] hover:border-emerald-500/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.isAvailableNow ? 'bg-green-500/20' : 'bg-slate-500/20'
                        }`}>
                          <User className={`w-5 h-5 ${
                            driver.isAvailableNow ? 'text-green-400' : 'text-slate-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">{driver.name}</p>
                          <p className="text-sm text-slate-400">{driver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {driver.isAvailableNow ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                            ხელმისაწვდომი
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {driver.workingHours?.start}-{driver.workingHours?.end}
                          </span>
                        )}
                        {order.driverId === driver.id && (
                          <Check className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no matching drivers for crane */}
            {order.serviceType === 'crane' && matchingCraneDrivers.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-400">
                  ამწე მძღოლი ვერ მოიძებნა
                </p>
              </div>
            )}

            {/* All drivers dropdown */}
            <p className="text-sm text-slate-400 mb-2">ან აირჩიეთ სიიდან:</p>
            <select
              value={order.driverId || ''}
              onChange={(e) => handleDriverChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-[#475569] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-[#334155] text-white"
            >
              <option value="">აირჩიეთ მძღოლი</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.phone} {driver.serviceVehicleType ? `(${SERVICE_VEHICLE_LABELS[driver.serviceVehicleType]})` : driver.vehicleType ? `(${driver.vehicleType})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="bg-[#1E293B] rounded-xl p-6 border border-[#475569] space-y-3">
            <h3 className="font-semibold text-white mb-4">მოქმედებები</h3>

            <button
              onClick={handleWhatsAppSend}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp-ით გაგზავნა</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-[#475569] hover:bg-[#334155] text-slate-300 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">დაკოპირებულია!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>კოპირება</span>
                </>
              )}
            </button>

            <a
              href={`tel:${order.phone}`}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>დარეკვა</span>
            </a>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
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
                #{order.id.slice(-6).toUpperCase()}
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
