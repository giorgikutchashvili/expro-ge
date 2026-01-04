'use client';

import { ServiceType, CargoSize, EvacuatorType } from '@/lib/types';
import CargoTruckIcon from '@/components/icons/CargoTruckIcon';
import TowTruckIcon from '@/components/icons/TowTruckIcon';

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
  examples: string;
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
    description: 'სტანდარტული მსუბუქი ავტომობილები',
    examples: 'სედანი, ჰეტჩბექი, კუპე',
  },
  {
    type: 'JEEP',
    name: 'ჯიპი / SUV',
    description: 'მაღალი გამავლობის ავტომობილები',
    examples: 'ჯიპი, კროსოვერი, SUV',
  },
  {
    type: 'MINIBUS',
    name: 'მიკროავტობუსი',
    description: 'სამგზავრო მიკროავტობუსები',
    examples: 'მინივენი, მიკროავტობუსი',
  },
  {
    type: 'SPIDER',
    name: 'სპაიდერი',
    description: 'დაბალი კლირენსის ავტომობილებისთვის',
    examples: 'სპორტული ავტო, დაბალი მანქანები',
  },
  {
    type: 'OVERSIZED',
    name: 'დიდგაბარიტიანი',
    description: 'დიდი ზომის ტრანსპორტი',
    examples: 'ავტობუსი, სატვირთო, სპეცტექნიკა',
  },
];

export default function SubTypeSelector({ serviceType, onSelect, onBack }: SubTypeSelectorProps) {
  const isCargo = serviceType === 'cargo';

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

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        {isCargo ? 'აირჩიეთ ტვირთის ზომა' : 'აირჩიეთ ავტომობილის ტიპი'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isCargo
          ? cargoOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className="group bg-white rounded-xl p-5 shadow-md border-2 border-gray-100
                         hover:border-blue-500 hover:shadow-xl transition-all duration-300
                         text-left transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4
                              group-hover:bg-blue-500 transition-colors duration-300">
                  <CargoTruckIcon className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">{option.name}</h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4">{option.description}</p>

                {/* Specs */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 w-20">ზომა:</span>
                    <span className="text-gray-700 font-medium">{option.dimensions}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-400 w-20">წონა:</span>
                    <span className="text-gray-700 font-medium">{option.weight}</span>
                  </div>
                </div>

                {/* Select indicator */}
                <div className="mt-4 flex items-center justify-end text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">არჩევა</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          : evacuatorOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => onSelect(option.type)}
                className="group bg-white rounded-xl p-5 shadow-md border-2 border-gray-100
                         hover:border-orange-500 hover:shadow-xl transition-all duration-300
                         text-left transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-4
                              group-hover:bg-orange-500 transition-colors duration-300">
                  <TowTruckIcon className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">{option.name}</h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-2">{option.description}</p>

                {/* Examples */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-start text-sm">
                    <span className="text-gray-400 shrink-0">მაგ:</span>
                    <span className="text-gray-600 ml-2">{option.examples}</span>
                  </div>
                </div>

                {/* Select indicator */}
                <div className="mt-4 flex items-center justify-end text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">არჩევა</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}
