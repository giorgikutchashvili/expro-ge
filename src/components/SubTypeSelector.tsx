'use client';

import { useState } from 'react';
import { CargoSize, CARGO_SIZE_LABELS } from '@/lib/types';
import { CargoTruckIcon } from '@/components/icons';

interface SubTypeSelectorProps {
  onSelect: (subType: CargoSize) => void;
  onBack: () => void;
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
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">
          აირჩიეთ ტვირთის ზომა
        </h2>
        <p className="text-[#94A3B8] text-sm">
          აირჩიეთ ტვირთის ზომა თქვენი საჭიროების მიხედვით
        </p>
      </div>

      {/* Cargo Size Grid */}
      <div className="grid grid-cols-2 gap-4">
        {cargoSizeOrder.map((size) => {
          const label = CARGO_SIZE_LABELS[size];
          const isSelected = selected === size;
          const isConstruction = size === 'CONSTRUCTION';

          return (
            <button
              key={size}
              onClick={() => handleSelect(size)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-200 ease-in-out
                flex flex-col items-center text-center
                shadow-md hover:shadow-lg hover:scale-[1.02]
                ${isConstruction ? 'col-span-2' : ''}
                ${isSelected
                  ? 'border-[#3B82F6] bg-[#1E3A5F]'
                  : 'border-[#475569] bg-[#1E293B] hover:border-[#60A5FA]'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Cargo Icon */}
              <CargoTruckIcon className="w-12 h-12 text-[#60A5FA] mb-3" />

              {/* Size Title - Extra Large and Bold */}
              <h3 className="text-5xl font-black mb-3 text-[#60A5FA]">
                {label.title}
              </h3>

              {/* Dimensions - Large, semibold */}
              <p className="text-lg font-semibold text-[#F8FAFC] mb-1">
                {label.dimensions}
              </p>

              {/* Weight */}
              <p className="text-base text-[#94A3B8]">
                {label.weight}
              </p>
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
