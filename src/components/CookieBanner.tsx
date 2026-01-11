'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslation();

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E293B]/95 backdrop-blur-sm border-t border-[#475569]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {t.cookieBanner.message}
        </p>
        <button
          onClick={handleAccept}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
        >
          {t.cookieBanner.accept}
        </button>
      </div>
    </div>
  );
}
