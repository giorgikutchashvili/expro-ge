'use client';

import { useState } from 'react';

export type PaymentMethodType = 'cash' | 'bank_transfer';
export type BankType = 'tbc' | 'bog';

interface PaymentMethodProps {
  selected: PaymentMethodType | null;
  onSelect: (method: PaymentMethodType) => void;
  onBack: () => void;
  price: number;
}

// Cash icon
function CashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

// Credit card icon
function CardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 14h4" />
    </svg>
  );
}

// Copy icon
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

// Check icon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

const BANK_DETAILS = {
  tbc: {
    name: 'თიბისი ბანკი',
    iban: 'GE10TB7248945061100092',
    receiver: 'EXPRO LLC',
    color: '#00A3E0',
    logo: 'TBC',
  },
  bog: {
    name: 'საქართველოს ბანკი',
    iban: 'GE83BG0000000160844522',
    receiver: 'EXPRO LLC',
    color: '#F37021',
    logo: 'BOG',
  },
};

export default function PaymentMethod({
  selected,
  onSelect,
  onBack,
  price,
}: PaymentMethodProps) {
  const [copiedBank, setCopiedBank] = useState<BankType | null>(null);

  const handleCopyIban = async (bank: BankType) => {
    const iban = BANK_DETAILS[bank].iban;
    try {
      await navigator.clipboard.writeText(iban);
      setCopiedBank(bank);
      setTimeout(() => setCopiedBank(null), 2000);
    } catch (err) {
      console.error('Failed to copy IBAN:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">
          აირჩიეთ გადახდის მეთოდი
        </h2>
        <p className="text-[#94A3B8] text-sm">
          როგორ გსურთ თანხის გადახდა?
        </p>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        {/* Cash Option */}
        <button
          onClick={() => onSelect('cash')}
          className={`
            w-full p-5 rounded-xl border-2 transition-all duration-200 ease-in-out
            flex items-center text-left
            shadow-md hover:shadow-lg hover:scale-[1.01]
            ${selected === 'cash'
              ? 'border-[#10B981] bg-[#1E3A3A]'
              : 'border-[#475569] bg-[#1E293B] hover:border-[#60A5FA]'
            }
          `}
        >
          {/* Selection indicator */}
          {selected === 'cash' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-[#10B981]/20 flex items-center justify-center shrink-0 mr-4">
            <CashIcon className="w-8 h-8 text-[#10B981]" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="font-bold text-[#F8FAFC] text-lg mb-1">
              ნაღდი ფული
            </h3>
            <p className="text-sm text-[#94A3B8]">
              გადაიხადეთ მძღოლთან ადგილზე
            </p>
          </div>

          {/* Radio indicator */}
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4
            ${selected === 'cash' ? 'border-[#10B981] bg-[#10B981]' : 'border-[#475569]'}`}
          >
            {selected === 'cash' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
        </button>

        {/* Bank Transfer Option */}
        <button
          onClick={() => onSelect('bank_transfer')}
          className={`
            w-full p-5 rounded-xl border-2 transition-all duration-200 ease-in-out
            flex items-center text-left
            shadow-md hover:shadow-lg hover:scale-[1.01]
            ${selected === 'bank_transfer'
              ? 'border-[#3B82F6] bg-[#1E3A5F]'
              : 'border-[#475569] bg-[#1E293B] hover:border-[#60A5FA]'
            }
          `}
        >
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center shrink-0 mr-4">
            <CardIcon className="w-8 h-8 text-[#60A5FA]" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="font-bold text-[#F8FAFC] text-lg mb-1">
              ბარათით გადახდა
            </h3>
            <p className="text-sm text-[#94A3B8]">
              გადარიცხვა საბანკო ანგარიშზე
            </p>
          </div>

          {/* Radio indicator */}
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4
            ${selected === 'bank_transfer' ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-[#475569]'}`}
          >
            {selected === 'bank_transfer' && (
              <div className="w-2 h-2 rounded-full bg-white" />
            )}
          </div>
        </button>
      </div>

      {/* Bank Details - Show when bank_transfer is selected */}
      {selected === 'bank_transfer' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="text-center">
            <p className="text-[#94A3B8] text-sm">
              გადარიცხეთ თანხა ერთ-ერთ ანგარიშზე:
            </p>
          </div>

          {/* TBC Bank Card */}
          <div
            className="p-5 rounded-xl border-2 bg-[#1E293B]"
            style={{ borderColor: BANK_DETAILS.tbc.color }}
          >
            <div className="flex items-center mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: BANK_DETAILS.tbc.color }}
              >
                TBC
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-[#F8FAFC]">{BANK_DETAILS.tbc.name}</h4>
                <p className="text-xs text-[#94A3B8]">{BANK_DETAILS.tbc.receiver}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#0F172A] rounded-lg p-3">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">IBAN</p>
                  <p className="text-sm font-mono text-[#F8FAFC]">{BANK_DETAILS.tbc.iban}</p>
                </div>
                <button
                  onClick={() => handleCopyIban('tbc')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1
                    ${copiedBank === 'tbc'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569] hover:text-[#F8FAFC]'
                    }`}
                >
                  {copiedBank === 'tbc' ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>დაკოპირდა!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>დააკოპირე</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#0F172A] rounded-lg p-3">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">თანხა</p>
                  <p className="text-xl font-bold" style={{ color: BANK_DETAILS.tbc.color }}>
                    {price}₾
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank of Georgia Card */}
          <div
            className="p-5 rounded-xl border-2 bg-[#1E293B]"
            style={{ borderColor: BANK_DETAILS.bog.color }}
          >
            <div className="flex items-center mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: BANK_DETAILS.bog.color }}
              >
                BOG
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-[#F8FAFC]">{BANK_DETAILS.bog.name}</h4>
                <p className="text-xs text-[#94A3B8]">{BANK_DETAILS.bog.receiver}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#0F172A] rounded-lg p-3">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">IBAN</p>
                  <p className="text-sm font-mono text-[#F8FAFC]">{BANK_DETAILS.bog.iban}</p>
                </div>
                <button
                  onClick={() => handleCopyIban('bog')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1
                    ${copiedBank === 'bog'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#334155] text-[#94A3B8] hover:bg-[#475569] hover:text-[#F8FAFC]'
                    }`}
                >
                  {copiedBank === 'bog' ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>დაკოპირდა!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-4 h-4" />
                      <span>დააკოპირე</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between bg-[#0F172A] rounded-lg p-3">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">თანხა</p>
                  <p className="text-xl font-bold" style={{ color: BANK_DETAILS.bog.color }}>
                    {price}₾
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
