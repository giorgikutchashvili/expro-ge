'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatPrice } from '@/lib/utils';
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
} from 'lucide-react';

interface Order {
  id: string;
  serviceType: 'cargo' | 'evacuator';
  subType: string;
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
  vehicleType: string;
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
    return encodeURIComponent(
      `🚚 ახალი შეკვეთა\n\n` +
      `📍 აყვანა: ${order.pickup.address}\n` +
      `📍 ჩაბარება: ${order.dropoff.address}\n` +
      `📏 მანძილი: ${order.distance} კმ\n` +
      `💰 თქვენი: ${order.driverPrice}₾\n` +
      `📞 კლიენტი: ${order.phone}`
    );
  };

  const handleWhatsAppSend = () => {
    const selectedDriver = drivers.find((d) => d.id === order?.driverId);
    if (selectedDriver) {
      // Format phone for WhatsApp (remove + and spaces)
      const phone = selectedDriver.phone.replace(/[\s+]/g, '');
      window.open(`https://wa.me/${phone}?text=${generateWhatsAppMessage()}`, '_blank');
    } else {
      // Open WhatsApp without specific number
      window.open(`https://wa.me/?text=${generateWhatsAppMessage()}`, '_blank');
    }
  };

  const handleCopyToClipboard = () => {
    if (!order) return;
    const text =
      `🚚 ახალი შეკვეთა\n\n` +
      `📍 აყვანა: ${order.pickup.address}\n` +
      `📍 ჩაბარება: ${order.dropoff.address}\n` +
      `📏 მანძილი: ${order.distance} კმ\n` +
      `💰 თქვენი: ${order.driverPrice}₾\n` +
      `📞 კლიენტი: ${order.phone}`;

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
          {isLoaded && order.pickup && order.dropoff && (
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
                {directions ? (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: '#3b82f6',
                        strokeWeight: 5,
                      },
                    }}
                  />
                ) : (
                  <>
                    <Marker
                      position={{ lat: order.pickup.lat, lng: order.pickup.lng }}
                      label={{ text: 'A', color: 'white', fontWeight: 'bold' }}
                    />
                    <Marker
                      position={{ lat: order.dropoff.lat, lng: order.dropoff.lng }}
                      label={{ text: 'B', color: 'white', fontWeight: 'bold' }}
                    />
                  </>
                )}
              </GoogleMap>
            </div>
          )}

          {/* Locations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-800">მისამართები</h3>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">აყვანის ადგილი</p>
                <p className="text-gray-800">{order.pickup?.address || '-'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">ჩაბარების ადგილი</p>
                <p className="text-gray-800">{order.dropoff?.address || '-'}</p>
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

              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Truck className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ტიპი</p>
                  <p className="font-medium text-gray-800">{order.subType}</p>
                </div>
              </div>

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

            <select
              value={order.driverId || ''}
              onChange={(e) => handleDriverChange(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">აირჩიეთ მძღოლი</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.phone}
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
