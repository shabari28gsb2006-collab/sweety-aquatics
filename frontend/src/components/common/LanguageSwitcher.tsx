import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-white/10 border border-white/10 p-1" aria-label="Language selector">
      {!compact && <Languages className="w-3.5 h-3.5 text-[#50D4EE] ml-1" />}
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${language === 'en' ? 'bg-[#50D4EE] text-[#021E31]' : 'text-white/75 hover:text-white'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ta')}
        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${language === 'ta' ? 'bg-[#50D4EE] text-[#021E31]' : 'text-white/75 hover:text-white'}`}
      >
        தமிழ்
      </button>
    </div>
  );
};
