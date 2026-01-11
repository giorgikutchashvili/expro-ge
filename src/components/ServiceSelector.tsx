'use client';

import { ServiceType } from '@/lib/types';
import { CargoTruckIcon, TowTruckIcon } from '@/components/icons';
import { useTranslation } from '@/contexts/LanguageContext';

interface ServiceSelectorProps {
  onSelect: (serviceType: ServiceType) => void;
}

// Crane lift icon
function CraneLiftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M8 7l4-4 4 4" />
      <path d="M8 17l4 4 4-4" />
      <rect x="4" y="9" width="16" height="6" rx="1" />
    </svg>
  );
}

export default function ServiceSelector({ onSelect }: ServiceSelectorProps) {
  const t = useTranslation();

  return (
    <div className="space-y-6 max-w-[480px] mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">
          {t.serviceSelector.title}
        </h2>
        <p className="text-[#94A3B8] text-sm">
          {t.serviceSelector.subtitle}
        </p>
      </div>

      {/* Service Cards */}
      <div className="flex flex-col gap-4">
        {/* Cargo Card */}
        <button
          onClick={() => onSelect('cargo')}
          className="relative h-[120px] w-full rounded-2xl shadow-xl overflow-hidden
                     bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]
                     transition-all duration-200 ease-in-out
                     hover:scale-[1.02] hover:shadow-2xl
                     flex items-center px-6"
        >
          {/* Icon */}
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <CargoTruckIcon className="w-16 h-16 text-white" />
          </div>

          {/* Text */}
          <div className="text-left ml-5 flex-1">
            <h3 className="font-bold text-2xl text-white mb-1">
              {t.serviceSelector.cargo.title}
            </h3>
            <p className="text-sm text-white/80">
              {t.serviceSelector.cargo.description}
            </p>
          </div>

          {/* Arrow */}
          <div className="ml-auto">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Evacuator Card */}
        <button
          onClick={() => onSelect('evacuator')}
          className="relative h-[120px] w-full rounded-2xl shadow-xl overflow-hidden
                     bg-gradient-to-r from-[#F97316] to-[#EA580C]
                     transition-all duration-200 ease-in-out
                     hover:scale-[1.02] hover:shadow-2xl
                     flex items-center px-6"
        >
          {/* Icon */}
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <TowTruckIcon className="w-16 h-16 text-white" />
          </div>

          {/* Text */}
          <div className="text-left ml-5 flex-1">
            <h3 className="font-bold text-2xl text-white mb-1">
              {t.serviceSelector.evacuator.title}
            </h3>
            <p className="text-sm text-white/80">
              {t.serviceSelector.evacuator.description}
            </p>
          </div>

          {/* Arrow */}
          <div className="ml-auto">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Crane Lift Card */}
        <button
          onClick={() => onSelect('crane')}
          className="relative h-[120px] w-full rounded-2xl shadow-xl overflow-hidden
                     bg-gradient-to-r from-[#10B981] to-[#059669]
                     transition-all duration-200 ease-in-out
                     hover:scale-[1.02] hover:shadow-2xl
                     flex items-center px-6"
        >
          {/* Icon */}
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <CraneLiftIcon className="w-16 h-16 text-white" />
          </div>

          {/* Text */}
          <div className="text-left ml-5 flex-1">
            <h3 className="font-bold text-2xl text-white mb-1">
              {t.serviceSelector.crane.title}
            </h3>
            <p className="text-sm text-white/80">
              {t.serviceSelector.crane.description}
            </p>
          </div>

          {/* Arrow */}
          <div className="ml-auto">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
