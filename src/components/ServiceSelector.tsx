'use client';

import { ServiceType } from '@/lib/types';
import { CargoTruckIcon, TowTruckIcon } from '@/components/icons';

interface ServiceSelectorProps {
  onSelect: (serviceType: ServiceType) => void;
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
