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
    <div className="space-y-4 sm:space-y-6 max-w-[480px] mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
          რა ტიპის მანქანას ევაკუირებთ?
        </h2>
        <p className="text-[#94A3B8] text-sm">
          აირჩიეთ თქვენი სატრანსპორტო საშუალების ტიპი
        </p>
      </div>

      {/* Vehicle Type Cards - Horizontal Layout */}
      <div className="flex flex-col gap-3">
        {vehicleOrder.map((type) => {
          const Icon = vehicleIcons[type];
          const label = CUSTOMER_VEHICLE_LABELS[type];
          const isSelected = selected === type;

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={`relative h-[90px] sm:h-[100px] w-full rounded-2xl shadow-lg overflow-hidden
                         bg-gradient-to-r from-[#F97316] to-[#EA580C]
                         transition-all duration-200 ease-in-out
                         hover:scale-[1.02] hover:shadow-xl
                         flex items-center px-4 sm:px-6
                         ${isSelected ? 'ring-4 ring-white/50' : ''}`}
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>

              {/* Text */}
              <div className="text-left ml-3 sm:ml-4 flex-1 min-w-0">
                <h3 className="font-bold text-xl sm:text-2xl text-white mb-0.5">
                  {label.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 truncate">
                  {label.description}
                </p>
              </div>

              {/* Arrow or Check */}
              <div className="ml-auto shrink-0">
                {isSelected ? (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#F8FAFC] transition-all duration-200 mx-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>უკან</span>
      </button>
    </div>
  );
}
