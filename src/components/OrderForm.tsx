'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { PaymentMethodType } from '@/lib/types';

interface OrderFormProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  price: {
    customerPrice: number;
    driverPrice: number;
  };
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function OrderForm({
  phone,
  onPhoneChange,
  price,
  paymentMethod,
  onPaymentMethodChange,
  onSubmit,
  isLoading,
}: OrderFormProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (value: string): boolean => {
    // Georgian phone format: +995XXXXXXXXX or 5XXXXXXXX
    const georgianPhoneRegex = /^(\+995\d{9}|5\d{8})$/;
    return georgianPhoneRegex.test(value.replace(/\s/g, ''));
  };

  const formatPhoneInput = (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');

    // If starts with 995, add +
    if (cleaned.startsWith('995') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    onPhoneChange(formatted);

    if (formatted.length > 0 && !validatePhone(formatted)) {
      setPhoneError('გთხოვთ შეიყვანოთ სწორი ნომერი (+995XXXXXXXXX ან 5XXXXXXXX)');
    } else {
      setPhoneError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) {
      setPhoneError('გთხოვთ შეიყვანოთ სწორი ნომერი');
      return;
    }

    onSubmit();
  };

  const isValid = validatePhone(phone) && price.customerPrice > 0;

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-xl p-6 shadow-md space-y-6">
      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          <span className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>ტელეფონის ნომერი</span>
          </span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+995 5XX XXX XXX"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent
                     outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white ${
                       phoneError
                         ? 'border-red-300 focus:ring-red-500'
                         : 'border-gray-200 focus:ring-blue-500'
                     }`}
        />
        {phoneError && (
          <p className="mt-2 text-sm text-red-500 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{phoneError}</span>
          </p>
        )}
      </div>

      {/* Payment Method Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          გადახდის მეთოდი
        </label>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => onPaymentMethodChange('cash')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              paymentMethod === 'cash'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>ნაღდი ფული</span>
          </button>
          <button
            type="button"
            onClick={() => onPaymentMethodChange('card')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              paymentMethod === 'card'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            <span>ბარათით</span>
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">გადასახდელი თანხა:</span>
          <span className="text-2xl font-bold text-blue-600">{formatPrice(price.customerPrice)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={`w-full py-4 rounded-xl font-semibold text-white text-lg
                   transition-all duration-300 transform
                   ${
                     isValid && !isLoading
                       ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:-translate-y-0.5'
                       : 'bg-gray-300 cursor-not-allowed'
                   }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>იგზავნება...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>შეკვეთის გაგზავნა</span>
          </span>
        )}
      </button>
    </form>
  );
}
