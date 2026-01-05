'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
import { ServiceVehicleType, CustomerVehicleType, EvacuatorAnswers, SERVICE_VEHICLE_LABELS, CUSTOMER_VEHICLE_LABELS } from '@/lib/types';
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
} from 'lucide-react';

interface Order {
  id: string;
  serviceType: 'cargo' | 'evacuator';
  subType: string;
  // New evacuator fields
  customerVehicleType?: CustomerVehicleType;
  serviceVehicleType?: ServiceVehicleType;
  evacuatorAnswers?: EvacuatorAnswers;
  pickup: { address: string; lat: number; lng: number };
  dropoff: { address: string; lat: number; lng: number };
  distance: number;
  customerPrice: number;
  driverPrice: number;
  phone: string;
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
  baseLocation?: string;
  workingDays?: string[];
  workingHours?: { start: string; end: string };
}

const statusOptions = [
  { value: 'pending', label: 'მოლოდინში', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'accepted', label: 'მიღებული', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'მიმდინარე', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'დასრულებული', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'გაუქმებული', color: 'bg-red-100 text-red-700' },
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded } = useGoogleMaps();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Calculate route
  useEffect(() => {
    if (!isLoaded || !order?.pickup || !order?.dropoff) return;

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

    const pickupMapLink = `https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`;
    const dropoffMapLink = `https://www.google.com/maps?q=${order.dropoff.lat},${order.dropoff.lng}`;

    const message = [
      '*ახალი შეკვეთა*',
      '',
      `> აყვანა: ${order.pickup.address}`,
      pickupMapLink,
      '',
      `> ჩაბარება: ${order.dropoff.address}`,
      dropoffMapLink,
      '',
      `მანძილი: ${order.distance} კმ`,
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

    const pickupMapLink = `https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`;
    const dropoffMapLink = `https://www.google.com/maps?q=${order.dropoff.lat},${order.dropoff.lng}`;

    const text = [
      '*ახალი შეკვეთა*',
      '',
      `> აყვანა: ${order.pickup.address}`,
      pickupMapLink,
      '',
      `> ჩაბარება: ${order.dropoff.address}`,
      dropoffMapLink,
      '',
      `მანძილი: ${order.distance} კმ`,
      `თქვენი: ${order.driverPrice} ლარი`,
      `კლიენტი: ${order.phone}`,
    ].join('\n');

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
        <p className="text-gray-500">შეკვეთა ვერ მოიძებნა</p>
        <Link href="/admin/orders" className="text-blue-600 hover:underline mt-2 inline-block">
          უკან დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              შეკვეთა #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          {isLoaded && order.pickup && order.dropoff &&
           order.pickup.lat && order.pickup.lng &&
           order.dropoff.lat && order.dropoff.lng ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: order.pickup.lat, lng: order.pickup.lng }}
                zoom={12}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {/* Route line only - suppressMarkers to avoid road-snapped positions */}
                {directions && (
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
                {/* Custom markers at EXACT saved coordinates */}
                <Marker
                  position={{ lat: order.pickup.lat, lng: order.pickup.lng }}
                  label={{ text: 'A', color: 'white', fontWeight: 'bold' }}
                />
                <Marker
                  position={{ lat: order.dropoff.lat, lng: order.dropoff.lng }}
                  label={{ text: 'B', color: 'white', fontWeight: 'bold' }}
                />
              </GoogleMap>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">კოორდინატები არ არის შენახული</p>
            </div>
          )}

          {/* Locations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-800">მისამართები</h3>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">აყვანის ადგილი</p>
                <p className="text-gray-800">{order.pickup?.address || '-'}</p>
                {order.pickup?.lat && order.pickup?.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${order.pickup.lat},${order.pickup.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-green-600 hover:text-green-700 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>გახსენი რუკაზე</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">ჩაბარების ადგილი</p>
                <p className="text-gray-800">{order.dropoff?.address || '-'}</p>
                {order.dropoff?.lat && order.dropoff?.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${order.dropoff.lat},${order.dropoff.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>გახსენი რუკაზე</span>
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">მანძილი:</span>
                <span className="font-semibold text-gray-800">{order.distance} კმ</span>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">სერვისის დეტალები</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${order.serviceType === 'cargo' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                  {order.serviceType === 'cargo' ? (
                    <Package className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Truck className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">სერვისი</p>
                  <p className="font-medium text-gray-800">
                    {order.serviceType === 'cargo' ? 'ტვირთი' : 'ევაკუატორი'}
                  </p>
                </div>
              </div>

              {/* For cargo - show subType, for evacuator - show customer vehicle type */}
              {order.serviceType === 'cargo' ? (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Truck className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ტიპი</p>
                    <p className="font-medium text-gray-800">{order.subType}</p>
                  </div>
                </div>
              ) : (
                <>
                  {order.customerVehicleType && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Truck className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ავტომობილი</p>
                        <p className="font-medium text-gray-800">
                          {CUSTOMER_VEHICLE_LABELS[order.customerVehicleType].title}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* For evacuator - show service vehicle type */}
              {order.serviceType === 'evacuator' && order.serviceVehicleType && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Truck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">საჭირო ევაკუატორი</p>
                    <p className="font-medium text-gray-800">
                      {SERVICE_VEHICLE_LABELS[order.serviceVehicleType]}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ტელეფონი</p>
                  <a
                    href={`tel:${order.phone}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {order.phone}
                  </a>
                </div>
              </div>

              {order.scheduledTime && (
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">დაგეგმილი დრო</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(order.scheduledTime)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Evacuator questionnaire answers */}
            {order.serviceType === 'evacuator' && order.evacuatorAnswers && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">კითხვარის პასუხები:</p>
                <div className="space-y-1 text-sm">
                  {order.evacuatorAnswers.wheelLocked !== undefined && (
                    <p className="text-gray-600">
                      საბურავი დაბლოკილია: {order.evacuatorAnswers.wheelLocked ? 'დიახ' : 'არა'}
                    </p>
                  )}
                  {order.evacuatorAnswers.steeringLocked !== undefined && (
                    <p className="text-gray-600">
                      საჭე დაბლოკილია: {order.evacuatorAnswers.steeringLocked ? 'დიახ' : 'არა'}
                    </p>
                  )}
                  {order.evacuatorAnswers.goesNeutral !== undefined && (
                    <p className="text-gray-600">
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">ფინანსები</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">კლიენტი იხდის:</span>
                <span className="text-xl font-bold text-gray-800">
                  {formatPrice(order.customerPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">მძღოლის წილი:</span>
                <span className="font-semibold text-gray-700">
                  {formatPrice(order.driverPrice)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-500">მოგება:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(order.customerPrice - order.driverPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">სტატუსი</h3>

            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Driver Assignment */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">მძღოლის მინიჭება</h3>

            {/* Show matching drivers for evacuator orders */}
            {order.serviceType === 'evacuator' && order.serviceVehicleType && matchingEvacuatorDrivers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-orange-500" />
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
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.isAvailableNow ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <User className={`w-5 h-5 ${
                            driver.isAvailableNow ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {driver.isAvailableNow ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ხელმისაწვდომი
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {driver.workingHours?.start}-{driver.workingHours?.end}
                          </span>
                        )}
                        {order.driverId === driver.id && (
                          <Check className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no matching drivers for evacuator */}
            {order.serviceType === 'evacuator' && order.serviceVehicleType && matchingEvacuatorDrivers.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  {SERVICE_VEHICLE_LABELS[order.serviceVehicleType]} ტიპის მძღოლი ვერ მოიძებნა
                </p>
              </div>
            )}

            {/* Show matching drivers for cargo orders */}
            {order.serviceType === 'cargo' && order.subType && matchingCargoDrivers.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1 text-blue-500" />
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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          driver.isAvailableNow ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <User className={`w-5 h-5 ${
                            driver.isAvailableNow ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{driver.name}</p>
                          <p className="text-sm text-gray-500">{driver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {driver.isAvailableNow ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ხელმისაწვდომი
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {driver.workingHours?.start}-{driver.workingHours?.end}
                          </span>
                        )}
                        {order.driverId === driver.id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no matching drivers for cargo */}
            {order.serviceType === 'cargo' && order.subType && matchingCargoDrivers.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  {order.subType} ზომის ტვირთის მძღოლი ვერ მოიძებნა
                </p>
              </div>
            )}

            {/* All drivers dropdown */}
            <p className="text-sm text-gray-500 mb-2">ან აირჩიეთ სიიდან:</p>
            <select
              value={order.driverId || ''}
              onChange={(e) => handleDriverChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-4">მოქმედებები</h3>

            <button
              onClick={handleWhatsAppSend}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp-ით გაგზავნა</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600">დაკოპირებულია!</span>
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
    </div>
  );
}
