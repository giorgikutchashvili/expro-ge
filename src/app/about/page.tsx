'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AboutPage() {
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

        <h1 className="text-lg font-semibold text-white mb-6">{t.aboutPage.title}</h1>

        <div className="space-y-6 text-sm text-slate-400">
          <p>{t.aboutPage.description}</p>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.aboutPage.services}</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t.aboutPage.cargoService}</li>
              <li>{t.aboutPage.evacuatorService}</li>
              <li>{t.aboutPage.craneService}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">{t.aboutPage.whyUs}</h2>
            <ul className="space-y-2 ml-2">
              <li>
                <span className="text-slate-300 font-medium">{t.aboutPage.fast}:</span>{' '}
                {t.aboutPage.fastDesc}
              </li>
              <li>
                <span className="text-slate-300 font-medium">{t.aboutPage.reliable}:</span>{' '}
                {t.aboutPage.reliableDesc}
              </li>
              <li>
                <span className="text-slate-300 font-medium">{t.aboutPage.affordable}:</span>{' '}
                {t.aboutPage.affordableDesc}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
