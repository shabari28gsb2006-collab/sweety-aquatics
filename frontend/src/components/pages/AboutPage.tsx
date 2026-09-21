import React from 'react';
import { Heart, Smartphone, Fish, BriefcaseBusiness, Baby, ArrowRight, Waves } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const AboutPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  return (
    <div className="pb-24 md:pb-16">
      <section className="relative min-h-[470px] flex items-end overflow-hidden bg-[#021E31] text-white">
        <img src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1800&q=85" alt="Aquarium fish and aquatic plants" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#021E31]/95 via-[#021E31]/75 to-[#021E31]/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 lg:pb-20 w-full">
          <span className="text-xs font-extrabold text-[#50D4EE] uppercase tracking-[.18em]">{t('About Sweety Birds & Fishes', 'Sweety Birds & Fishes பற்றி')}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold max-w-4xl leading-tight mt-3">{t('More Life. Less Screen.', 'அதிக உயிர்ப்பான வாழ்க்கை. குறைந்த திரை நேரம்.')}</h1>
          <p className="max-w-2xl text-base lg:text-lg text-sky-50/88 leading-relaxed mt-5">
            {t(
              'Sweety Birds & Fishes is a Tamil Nadu-focused small aquatic business centered on guppies, fish food and carefully created combo packs.',
              'Sweety Birds & Fishes என்பது தமிழ்நாட்டை மையமாகக் கொண்ட சிறிய அக்வேரியம் வணிகம். தற்போது கப்பி மீன்கள் மற்றும் மீன் உணவுகளை விற்பனை செய்கிறது; விற்பனையாளர் வெளியிடும் போது காம்போ மற்றும் மொத்த தொகுப்புகளும் கிடைக்கும்.'
            )}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-12">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-[2rem] bg-white border border-sky-100 p-7 lg:p-9 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0875B5] flex items-center justify-center"><Waves className="w-6 h-6" /></div>
            <span className="block mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#0875B5]">{t('Our Vision', 'எங்கள் பார்வை')}</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#032B42] mt-2">{t('Bring living nature back into everyday routines.', 'தினசரி வாழ்க்கையில் உயிருள்ள இயற்கையை மீண்டும் கொண்டு வருவது.')}</h2>
            <p className="text-sm lg:text-base text-slate-600 leading-relaxed mt-4">
              {t(
                'We want homes to enjoy the simple habit of observing, feeding and caring for living fish — a small daily connection with nature instead of spending every free minute on a phone.',
                'ஒவ்வொரு ஓய்வு நேரத்தையும் மொபைலில் செலவிடுவதற்குப் பதிலாக, உயிருள்ள மீன்களை கவனித்தல், உணவளித்தல் மற்றும் பராமரித்தல் போன்ற எளிய பழக்கத்தின் மூலம் வீடுகள் இயற்கையுடன் தினசரி தொடர்பை உருவாக்க வேண்டும் என்பதே எங்கள் பார்வை.'
              )}
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#032B42] text-white p-7 lg:p-9 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#50D4EE] flex items-center justify-center"><Heart className="w-6 h-6" /></div>
            <span className="block mt-5 text-xs font-extrabold uppercase tracking-[.16em] text-[#50D4EE]">{t('Our Mission', 'எங்கள் நோக்கம்')}</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold mt-2">{t('Love fish. Care for life. Make screen-free moments meaningful.', 'மீன்களை நேசிப்போம். உயிரை பராமரிப்போம். திரையற்ற நேரத்தை அர்த்தமுள்ளதாக மாற்றுவோம்.')}</h2>
            <p className="text-sm lg:text-base text-sky-50/80 leading-relaxed mt-4">
              {t(
                'Our mission is to make guppy keeping approachable for families: encourage children to spend some time caring for a living creature, and give busy working people a quiet aquarium routine that helps them slow down and unwind after screen-heavy days.',
                'குடும்பங்களுக்கு கப்பி மீன் பராமரிப்பை எளிதாக்குவது எங்கள் நோக்கம். குழந்தைகள் உயிருள்ள ஒன்றை அன்புடன் பராமரிக்க சிறிது நேரம் செலவிடவும், அதிக திரை நேரம் கொண்ட வேலை நாளுக்குப் பிறகு பணிபுரிபவர்கள் அமைதியாக கவனம் செலுத்தி ஓய்வெடுக்க உதவும் அக்வேரியம் பழக்கத்தை உருவாக்கவும் விரும்புகிறோம்.'
              )}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Baby, title: 'For children', ta: 'குழந்தைகளுக்காக', text: 'A simple responsibility: observe, feed carefully and learn respect for living things.', textTa: 'கவனித்தல், அளவாக உணவளித்தல் மற்றும் உயிருள்ளவற்றை மதிக்கக் கற்றுக்கொள்ளும் எளிய பொறுப்பு.' },
            { icon: BriefcaseBusiness, title: 'For working people', ta: 'பணிபுரிபவர்களுக்காக', text: 'A calm, hands-on routine away from continuous notifications and screens.', textTa: 'தொடர்ச்சியான அறிவிப்புகள் மற்றும் திரைகளிலிருந்து விலகி அமைதியாக செய்யக்கூடிய ஒரு நடைமுறை.' },
            { icon: Smartphone, title: 'For the home', ta: 'குடும்பத்திற்காக', text: 'A small living display that invites conversation, observation and shared care.', textTa: 'உரையாடல், கவனிப்பு மற்றும் பகிர்ந்த பராமரிப்பை ஊக்குவிக்கும் சிறிய உயிருள்ள காட்சி.' },
          ].map(({ icon: Icon, ...item }) => (
            <div key={item.title} className="rounded-3xl bg-white border border-sky-100 p-6 shadow-sm">
              <Icon className="w-6 h-6 text-[#0875B5]" />
              <h3 className="text-lg font-extrabold text-[#032B42] mt-4">{t(item.title, item.ta)}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mt-2">{t(item.text, item.textTa)}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] bg-gradient-to-r from-cyan-50 to-sky-50 border border-sky-100 p-7 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#0875B5]"><Fish className="w-5 h-5" /><span className="text-xs font-extrabold uppercase tracking-[.15em]">{t('What we sell today', 'இன்று நாங்கள் விற்பவை')}</span></div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#032B42] mt-2">{t('Guppies and fish food — kept intentionally focused.', 'கப்பி மீன்கள் மற்றும் மீன் உணவு — திட்டமிட்டே கவனம் செலுத்தப்பட்ட பட்டியல்.')}</h2>
            <p className="text-sm lg:text-base text-slate-600 mt-2 max-w-2xl">{t('We do not present birds, tanks, plants or aquarium accessories as products unless the business actually adds them later.', 'வணிகம் எதிர்காலத்தில் உண்மையாகச் சேர்க்கும் வரை பறவைகள், தொட்டிகள், தாவரங்கள் அல்லது அக்வேரியம் உபகரணங்களை பொருட்களாக காட்டமாட்டோம்.')}</p>
          </div>
          <button onClick={() => onNavigate('/why-trust-us')} className="px-5 py-3 rounded-2xl bg-[#0875B5] text-white text-sm font-extrabold flex items-center gap-2">{t('How we build trust', 'எங்கள் நம்பிக்கை நடைமுறை')} <ArrowRight className="w-4 h-4" /></button>
        </div>
      </section>
    </div>
  );
};
