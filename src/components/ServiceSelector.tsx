'use client';

import { ServiceType } from '@/lib/types';

interface ServiceSelectorProps {
  onSelect: (serviceType: ServiceType) => void;
}

// Cargo truck icon
function CargoTruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="8" width="15" height="9" rx="1" />
      <path d="M16 12h4a1 1 0 011 1v4" />
      <circle cx="5.5" cy="17" r="2" />
      <circle cx="18.5" cy="17" r="2" />
      <path d="M7.5 17h9" />
      <path d="M5 8V6a1 1 0 011-1h6a1 1 0 011 1v2" />
    </svg>
  );
}

// Tow truck icon
function TowTruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14" />
      <path d="M3 15v-2a1 1 0 011-1h1l1.5-5h11L19 12h1a1 1 0 011 1v2" />
      <path d="M5 17a2 2 0 01-2-2" />
      <path d="M19 17a2 2 0 002-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M10 7l-2 5" />
      <path d="M14 7l2 5" />
    </svg>
  );
}

interface ServiceOption {
  type: ServiceType;
  title: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const services: ServiceOption[] = [
  {
    type: 'cargo',
    title: 'ტვირთის გადაზიდვა',
    description: 'სხვადასხვა ზომის ტვირთების გადაზიდვა',
    Icon: CargoTruckIcon,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
    borderClass: 'border-blue-500',
  },
  {
    type: 'evacuator',
    title: 'ევაკუატორი',
    description: 'ავტომობილის ევაკუაცია და ტრანსპორტირება',
    Icon: TowTruckIcon,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-100',
    borderClass: 'border-orange-500',
  },
];

export default function ServiceSelector({ onSelect }: ServiceSelectorProps) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          აირჩიეთ სერვისი
        </h2>
        <p className="text-gray-500 text-sm">
          რა ტიპის სერვისი გჭირდებათ?
        </p>
      </div>

      {/* Service Selection Grid */}
      <div className="grid grid-cols-1 gap-4">
        {services.map((service) => {
          const { Icon } = service;

          return (
            <button
              key={service.type}
              onClick={() => onSelect(service.type)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200
                flex items-center space-x-5
                border-gray-200 bg-white hover:${service.borderClass} hover:shadow-md
              `}
            >
              {/* Icon */}
              <div className={`
                w-16 h-16 rounded-xl flex items-center justify-center shrink-0
                ${service.bgClass}
              `}>
                <Icon className={`w-9 h-9 ${service.colorClass}`} />
              </div>

              {/* Text */}
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {service.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="ml-auto">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
