'use client';

import { useState } from 'react';
import { CargoSize, CARGO_SIZE_LABELS } from '@/lib/types';

interface SubTypeSelectorProps {
  onSelect: (subType: CargoSize) => void;
  onBack: () => void;
}

// Cargo truck icon component
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

const cargoSizeOrder: CargoSize[] = ['S', 'M', 'L', 'XL', 'CONSTRUCTION'];

export default function SubTypeSelector({ onSelect, onBack }: SubTypeSelectorProps) {
  const [selected, setSelected] = useState<CargoSize | null>(null);

  const handleSelect = (size: CargoSize) => {
    setSelected(size);
    onSelect(size);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          აირჩიეთ ტვირთის ზომა
        </h2>
        <p className="text-gray-500 text-sm">
          აირჩიეთ ტვირთის ზომა თქვენი საჭიროების მიხედვით
        </p>
      </div>

      {/* Cargo Size Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cargoSizeOrder.map((size) => {
          const label = CARGO_SIZE_LABELS[size];
          const isSelected = selected === size;

          return (
            <button
              key={size}
              onClick={() => handleSelect(size)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                flex flex-col items-center text-center
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-3
                ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
              `}>
                <CargoTruckIcon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>

              {/* Title */}
              <h3 className={`font-bold text-base mb-2 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                {label.title}
              </h3>

              {/* Dimensions */}
              <p className={`text-sm font-medium mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                {label.dimensions}
              </p>

              {/* Weight */}
              <p className="text-xs text-gray-500">
                {label.weight}
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
