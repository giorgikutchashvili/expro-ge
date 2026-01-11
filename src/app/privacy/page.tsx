'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function PrivacyPage() {
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

        <h1 className="text-lg font-semibold text-white mb-6">{t.privacyPage.title}</h1>

        <div className="space-y-6 text-sm text-slate-400">
          <p>{t.privacyPage.intro}</p>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.privacyPage.section1Title}</h2>
            <p>{t.privacyPage.section1Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.privacyPage.section2Title}</h2>
            <p>{t.privacyPage.section2Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.privacyPage.section3Title}</h2>
            <p>{t.privacyPage.section3Content}</p>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.privacyPage.section4Title}</h2>
            <p>{t.privacyPage.section4Content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
