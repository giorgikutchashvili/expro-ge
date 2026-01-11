'use client';

import { useState } from 'react';
import {
  CraneFloor,
  CraneCargoType,
  CraneDuration,
  CRANE_FLOOR_LABELS,
  CRANE_CARGO_LABELS,
  CRANE_DURATION_LABELS,
} from '@/lib/types';

interface CraneLiftSelectorProps {
  onComplete: (floor: CraneFloor, cargoType: CraneCargoType, duration: CraneDuration) => void;
  onBack: () => void;
}

type CraneStep = 'floor' | 'cargoType' | 'duration';

// Icons
function FloorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
    </svg>
  );
}

function FurnitureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <path d="M5 16v3" />
      <path d="M19 16v3" />
      <path d="M3 12h18" />
    </svg>
  );
}

function ConstructionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="1" />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M4 14h16" />
    </svg>
  );
}

function FragileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 8h8l-4-6z" />
      <path d="M8 8v8c0 2 2 4 4 4s4-2 4-4V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function OneTimeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function HourlyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6" />
      <path d="M16 14l-4-2" />
      <path d="M8 10l4 2" />
    </svg>
  );
}

function FullDayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

const floorOrder: CraneFloor[] = ['FLOOR_1_7', 'FLOOR_8_11', 'FLOOR_12_20'];
const cargoTypeOrder: CraneCargoType[] = ['FURNITURE', 'CONSTRUCTION', 'FRAGILE'];
const durationOrder: CraneDuration[] = ['ONE_TIME', 'HOURLY', 'FULL_DAY'];

const cargoIcons: Record<CraneCargoType, React.FC<{ className?: string }>> = {
  FURNITURE: FurnitureIcon,
  CONSTRUCTION: ConstructionIcon,
  FRAGILE: FragileIcon,
};

const durationIcons: Record<CraneDuration, React.FC<{ className?: string }>> = {
  ONE_TIME: OneTimeIcon,
  HOURLY: HourlyIcon,
  FULL_DAY: FullDayIcon,
};

export default function CraneLiftSelector({ onComplete, onBack }: CraneLiftSelectorProps) {
  const [step, setStep] = useState<CraneStep>('floor');
  const [selectedFloor, setSelectedFloor] = useState<CraneFloor | null>(null);
  const [selectedCargoType, setSelectedCargoType] = useState<CraneCargoType | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<CraneDuration | null>(null);

  const handleFloorSelect = (floor: CraneFloor) => {
    setSelectedFloor(floor);
    setStep('cargoType');
  };

  const handleCargoTypeSelect = (cargoType: CraneCargoType) => {
    setSelectedCargoType(cargoType);
    setStep('duration');
  };

  const handleDurationSelect = (duration: CraneDuration) => {
    setSelectedDuration(duration);
    if (selectedFloor && selectedCargoType) {
      onComplete(selectedFloor, selectedCargoType, duration);
    }
  };

  const handleBack = () => {
    if (step === 'duration') {
      setStep('cargoType');
    } else if (step === 'cargoType') {
      setStep('floor');
    } else {
      onBack();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'floor':
        return 'აირჩიეთ სართული';
      case 'cargoType':
        return 'აირჩიეთ ტვირთის ტიპი';
      case 'duration':
        return 'სამუშაოს ხანგრძლივობა';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'floor':
        return 'რომელ სართულზე გჭირდებათ ტვირთის აწევა/ჩამოწევა?';
      case 'cargoType':
        return 'რა ტიპის ტვირთს ატვირთავთ/ჩამოტვირთავთ?';
      case 'duration':
        return 'რამდენ ხანს გჭირდებათ ამწე?';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[480px] mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-2">
          {getStepTitle()}
        </h2>
        <p className="text-[#94A3B8] text-sm">
          {getStepDescription()}
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex justify-center space-x-2">
        {['floor', 'cargoType', 'duration'].map((s, index) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              s === step
                ? 'bg-[#10B981] scale-110'
                : index < ['floor', 'cargoType', 'duration'].indexOf(step)
                ? 'bg-[#10B981]'
                : 'bg-[#475569]'
            }`}
          />
        ))}
      </div>

      {/* Floor Selection */}
      {step === 'floor' && (
        <div className="flex flex-col gap-3">
          {floorOrder.map((floor) => {
            const label = CRANE_FLOOR_LABELS[floor];
            const isSelected = selectedFloor === floor;

            return (
              <button
                key={floor}
                onClick={() => handleFloorSelect(floor)}
                className={`relative h-[90px] sm:h-[100px] w-full rounded-2xl shadow-lg overflow-hidden
                           bg-gradient-to-r from-[#10B981] to-[#059669]
                           transition-all duration-200 ease-in-out
                           hover:scale-[1.02] hover:shadow-xl
                           flex items-center px-4 sm:px-6
                           ${isSelected ? 'ring-4 ring-white/50' : ''}`}
              >
                {/* Icon */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
                  <FloorIcon className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </div>

                {/* Text */}
                <div className="text-left ml-3 sm:ml-4 flex-1 min-w-0">
                  <h3 className="font-bold text-xl sm:text-2xl text-white mb-0.5">
                    {label.title}
                  </h3>
                  {label.surcharge > 0 && (
                    <p className="text-xs sm:text-sm text-white/80">
                      +{label.surcharge}₾ დამატებით
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="ml-auto shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Cargo Type Selection */}
      {step === 'cargoType' && (
        <div className="flex flex-col gap-3">
          {cargoTypeOrder.map((cargoType) => {
            const label = CRANE_CARGO_LABELS[cargoType];
            const Icon = cargoIcons[cargoType];
            const isSelected = selectedCargoType === cargoType;

            return (
              <button
                key={cargoType}
                onClick={() => handleCargoTypeSelect(cargoType)}
                className={`relative h-[90px] sm:h-[100px] w-full rounded-2xl shadow-lg overflow-hidden
                           bg-gradient-to-r from-[#10B981] to-[#059669]
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
                  <h3 className="font-bold text-lg sm:text-xl text-white">
                    {label}
                  </h3>
                </div>

                {/* Arrow */}
                <div className="ml-auto shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Duration Selection */}
      {step === 'duration' && (
        <div className="flex flex-col gap-3">
          {durationOrder.map((duration) => {
            const label = CRANE_DURATION_LABELS[duration];
            const Icon = durationIcons[duration];
            const isSelected = selectedDuration === duration;

            return (
              <button
                key={duration}
                onClick={() => handleDurationSelect(duration)}
                className={`relative h-[90px] sm:h-[100px] w-full rounded-2xl shadow-lg overflow-hidden
                           bg-gradient-to-r from-[#10B981] to-[#059669]
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
                  <h3 className="font-bold text-xl sm:text-2xl text-white">
                    {label}
                  </h3>
                </div>

                {/* Arrow */}
                <div className="ml-auto shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={handleBack}
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
