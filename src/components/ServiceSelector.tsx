'use client';

import { ServiceType } from '@/lib/types';

interface ServiceSelectorProps {
  onSelect: (serviceType: ServiceType) => void;
}

export default function ServiceSelector({ onSelect }: ServiceSelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        აირჩიეთ სერვისი
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cargo Button */}
        <button
          onClick={() => onSelect('cargo')}
          className="group relative bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100
                     hover:border-blue-500 hover:shadow-xl transition-all duration-300
                     transform hover:-translate-y-1"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Cargo Icon */}
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center
                          group-hover:bg-blue-500 transition-colors duration-300">
              <svg
                className="w-12 h-12 text-blue-500 group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              ტვირთის გადაზიდვა
            </h3>

            <p className="text-gray-500 text-sm text-center">
              სხვადასხვა ზომის ტვირთების გადაზიდვა
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                        transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Evacuator Button */}
        <button
          onClick={() => onSelect('evacuator')}
          className="group relative bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100
                     hover:border-orange-500 hover:shadow-xl transition-all duration-300
                     transform hover:-translate-y-1"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Evacuator/Truck Icon */}
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center
                          group-hover:bg-orange-500 transition-colors duration-300">
              <svg
                className="w-12 h-12 text-orange-500 group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h8m-8 4h8m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 21v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4"
                />
                <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor" />
                <circle cx="16.5" cy="17.5" r="1.5" fill="currentColor" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
              ევაკუატორი
            </h3>

            <p className="text-gray-500 text-sm text-center">
              ავტომობილის ევაკუაცია და ტრანსპორტირება
            </p>
          </div>

          {/* Arrow indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                        transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
