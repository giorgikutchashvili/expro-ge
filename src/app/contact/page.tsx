'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ContactPage() {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-[480px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.navigation.mainPage}
          </Link>
          <LanguageSwitcher />
        </div>

        <h1 className="text-lg font-semibold text-white mb-6">{t.contactPage.title}</h1>

        <div className="space-y-4 text-sm text-slate-400">
          <a
            href="tel:+995555233344"
            className="flex items-center space-x-3 hover:text-slate-300 transition-colors"
          >
            <span>📞</span>
            <span>+995 555 23 33 44</span>
          </a>

          <a
            href="mailto:exprogeo@gmail.com"
            className="flex items-center space-x-3 hover:text-slate-300 transition-colors"
          >
            <span>📧</span>
            <span>exprogeo@gmail.com</span>
          </a>

          <a
            href="https://wa.me/995555233344"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 hover:text-slate-300 transition-colors"
          >
            <span>💬</span>
            <span>WhatsApp: +995 555 23 33 44</span>
          </a>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-slate-500">{t.contactPage.available}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
