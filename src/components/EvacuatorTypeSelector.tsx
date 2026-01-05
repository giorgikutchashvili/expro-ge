'use client';

import { CustomerVehicleType, CUSTOMER_VEHICLE_LABELS } from '@/lib/types';

interface EvacuatorTypeSelectorProps {
  selected: CustomerVehicleType | null;
  onSelect: (type: CustomerVehicleType) => void;
  onBack: () => void;
}

// Icons for each vehicle type
function SedanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14" />
      <path d="M5 17a2 2 0 01-2-2v-2a1 1 0 011-1h1l2-4h10l2 4h1a1 1 0 011 1v2a2 2 0 01-2 2" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
      <path d="M14 8H6l1.5-3h5L14 8z" />
    </svg>
  );
}

function SUVIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14" />
      <path d="M3 15v-2a1 1 0 011-1h1l1.5-5h11L19 12h1a1 1 0 011 1v2" />
      <path d="M5 17a2 2 0 01-2-2" />
      <path d="M19 17a2 2 0 002-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M6.5 12h11" />
      <path d="M9 12V7" />
      <path d="M15 12V7" />
    </svg>
  );
}

function MinibusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="18" height="11" rx="1" />
      <path d="M20 10h1a1 1 0 011 1v4a2 2 0 01-2 2" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="16" cy="17" r="2" />
      <path d="M8 17h6" />
      <path d="M6 6v5" />
      <path d="M10 6v5" />
      <path d="M14 6v5" />
      <path d="M2 11h18" />
    </svg>
  );
}

function ConstructionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="12" height="6" rx="1" />
      <path d="M15 14h4a2 2 0 012 2v1" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
      <path d="M8 17h8" />
      <path d="M5 11V6a1 1 0 011-1h3" />
      <path d="M15 11V8l-4-3v6" />
      <path d="M7 8h4" />
    </svg>
  );
}

function MotoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="16" r="3" />
      <circle cx="19" cy="16" r="3" />
      <path d="M5 16h6l4-8h4" />
      <path d="M15 8l2 8" />
      <path d="M11 16l2-4" />
      <path d="M8 12h4" />
      <circle cx="10" cy="8" r="1" />
    </svg>
  );
}

function SportsCarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 16h14" />
      <path d="M3 14v1a1 1 0 001 1" />
      <path d="M20 16a1 1 0 001-1v-1" />
      <path d="M3 14l1.5-3.5L7 8h10l2.5 2.5L21 14" />
      <circle cx="7" cy="16" r="2" />
      <circle cx="17" cy="16" r="2" />
      <path d="M9 16h6" />
      <path d="M7.5 10.5l2-2h5l2 2" />
      <path d="M10 14h4" />
    </svg>
  );
}

const vehicleIcons: Record<CustomerVehicleType, React.FC<{ className?: string }>> = {
  SEDAN: SedanIcon,
  SUV: SUVIcon,
  MINIBUS: MinibusIcon,
  CONSTRUCTION: ConstructionIcon,
  MOTO: MotoIcon,
  SPORTS: SportsCarIcon,
};

const vehicleOrder: CustomerVehicleType[] = ['SEDAN', 'SUV', 'MINIBUS', 'CONSTRUCTION', 'MOTO', 'SPORTS'];

export default function EvacuatorTypeSelector({
  selected,
  onSelect,
  onBack,
}: EvacuatorTypeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          რა ტიპის მანქანას ევაკუირებთ?
        </h2>
        <p className="text-gray-500 text-sm">
          აირჩიეთ თქვენი სატრანსპორტო საშუალების ტიპი
        </p>
      </div>

      {/* Vehicle Type Grid */}
      <div className="grid grid-cols-2 gap-4">
        {vehicleOrder.map((type) => {
          const Icon = vehicleIcons[type];
          const label = CUSTOMER_VEHICLE_LABELS[type];
          const isSelected = selected === type;

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                flex flex-col items-center text-center
                ${isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-3
                ${isSelected ? 'bg-orange-100' : 'bg-gray-100'}
              `}>
                <Icon className={`w-8 h-8 ${isSelected ? 'text-orange-600' : 'text-gray-600'}`} />
              </div>

              {/* Title */}
              <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>
                {label.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-tight">
                {label.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mx-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>უკან</span>
      </button>
    </div>
  );
}
