'use client';

import { useState } from 'react';
import { CargoSize } from '@/lib/types';
import { CargoTruckIcon } from '@/components/icons';
import { useTranslation } from '@/contexts/LanguageContext';

interface SubTypeSelectorProps {
  onSelect: (subType: CargoSize) => void;
  onBack: () => void;
}

const cargoSizeOrder: CargoSize[] = ['S', 'M', 'L', 'XL', 'CONSTRUCTION'];

export default function SubTypeSelector({ onSelect, onBack }: SubTypeSelectorProps) {
  const [selected, setSelected] = useState<CargoSize | null>(null);
  const t = useTranslation();

  const handleSelect = (size: CargoSize) => {
    setSelected(size);
    onSelect(size);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[480px] mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
          {t.subTypeSelector.title}
        </h2>
        <p className="text-[#94A3B8] text-sm">
          {t.subTypeSelector.subtitle}
        </p>
      </div>

      {/* Cargo Size Cards */}
      <div className="flex flex-col gap-3">
        {cargoSizeOrder.map((size) => {
          const label = t.subTypeSelector.sizes[size];
          const isSelected = selected === size;

          return (
            <button
              key={size}
              onClick={() => handleSelect(size)}
              className={`relative h-[90px] sm:h-[100px] w-full rounded-2xl shadow-lg overflow-hidden
                         bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8]
                         transition-all duration-200 ease-in-out
                         hover:scale-[1.02] hover:shadow-xl
                         flex items-center px-4 sm:px-6
                         ${isSelected ? 'ring-4 ring-white/50' : ''}`}
            >
              {/* Icon */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                <CargoTruckIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>

              {/* Text */}
              <div className="text-center ml-3 sm:ml-4 flex-1 min-w-0">
                <h3 className="font-bold text-xl sm:text-2xl text-white mb-1">
                  {label.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 font-medium">
                  {label.weight}
                </p>
                <p className="text-xs sm:text-sm text-white/70">
                  {label.dimensions}
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
        <span>{t.navigation.back}</span>
      </button>
    </div>
  );
}
