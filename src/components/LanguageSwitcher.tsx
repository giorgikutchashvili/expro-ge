'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n/types';

const languages: { code: Language; label: string; fullLabel: string; flag: string }[] = [
  { code: 'ka', label: 'GE', fullLabel: 'ქართული', flag: '🇬🇪' },
  { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'RU', fullLabel: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#334155] hover:bg-[#475569]
                   rounded-lg transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-sm font-medium text-[#F8FAFC]">
          {currentLang.label}
        </span>
        <svg
          className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-36 bg-[#1E293B] border border-[#334155] rounded-xl
                    shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top-right
                    ${isOpen
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-95 pointer-events-none'
                    }`}
        role="listbox"
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors duration-150
                       ${language === lang.code
                         ? 'bg-[#3B82F6] text-white'
                         : 'text-[#F8FAFC] hover:bg-[#334155]'
                       }`}
            role="option"
            aria-selected={language === lang.code}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="text-sm font-medium">{lang.fullLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
