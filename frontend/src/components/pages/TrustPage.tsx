import React from 'react';
import { CheckCircle2, PackageCheck, MapPinCheck, MessageCircle, Eye, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const TrustPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const points = [
    {
      icon: Eye,
      title: 'Clear product status',
      titleTa: 'தெளிவான பொருள் நிலை',
      text: 'Products can be marked Available, Out of Stock or Coming Soon so customers know what can actually be ordered.',
      textTa: 'ஒவ்வொரு பொருளும் கிடைக்கிறது, கையிருப்பில் இல்லை அல்லது விரைவில் வருகிறது என்று தெளிவாகக் காட்டப்படுகிறது.',
    },
    {
      icon: MapPinCheck,
      title: 'Delivery checked before payment',
      titleTa: 'பணம் செலுத்தும் முன் டெலிவரி சரிபார்ப்பு',
      text: 'Checkout is limited to Tamil Nadu and also requires a seller-enabled serviceable PIN code.',
      textTa: 'செக்அவுட் தமிழ்நாட்டிற்குள் மட்டுமே; மேலும் விற்பனையாளர் செயல்படுத்திய சேவை பின்கோடு அவசியம்.',
    },
    {
      icon: PackageCheck,
      title: 'Seller-managed packing and dispatch',
      titleTa: 'விற்பனையாளர் நிர்வகிக்கும் பேக்கிங் மற்றும் அனுப்புதல்',
      text: 'The seller schedules packing, marks dispatch and adds courier tracking details instead of showing made-up automatic updates.',
      textTa: 'பொய்யான தானியங்கி நிலைகளுக்கு பதிலாக, விற்பனையாளர் பேக்கிங் நேரம், அனுப்புதல் மற்றும் கூரியர் கண்காணிப்பு விவரங்களை புதுப்பிக்கிறார்.',
    },
    {
      icon: MessageCircle,
      title: 'Direct WhatsApp support',
      titleTa: 'நேரடி வாட்ஸ்அப் ஆதரவு',
      text: 'Customers can contact the business directly for product, delivery or care questions.',
      textTa: 'பொருள், டெலிவரி அல்லது பராமரிப்பு தொடர்பான கேள்விகளுக்கு வாடிக்கையாளர்கள் நேரடியாக தொடர்புகொள்ளலாம்.',
    },
    {
      icon: Star,
      title: 'Reviews after receipt',
      titleTa: 'பெற்ற பிறகு மட்டுமே மதிப்புரை',
      text: 'The review option becomes available after an order is marked received. Seller approval controls what is published publicly.',
      textTa: 'ஆர்டர் பெறப்பட்டது என்று குறிக்கப்பட்ட பிறகே மதிப்புரை வழங்கலாம். பொதுவாக காட்டப்படுவது விற்பனையாளர் ஒப்புதலுக்குப் பிறகே.',
    },
    {
      icon: CheckCircle2,
      title: 'Focused catalogue',
      titleTa: 'கவனம் செலுத்திய பொருள் பட்டியல்',
      text: 'The store focuses on guppies, fish food and combo packs instead of pretending to sell unrelated aquarium products.',
      textTa: 'தொடர்பில்லாத பொருட்களை காட்டாமல், கப்பி மீன்கள், மீன் உணவு, காம்போ மற்றும் மொத்த தொகுப்புகளில் கடை கவனம் செலுத்துகிறது.',
    },
  ];

  return (
    <div className="pb-24 md:pb-16">
      <section className="relative overflow-hidden bg-[#021E31] text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(80,212,238,.23),transparent_34%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-xs uppercase tracking-[.18em] font-extrabold text-[#50D4EE]">{t('How we work', 'நாங்கள் எப்படி செயல்படுகிறோம்')}</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-3 max-w-4xl leading-tight">{t('Why Enthusiasts Trust Sweety Birds & Fishes', 'ஆர்வலர்கள் ஏன் Sweety Birds & Fishes மீது நம்பிக்கை வைக்கிறார்கள்?')}</h1>
          <p className="mt-5 max-w-2xl text-base lg:text-lg text-sky-50/80 leading-relaxed">{t('Trust should come from a clear process, honest availability and direct communication — not exaggerated claims.', 'நம்பிக்கை என்பது மிகைப்படுத்தப்பட்ட வாக்குறுதிகளால் அல்ல; தெளிவான நடைமுறை, உண்மையான கிடைப்புத் தகவல் மற்றும் நேரடி தொடர்பால் உருவாக வேண்டும்.')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {points.map(({ icon: Icon, ...p }) => (
            <div key={p.title} className="bg-white rounded-3xl border border-sky-100 p-6 lg:p-7 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center"><Icon className="w-6 h-6" /></div>
              <h2 className="text-lg font-extrabold text-[#032B42] mt-5">{t(p.title, p.titleTa)}</h2>
              <p className="text-sm lg:text-base text-slate-600 leading-relaxed mt-2">{t(p.text, p.textTa)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] bg-gradient-to-r from-[#032B42] to-[#0875B5] p-7 lg:p-10 text-white flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold">{t('See the store process for yourself.', 'கடையின் நடைமுறையை நீங்களே பாருங்கள்.')}</h2>
            <p className="text-sky-50/80 mt-2">{t('Browse the active catalogue or read our care guides before you decide.', 'முடிவு செய்வதற்கு முன் செயலில் உள்ள பொருட்களையும் பராமரிப்பு வழிகாட்டிகளையும் பாருங்கள்.')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onNavigate('/shop')} className="px-5 py-3 rounded-2xl bg-[#50D4EE] text-[#021E31] font-extrabold text-sm flex items-center gap-2">{t('Browse Shop', 'கடையைப் பாருங்கள்')} <ArrowRight className="w-4 h-4" /></button>
            <button onClick={() => onNavigate('/guppy-care')} className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 font-bold text-sm">{t('Read Guppy Care', 'கப்பி பராமரிப்பைப் படிக்கவும்')}</button>
          </div>
        </div>
      </section>
    </div>
  );
};
