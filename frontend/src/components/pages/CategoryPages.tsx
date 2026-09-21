import React, { useEffect, useMemo, useState } from 'react';
import { Product, ProductCategory } from '../../types';
import { productService } from '../../services/productService';
import { wishlistService } from '../../services/wishlistService';
import { ProductCard } from '../product/ProductCard';
import { useLanguage } from '../../i18n/LanguageContext';
import { ArrowRight, Fish, Utensils, Boxes, Warehouse, Sparkles, Search, ShieldCheck, PackageCheck } from 'lucide-react';
import { AquaticVisual } from '../common/AquaticVisual';

interface Props {
  onOpenProduct: (product: Product) => void;
  onRequireAuth: (message: string) => void;
  onNavigate: (route: string) => void;
  wishlistIds?: string[];
}

interface CategoryConfig {
  category: ProductCategory;
  eyebrow: string;
  eyebrowTa: string;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
  notes: { title: string; titleTa: string; text: string; textTa: string }[];
}

const configs: Record<ProductCategory, CategoryConfig> = {
  guppies: {
    category: 'guppies',
    eyebrow: 'Live Guppy Collection',
    eyebrowTa: 'உயிருடன் கப்பி மீன் தொகுப்பு',
    title: 'Colour, movement and personality for your aquarium.',
    titleTa: 'உங்கள் அக்வேரியத்திற்கு நிறம், அசைவு மற்றும் உயிர்ப்பை சேர்க்கும் கப்பி மீன்கள்.',
    subtitle: 'Browse available guppy pairs and varieties. Availability is controlled by the seller, and only active stock can be ordered.',
    subtitleTa: 'கிடைக்கும் கப்பி ஜோடிகள் மற்றும் வகைகளைப் பாருங்கள். விற்பனையாளர் செயல்படுத்திய கையிருப்பு பொருட்களை மட்டுமே ஆர்டர் செய்யலாம்.',
    accent: 'from-cyan-500/35 via-sky-500/15 to-transparent',
    icon: Fish,
    notes: [
      { title: 'Check availability', titleTa: 'கிடைப்பை சரிபார்க்கவும்', text: 'Live fish stock can change, so the product status is shown clearly before checkout.', textTa: 'உயிர் மீன் கையிருப்பு மாறக்கூடும்; அதனால் செக்அவுட் முன் பொருளின் நிலை தெளிவாக காட்டப்படும்.' },
      { title: 'Delivery eligibility', titleTa: 'டெலிவரி தகுதி', text: 'Tamil Nadu delivery also requires an enabled serviceable PIN code.', textTa: 'தமிழ்நாட்டிற்குள் இருந்தாலும் செயல்படுத்தப்பட்ட சேவை பின்கோடு அவசியம்.' },
    ],
  },
  'fish-food': {
    category: 'fish-food',
    eyebrow: 'Everyday Fish Nutrition',
    eyebrowTa: 'தினசரி மீன் உணவு',
    title: 'Simple feeding choices for everyday aquarium care.',
    titleTa: 'தினசரி அக்வேரியம் பராமரிப்பிற்கு எளிய உணவு தேர்வுகள்.',
    subtitle: 'Explore the fish-food products currently added by the seller, with pack information, stock and feeding guidance where provided.',
    subtitleTa: 'விற்பனையாளர் சேர்த்துள்ள மீன் உணவுகளை, பேக் விவரம், கையிருப்பு மற்றும் வழங்கப்பட்ட உணவளிப்பு வழிகாட்டலுடன் பாருங்கள்.',
    accent: 'from-emerald-500/30 via-cyan-500/15 to-transparent',
    icon: Utensils,
    notes: [
      { title: 'Clear pack details', titleTa: 'தெளிவான பேக் விவரங்கள்', text: 'Weight and product information stay visible before purchase.', textTa: 'வாங்கும் முன் எடை மற்றும் பொருள் விவரங்கள் தெளிவாகக் காணப்படும்.' },
      { title: 'Buy again', titleTa: 'மீண்டும் வாங்குங்கள்', text: 'Delivered food orders can be reordered from the customer account when stock is available.', textTa: 'கையிருப்பு இருந்தால், முன்பு பெற்ற மீன் உணவை வாடிக்கையாளர் கணக்கிலிருந்து மீண்டும் வாங்கலாம்.' },
    ],
  },
  'combo-packs': {
    category: 'combo-packs',
    eyebrow: 'Curated Combo Packs',
    eyebrowTa: 'தேர்ந்தெடுக்கப்பட்ட காம்போ தொகுப்புகள்',
    title: 'Useful combinations, presented as one clear purchase.',
    titleTa: 'பயனுள்ள பொருள் சேர்க்கைகள் ஒரே தெளிவான வாங்குதலாக.',
    subtitle: 'Combo packs group eligible guppies and/or fish food into a single seller-managed listing with its own price and stock.',
    subtitleTa: 'தகுதியான கப்பி மீன்கள் மற்றும்/அல்லது மீன் உணவுகள் ஒரே விற்பனையாளர் நிர்வகிக்கும் தொகுப்பாக விலை மற்றும் கையிருப்புடன் வழங்கப்படும்.',
    accent: 'from-violet-500/25 via-cyan-500/15 to-transparent',
    icon: Boxes,
    notes: [
      { title: 'One listing', titleTa: 'ஒரே பட்டியல்', text: 'See included items, combined price and availability in one place.', textTa: 'சேர்க்கப்பட்ட பொருட்கள், மொத்த விலை மற்றும் கிடைப்பை ஒரே இடத்தில் பாருங்கள்.' },
      { title: 'Seller controlled', titleTa: 'விற்பனையாளர் கட்டுப்பாடு', text: 'The seller can activate, pause, mark coming soon or update combo stock.', textTa: 'விற்பனையாளர் காம்போவை செயல்படுத்த, நிறுத்த, விரைவில் வருகிறது என குறிக்க அல்லது கையிருப்பை மாற்றலாம்.' },
    ],
  },
  wholesale: {
    category: 'wholesale',
    eyebrow: 'Wholesale Category',
    eyebrowTa: 'மொத்த விற்பனை வகை',
    title: 'Bulk-ready listings for shops and repeat buyers.',
    titleTa: 'கடைகள் மற்றும் அதிக அளவு வாங்குபவர்களுக்கான மொத்த விற்பனை பட்டியல்கள்.',
    subtitle: 'Browse seller-published bulk packs with clear quantity, price, stock and availability just like the other store categories.',
    subtitleTa: 'விற்பனையாளர் வெளியிட்டுள்ள மொத்த தொகுப்புகளை அளவு, விலை, கையிருப்பு மற்றும் கிடைப்புத் தகவல்களுடன் மற்ற கடை வகைகளைப் போலவே பார்க்கலாம்.',
    accent: 'from-amber-400/25 via-cyan-500/10 to-transparent',
    icon: Warehouse,
    notes: [
      { title: 'Bulk listings', titleTa: 'மொத்த பட்டியல்கள்', text: 'Each wholesale product clearly states its pack or quantity in the product details.', textTa: 'ஒவ்வொரு மொத்த விற்பனை பொருளின் பேக் அல்லது அளவு அதன் விவரங்களில் தெளிவாக காட்டப்படும்.' },
      { title: 'Same checkout rules', titleTa: 'அதே செக்அவுட் விதிகள்', text: 'Account verification, Tamil Nadu and serviceable PIN-code rules still apply.', textTa: 'கணக்கு சரிபார்ப்பு, தமிழ்நாடு மற்றும் சேவை பின்கோடு விதிகள் இதற்கும் பொருந்தும்.' },
    ],
  },
};

const CategorySignaturePanel: React.FC<{ category: ProductCategory }> = ({ category }) => {
  const { t } = useLanguage();

  if (category === 'guppies') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#032B42] text-white min-h-[270px] border border-cyan-300/10 shadow-xl">
          <AquaticVisual variant="guppies" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#021E31]/95 via-[#032B42]/80 to-transparent" />
          <div className="relative z-10 p-7 md:p-10 max-w-2xl">
            <span className="text-cyan-300 text-xs font-extrabold uppercase tracking-[.18em]">{t('Choose with clarity', 'தெளிவாகத் தேர்வு செய்யுங்கள்')}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold mt-2">{t('Compare the details that matter for each guppy listing.', 'ஒவ்வொரு கப்பி பட்டியலிலும் முக்கியமான விவரங்களை ஒப்பிடுங்கள்.')}</h2>
            <div className="flex flex-wrap gap-2 mt-5">
              {[["Variety","வகை"],["Colour","நிறம்"],["Gender","பாலினம்"],["Size","அளவு"],["Availability","கிடைப்பாடு"]].map(([en,ta]) => <span key={en} className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-sm font-bold backdrop-blur-md">{t(en, ta)}</span>)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (category === 'fish-food') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-4">
          <div className="rounded-[2rem] bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 p-7 md:p-9">
            <span className="text-emerald-700 text-xs font-extrabold uppercase tracking-[.18em]">{t('Feeding shelf', 'உணவளிப்பு பகுதி')}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#032B42] mt-2">{t('Pick fish food by pack information, stock and seller-provided directions.', 'பேக் விவரம், கையிருப்பு மற்றும் விற்பனையாளர் வழங்கிய வழிமுறைகளை வைத்து மீன் உணவைத் தேர்வு செய்யுங்கள்.')}</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">{t('Every food listing remains separate from live-fish details, making repeat purchases easier to understand.', 'ஒவ்வொரு மீன் உணவு பட்டியலும் உயிர் மீன் விவரங்களிலிருந்து தனியாக இருக்கும்; இதனால் மீண்டும் வாங்குவது எளிதாக புரியும்.')}</p>
          </div>
          <div className="rounded-[2rem] overflow-hidden min-h-[260px] relative bg-[#053249]">
            <AquaticVisual variant="food" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021E31]/85 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white"><p className="font-extrabold text-xl">{t('Simple routines. Clear product information.', 'எளிய பழக்கம். தெளிவான பொருள் தகவல்.')}</p></div>
          </div>
        </div>
      </section>
    );
  }

  if (category === 'combo-packs') {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="rounded-[2rem] border border-violet-100 bg-white shadow-lg p-6 md:p-9">
          <div className="grid md:grid-cols-3 gap-4 items-stretch">
            {[{n:'01',en:'See what is included',ta:'சேர்க்கப்பட்டவற்றைப் பாருங்கள்'},{n:'02',en:'Check one combined price',ta:'ஒரே மொத்த விலையை சரிபார்க்கவும்'},{n:'03',en:'Confirm stock before checkout',ta:'செக்அவுட் முன் கையிருப்பை உறுதி செய்யுங்கள்'}].map((item) => (
              <div key={item.n} className="rounded-3xl bg-gradient-to-br from-violet-50 via-white to-cyan-50 border border-violet-100 p-6">
                <span className="text-4xl font-black text-violet-200">{item.n}</span>
                <h3 className="font-extrabold text-[#032B42] text-lg mt-3">{t(item.en,item.ta)}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#032B42] to-[#075F9B] text-white p-7 md:p-10 shadow-xl">
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-6 md:items-center">
          <div>
            <span className="text-amber-300 text-xs font-extrabold uppercase tracking-[.18em]">{t('Bulk buying, same store rules', 'மொத்த வாங்குதல், அதே கடை விதிகள்')}</span>
            <h2 className="text-2xl md:text-4xl font-extrabold mt-2 max-w-3xl">{t('Wholesale listings show the pack quantity, stock and price before you order.', 'மொத்த விற்பனை பட்டியல்களில் ஆர்டர் செய்வதற்கு முன் பேக் அளவு, கையிருப்பு மற்றும் விலை தெளிவாக காட்டப்படும்.')}</h2>
            <p className="text-sky-100/85 mt-3 max-w-2xl">{t('Tamil Nadu and serviceable PIN-code checks apply to wholesale checkout too.', 'மொத்த விற்பனை செக்அவுட்டிற்கும் தமிழ்நாடு மற்றும் சேவை பின்கோடு சரிபார்ப்பு பொருந்தும்.')}</p>
          </div>
          <Warehouse className="w-20 h-20 text-amber-300/75" />
        </div>
      </div>
    </section>
  );
};

const CategoryCollectionPage: React.FC<Props & { config: CategoryConfig }> = ({ config, onOpenProduct, onRequireAuth, onNavigate, wishlistIds: supplied }) => {
  const { t } = useLanguage();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => supplied || wishlistService.getWishlistIds());
  const [query, setQuery] = useState('');
  useEffect(() => wishlistService.subscribe(setWishlistIds), []);
  const products = useMemo(() => productService.getByCategory(config.category).filter((p) => {
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q);
  }), [config.category, query]);
  const Icon = config.icon;

  return (
    <div className="pb-24 md:pb-16">
      <section className="relative min-h-[390px] lg:min-h-[470px] overflow-hidden bg-[#021E31] text-white">
        <AquaticVisual variant={config.category === 'fish-food' ? 'food' : config.category === 'combo-packs' ? 'combo' : 'guppies'} />
        <div className={`absolute inset-0 bg-gradient-to-r ${config.accent}`} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#021E31]/95 via-[#021E31]/72 to-[#021E31]/25" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-14 lg:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold text-[#80E8FF] mb-5">
              <Icon className="w-4 h-4" /> {t(config.eyebrow, config.eyebrowTa)}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.06] font-['Manrope',sans-serif] max-w-3xl">
              {t(config.title, config.titleTa)}
            </h1>
            <p className="mt-5 text-base lg:text-lg leading-relaxed text-sky-50/88 max-w-2xl">
              {t(config.subtitle, config.subtitleTa)}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => document.getElementById(`${config.category}-products`)?.scrollIntoView({ behavior: 'smooth' })} className="px-5 py-3 rounded-2xl bg-[#50D4EE] text-[#021E31] font-extrabold text-sm flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                {t('Browse products', 'பொருட்களைப் பாருங்கள்')} <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigate('/shop')} className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm backdrop-blur-md">
                {t('View all categories', 'அனைத்து வகைகளையும் பாருங்கள்')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="grid md:grid-cols-2 gap-3">
          {config.notes.map((note, idx) => (
            <div key={note.title} className="bg-white/95 backdrop-blur-xl rounded-3xl border border-sky-100 shadow-lg p-5 flex gap-4">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center shrink-0">
                {idx === 0 ? <ShieldCheck className="w-5 h-5" /> : <PackageCheck className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-extrabold text-[#032B42] text-base">{t(note.title, note.titleTa)}</h2>
                <p className="text-sm text-slate-600 leading-relaxed mt-1">{t(note.text, note.textTa)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategorySignaturePanel category={config.category} />

      <section id={`${config.category}-products`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 lg:pt-18">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0875B5]">{t('Available now', 'தற்போது கிடைப்பவை')}</span>
            <h2 className="text-2xl lg:text-4xl font-extrabold text-[#032B42] mt-1">{t(config.eyebrow, config.eyebrowTa)}</h2>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Search this category...', 'இந்த வகையில் தேடுங்கள்...')} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-sky-100 shadow-sm text-sm outline-none focus:border-[#0875B5]" />
          </div>
        </div>

        {products.length ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onOpenProduct={onOpenProduct} onRequireAuth={onRequireAuth} isWishlisted={wishlistIds.includes(product.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-sky-100 bg-white p-10 text-center">
            <Sparkles className="w-9 h-9 text-[#50D4EE] mx-auto" />
            <h3 className="font-extrabold text-[#032B42] mt-3">{t('No matching products', 'பொருந்தும் பொருட்கள் இல்லை')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('Try another search or check again after the seller updates stock.', 'வேறு தேடலை முயற்சிக்கவும் அல்லது விற்பனையாளர் கையிருப்பை புதுப்பித்த பிறகு மீண்டும் பார்க்கவும்.')}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export const GuppiesPage: React.FC<Props> = (props) => <CategoryCollectionPage {...props} config={configs.guppies} />;
export const FishFoodPage: React.FC<Props> = (props) => <CategoryCollectionPage {...props} config={configs['fish-food']} />;
export const ComboPacksPage: React.FC<Props> = (props) => <CategoryCollectionPage {...props} config={configs['combo-packs']} />;
export const WholesaleCategoryPage: React.FC<Props> = (props) => <CategoryCollectionPage {...props} config={configs.wholesale} />;
