'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function TermsPage() {
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

        <h1 className="text-lg font-semibold text-white mb-6">{t.termsPage.title}</h1>

        <div className="space-y-6 text-sm text-slate-400">
          <p>{t.termsPage.intro}</p>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.termsPage.section1Title}</h2>
            <p>{t.termsPage.section1Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.termsPage.section2Title}</h2>
            <p>{t.termsPage.section2Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.termsPage.section3Title}</h2>
            <p>{t.termsPage.section3Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.termsPage.section4Title}</h2>
            <p>{t.termsPage.section4Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.termsPage.section5Title}</h2>
            <p>{t.termsPage.section5Content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
