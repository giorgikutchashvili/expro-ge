'use client';

import { Order } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface OrderConfirmationProps {
  order: Order;
  onNewOrder: () => void;
}

const serviceTypeLabels: Record<string, string> = {
  cargo: 'ტვირთის გადაზიდვა',
  evacuator: 'ევაკუატორი',
};

const subTypeLabels: Record<string, string> = {
  S: 'S - პატარა',
  M: 'M - საშუალო',
  L: 'L - დიდი',
  XL: 'XL - ძალიან დიდი',
  CONSTRUCTION: 'სამშენებლო',
  LIGHT: 'მსუბუქი ავტო',
  JEEP: 'ჯიპი / SUV',
  MINIBUS: 'მიკროავტობუსი',
  SPIDER: 'სპაიდერი',
  OVERSIZED: 'დიდგაბარიტიანი',
};

export default function OrderConfirmation({ order, onNewOrder }: OrderConfirmationProps) {
  // Format phone for links (remove spaces and ensure proper format)
  const cleanPhone = order.phone.replace(/\s/g, '');
  const whatsappPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone.startsWith('5') ? `995${cleanPhone}` : cleanPhone;
  const telPhone = cleanPhone.startsWith('+') ? cleanPhone : cleanPhone.startsWith('5') ? `+995${cleanPhone}` : `+${cleanPhone}`;

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      {/* Success Animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scaleIn">
            <svg
              className="w-12 h-12 text-green-500 animate-checkmark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-25" />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-6 text-center">
          შეკვეთა მიღებულია!
        </h2>
        <p className="text-gray-500 mt-2 text-center">
          მალე დაგიკავშირდებით
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h3 className="text-white font-semibold">შეკვეთის დეტალები</h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Service Type */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">სერვისი</p>
              <p className="font-medium text-gray-800">
                {serviceTypeLabels[order.serviceType]} - {subTypeLabels[order.subType]}
              </p>
            </div>
          </div>

          {/* Pickup */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div>
              <p className="text-sm text-gray-500">აყვანის ადგილი</p>
              <p className="font-medium text-gray-800">{order.pickup.address}</p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ჩაბარების ადგილი</p>
              <p className="font-medium text-gray-800">{order.dropoff.address}</p>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">მანძილი</p>
              <p className="font-medium text-gray-800">{order.distance} კმ</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">ფასი</p>
              <p className="text-xl font-bold text-gray-800">{formatPrice(order.customerPrice)}</p>
            </div>
          </div>

          {/* Scheduled Time */}
          {order.scheduledTime && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">დაგეგმილი დრო</p>
                <p className="font-medium text-gray-800">{formatDate(order.scheduledTime)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="flex space-x-3 mb-4">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4
                    bg-green-500 hover:bg-green-600 text-white rounded-xl
                    transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-medium">WhatsApp</span>
        </a>

        {/* Call Button */}
        <a
          href={`tel:${telPhone}`}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4
                    bg-blue-500 hover:bg-blue-600 text-white rounded-xl
                    transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="font-medium">დარეკვა</span>
        </a>
      </div>

      {/* New Order Button */}
      <button
        onClick={onNewOrder}
        className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl
                  font-medium transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>ახალი შეკვეთა</span>
      </button>

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            stroke-dashoffset: 24;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-checkmark {
          stroke-dasharray: 24;
          animation: checkmark 0.5s ease-out 0.3s forwards;
          stroke-dashoffset: 24;
        }
      `}</style>
    </div>
  );
}
