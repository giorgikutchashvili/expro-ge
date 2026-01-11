'use client';

import { useState } from 'react';
import { Order, PAYMENT_METHOD_LABELS, CRANE_FLOOR_LABELS, CRANE_CARGO_LABELS, CRANE_DURATION_LABELS } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

interface OrderConfirmationProps {
  order: Order;
  onNewOrder: () => void;
}

const BANK_DETAILS = {
  tbc: {
    name: 'თიბისი ბანკი',
    iban: 'GE29TB7692945061453013',
    receiver: 'EXPRO LLC',
    color: '#00A3E0',
  },
  bog: {
    name: 'საქართველოს ბანკი',
    iban: 'GE84BG0000000548795624',
    receiver: 'EXPRO LLC',
    color: '#F37021',
  },
};

const serviceTypeLabels: Record<string, string> = {
  cargo: 'ტვირთის გადაზიდვა',
  evacuator: 'ევაკუატორი',
  crane: 'ამწე ლიფტი',
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
  ONE_TIME: 'ერთჯერადი',
  HOURLY: 'საათობრივი',
  FULL_DAY: 'მთლიანი დღე',
};

export default function OrderConfirmation({ order, onNewOrder }: OrderConfirmationProps) {
  const [copiedBank, setCopiedBank] = useState<'tbc' | 'bog' | null>(null);

  const handleCopyIban = async (bank: 'tbc' | 'bog') => {
    try {
      await navigator.clipboard.writeText(BANK_DETAILS[bank].iban);
      setCopiedBank(bank);
      setTimeout(() => setCopiedBank(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Company contact info
  const companyPhone = '995555233344';
  const companyTelPhone = '+995555233344';

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      {/* Success Animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center animate-scaleIn">
            <svg
              className="w-12 h-12 text-green-400 animate-checkmark"
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
          <div className="absolute inset-0 w-24 h-24 bg-green-500 rounded-full animate-ping opacity-25" />
        </div>

        <h2 className="text-2xl font-bold text-[#F8FAFC] mt-6 text-center">
          შეკვეთა მიღებულია!
        </h2>
        <p className="text-[#94A3B8] mt-2 text-center">
          მალე დაგიკავშირდებით
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-[#1E293B] rounded-xl shadow-md overflow-hidden mb-6 border border-[#475569]">
        <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] px-6 py-4">
          <h3 className="text-white font-semibold">შეკვეთის დეტალები</h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Service Type */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">სერვისი</p>
              <p className="font-medium text-[#F8FAFC]">
                {serviceTypeLabels[order.serviceType]} - {subTypeLabels[order.subType] || order.subType}
              </p>
            </div>
          </div>

          {/* Address / Pickup */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">
                {order.serviceType === 'crane' ? 'მისამართი' : 'აყვანის ადგილი'}
              </p>
              <p className="font-medium text-[#F8FAFC]">{order.pickup.address}</p>
            </div>
          </div>

          {/* Crane specific fields */}
          {order.serviceType === 'crane' && order.craneFloor && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 3v18" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">სართული</p>
                <p className="font-medium text-[#F8FAFC]">{CRANE_FLOOR_LABELS[order.craneFloor].title}</p>
              </div>
            </div>
          )}

          {order.serviceType === 'crane' && order.craneCargoType && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="8" width="18" height="8" rx="1" />
                  <path d="M5 16v3" />
                  <path d="M19 16v3" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">ტვირთის ტიპი</p>
                <p className="font-medium text-[#F8FAFC]">{CRANE_CARGO_LABELS[order.craneCargoType]}</p>
              </div>
            </div>
          )}

          {order.serviceType === 'crane' && order.craneDuration && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">ხანგრძლივობა</p>
                <p className="font-medium text-[#F8FAFC]">{CRANE_DURATION_LABELS[order.craneDuration]}</p>
              </div>
            </div>
          )}

          {/* Dropoff - only for non-crane services */}
          {order.dropoff && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">ჩაბარების ადგილი</p>
                <p className="font-medium text-[#F8FAFC]">{order.dropoff.address}</p>
              </div>
            </div>
          )}

          {/* Distance - only for non-crane services */}
          {order.distance && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">მანძილი</p>
                <p className="font-medium text-[#F8FAFC]">{order.distance} კმ</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {order.paymentMethod && (
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                order.paymentMethod === 'cash' ? 'bg-green-500/20' : 'bg-blue-500/20'
              }`}>
                {order.paymentMethod === 'cash' ? (
                  <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">გადახდა</p>
                <p className="font-medium text-[#F8FAFC]">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">ფასი</p>
              <p className="text-xl font-bold text-[#60A5FA]">{formatPrice(order.customerPrice)}</p>
            </div>
          </div>

          {/* Scheduled Time */}
          {order.scheduledTime && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">დაგეგმილი დრო</p>
                <p className="font-medium text-[#F8FAFC]">{formatDate(order.scheduledTime)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bank transfer reminder and bank accounts */}
        {order.paymentMethod === 'card' && (
          <div className="px-6 pb-6 space-y-4">
            <div className="p-4 bg-[#0F172A] rounded-lg border border-[#3B82F6]">
              <p className="text-sm text-[#60A5FA] flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                გთხოვთ გადარიცხოთ თანხა შეკვეთის დასრულებამდე
              </p>
            </div>

            {/* TBC Bank Card */}
            <div
              className="p-4 bg-[#334155] rounded-lg"
              style={{ borderLeft: `4px solid ${BANK_DETAILS.tbc.color}` }}
            >
              <h4 className="font-semibold text-[#F8FAFC] mb-2">{BANK_DETAILS.tbc.name}</h4>
              <div className="space-y-1 text-sm">
                <p className="text-[#94A3B8]">
                  <span className="text-[#CBD5E1]">IBAN:</span> {BANK_DETAILS.tbc.iban}
                </p>
                <p className="text-[#94A3B8]">
                  <span className="text-[#CBD5E1]">მიმღები:</span> {BANK_DETAILS.tbc.receiver}
                </p>
              </div>
              <button
                onClick={() => handleCopyIban('tbc')}
                className="mt-3 px-4 py-2 bg-[#475569] hover:bg-[#64748B] text-[#F8FAFC] text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                {copiedBank === 'tbc' ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>დაკოპირდა!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>დააკოპირე</span>
                  </>
                )}
              </button>
            </div>

            {/* BOG Bank Card */}
            <div
              className="p-4 bg-[#334155] rounded-lg"
              style={{ borderLeft: `4px solid ${BANK_DETAILS.bog.color}` }}
            >
              <h4 className="font-semibold text-[#F8FAFC] mb-2">{BANK_DETAILS.bog.name}</h4>
              <div className="space-y-1 text-sm">
                <p className="text-[#94A3B8]">
                  <span className="text-[#CBD5E1]">IBAN:</span> {BANK_DETAILS.bog.iban}
                </p>
                <p className="text-[#94A3B8]">
                  <span className="text-[#CBD5E1]">მიმღები:</span> {BANK_DETAILS.bog.receiver}
                </p>
              </div>
              <button
                onClick={() => handleCopyIban('bog')}
                className="mt-3 px-4 py-2 bg-[#475569] hover:bg-[#64748B] text-[#F8FAFC] text-sm rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                {copiedBank === 'bog' ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>დაკოპირდა!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>დააკოპირე</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Buttons */}
      <div className="flex space-x-3 mb-4">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${companyPhone}`}
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
          href={`tel:${companyTelPhone}`}
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
        className="w-full py-4 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] rounded-xl
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
