'use client';

import { ServiceType, CargoSize, EvacuatorType } from '@/lib/types';
import { CARGO_PRICES, EVACUATOR_PRICES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

interface SubTypeSelectorProps {
  serviceType: ServiceType;
  onSelect: (subType: CargoSize | EvacuatorType) => void;
  onBack: () => void;
}

interface CargoOption {
  type: CargoSize;
  name: string;
  dimensions: string;
  weight: string;
  description: string;
}

interface EvacuatorOption {
  type: EvacuatorType;
  name: string;
  description: string;
}

const cargoOptions: CargoOption[] = [
  {
    type: 'S',
    name: 'S - პატარა',
    dimensions: '1.5მ × 1.2მ × 1მ',
    weight: '500 კგ-მდე',
    description: 'მცირე ზომის ტვირთები',
  },
  {
    type: 'M',
    name: 'M - საშუალო',
    dimensions: '2.5მ × 1.5მ × 1.5მ',
    weight: '1000 კგ-მდე',
    description: 'საშუალო ზომის ტვირთები',
  },
  {
    type: 'L',
    name: 'L - დიდი',
    dimensions: '3მ × 1.8მ × 1.8მ',
    weight: '1500 კგ-მდე',
    description: 'დიდი ზომის ტვირთები',
  },
  {
    type: 'XL',
    name: 'XL - ძალიან დიდი',
    dimensions: '4მ × 2მ × 2მ',
    weight: '3000 კგ-მდე',
    description: 'მძიმე და დიდი ტვირთები',
  },
  {
    type: 'CONSTRUCTION',
    name: 'სამშენებლო',
    dimensions: '5მ × 2.2მ × 2.2მ',
    weight: '5000 კგ-მდე',
    description: 'სამშენებლო მასალები',
  },
];

const evacuatorOptions: EvacuatorOption[] = [
  {
    type: 'LIGHT',
    name: 'მსუბუქი ავტო',
    description: 'სედანი, ჰეტჩბექი, კუპე',
  },
  {
    type: 'JEEP',
    name: 'ჯიპი / SUV',
    description: 'ჯიპი, კროსოვერი, SUV',
  },
  {
    type: 'MINIBUS',
    name: 'მიკროავტობუსი',
    description: 'მინივენი, მიკროავტობუსი',
  },
  {
    type: 'SPIDER',
    name: 'სპაიდერი',
    description: 'დაბალი კლირენსის ავტომობილები',
  },
  {
    type: 'OVERSIZED',
    name: 'დიდგაბარიტიანი',
    description: 'ავტობუსი, სატვირთო, სპეცტექნიკა',
  },
];

function CargoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
      />
    </svg>
  );
}

export default function SubTypeSelector({ serviceType, onSelect, onBack }: SubTypeSelectorProps) {
  const isCargo = serviceType === 'cargo';
  const prices = isCargo ? CARGO_PRICES : EVACUATOR_PRICES;
  const accentColor = isCargo ? 'blue' : 'orange';

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6
                   transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>უკან</span>
      </button>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {isCargo ? 'აირჩიეთ ტვირთის ზომა' : 'აირჩიეთ ავტომობილის ტიპი'}
      </h2>
      <p className="text-gray-500 text-center mb-8">
        ფასები მოცემულია თბილისის ზონაში (35 კმ-მდე)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isCargo
          ? cargoOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className={`group bg-white rounded-xl p-6 shadow-md border-2 border-gray-100
                           hover:border-${accentColor}-500 hover:shadow-lg transition-all duration-300
                           text-left transform hover:-translate-y-1`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-14 h-14 bg-${accentColor}-100 rounded-lg flex items-center justify-center
                                flex-shrink-0 group-hover:bg-${accentColor}-500 transition-colors duration-300`}
                  >
                    <CargoIcon
                      className={`w-7 h-7 text-${accentColor}-500 group-hover:text-white transition-colors duration-300`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{option.description}</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>📐 {option.dimensions}</p>
                      <p>⚖️ {option.weight}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">ფასი:</span>
                  <span className={`text-lg font-bold text-${accentColor}-600`}>
                    {formatPrice(prices[option.type].customerPrice)}
                  </span>
                </div>
              </button>
            ))
          : evacuatorOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className={`group bg-white rounded-xl p-6 shadow-md border-2 border-gray-100
                           hover:border-${accentColor}-500 hover:shadow-lg transition-all duration-300
                           text-left transform hover:-translate-y-1`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-14 h-14 bg-${accentColor}-100 rounded-lg flex items-center justify-center
                                flex-shrink-0 group-hover:bg-${accentColor}-500 transition-colors duration-300`}
                  >
                    <TruckIcon
                      className={`w-7 h-7 text-${accentColor}-500 group-hover:text-white transition-colors duration-300`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-500">ფასი:</span>
                  <span className={`text-lg font-bold text-${accentColor}-600`}>
                    {formatPrice(prices[option.type].customerPrice)}
                  </span>
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}
