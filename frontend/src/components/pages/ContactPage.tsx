import { buildWhatsAppUrl } from '../../config/siteConfig';
import React, { useEffect, useState } from 'react';
import { toastService } from '../../services/toastService';
import { siteSettingsService, SiteSettings } from '../../services/siteSettingsService';
import { useLanguage } from '../../i18n/LanguageContext';
import { MessageCircle, Mail, MapPin, Send, HelpCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { authService } from '../../services/authService';
import { customerFeatureService } from '../../services/customerFeatureService';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings>(() => siteSettingsService.getSettings());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => siteSettingsService.subscribe(setSettings), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authService.isAuthenticatedAndVerified()) { toastService.warning('Sign in required', 'Sign in with your verified customer account to create a support ticket.'); return; }
    try { await customerFeatureService.createSupportTicket({ subject, message }); setIsSent(true); toastService.success('Support ticket created', 'Your message is saved and the seller can reply from the dashboard.'); }
    catch (error) { toastService.error('Message not sent', error instanceof Error ? error.message : 'Please try again.'); }
  };

  const faqs = [
    {
      q: t('Where do you currently deliver?', 'தற்போது எங்கு டெலிவரி செய்கிறீர்கள்?'),
      a: t('Orders are currently accepted only for enabled serviceable PIN codes within Tamil Nadu.', 'தற்போது தமிழ்நாட்டிற்குள் செயல்படுத்தப்பட்ட சேவை பின்கோடுகளுக்கு மட்டுமே ஆர்டர்கள் ஏற்கப்படுகின்றன.'),
    },
    {
      q: t('How will I know when my order is packed?', 'என் ஆர்டர் எப்போது பேக் செய்யப்படும் என்று எப்படி தெரியும்?'),
      a: t('After payment, the seller can set a packing date and time. That schedule appears in your order tracking page.', 'பணம் செலுத்திய பிறகு, விற்பனையாளர் பேக்கிங் தேதி மற்றும் நேரத்தை அமைக்கலாம். அந்த தகவல் உங்கள் ஆர்டர் கண்காணிப்பு பக்கத்தில் காணப்படும்.'),
    },
    {
      q: t('When will I receive the courier tracking code?', 'கூரியர் கண்காணிப்பு குறியீடு எப்போது கிடைக்கும்?'),
      a: t('After dispatch, the seller can add the courier name, AWB or tracking number and tracking link. The same information then appears to you.', 'அனுப்பிய பிறகு, விற்பனையாளர் கூரியர் பெயர், AWB அல்லது கண்காணிப்பு எண் மற்றும் இணைப்பை சேர்க்கலாம். அதே தகவல் உங்களுக்கும் காட்டப்படும்.'),
    },
    {
      q: t('Can I review a product?', 'நான் பொருளுக்கு மதிப்புரை வழங்கலாமா?'),
      a: t('Yes. The review option becomes available after the order is marked received. Reviews are shown publicly only after seller approval.', 'ஆம். ஆர்டர் பெறப்பட்டது என்று குறிக்கப்பட்ட பிறகு மதிப்புரை வழங்கலாம். விற்பனையாளர் ஒப்புதல் அளித்த பிறகே அது பொதுவாகக் காட்டப்படும்.'),
    },
  ];

  return (
    <div id="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 relative z-10">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#021E31] via-[#064463] to-[#0875B5] rounded-[2rem] p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute -right-10 -top-16 w-72 h-72 rounded-full bg-[#50D4EE]/10 blur-3xl" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="text-xs font-bold text-[#50D4EE] uppercase tracking-wider">{t('Talk to the seller directly', 'விற்பனையாளரை நேரடியாக தொடர்புகொள்ளுங்கள்')}</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-['Manrope',sans-serif]">{t('Customer Support & Enquiries', 'வாடிக்கையாளர் ஆதரவு மற்றும் கேள்விகள்')}</h1>
          <p className="text-sm sm:text-base text-[#E8F9FC]/90 leading-relaxed">{t('For product questions, delivery availability, order updates or guppy-care guidance, use the contact options below.', 'பொருள், டெலிவரி கிடைப்பு, ஆர்டர் நிலை அல்லது கப்பி பராமரிப்பு தொடர்பான கேள்விகளுக்கு கீழே உள்ள தொடர்பு வழிகளைப் பயன்படுத்துங்கள்.')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <a href={buildWhatsAppUrl('Hello Sweety Birds & Fishes, I have an enquiry.')} target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#25D366] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"><MessageCircle className="w-6 h-6 fill-current" /></div>
          <h2 className="font-extrabold text-base text-[#032B42]">{t('WhatsApp Business', 'வாட்ஸ்அப் பிசினஸ்')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('Quick product and order support', 'பொருள் மற்றும் ஆர்டர் தொடர்பான விரைவான உதவி')}</p>
          <span className="text-sm font-extrabold text-[#25D366] mt-4 inline-flex items-center gap-1">{settings.whatsappNumber} <ExternalLink className="w-3.5 h-3.5" /></span>
        </a>

        <a href={`mailto:${settings.email}`} className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm hover:shadow-lg transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0875B5] flex items-center justify-center mb-4"><Mail className="w-6 h-6" /></div>
          <h2 className="font-extrabold text-base text-[#032B42]">{t('Email Desk', 'மின்னஞ்சல்')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('For detailed messages and order references', 'விரிவான செய்திகள் மற்றும் ஆர்டர் குறிப்புகளுக்கு')}</p>
          <span className="text-sm font-extrabold text-[#0875B5] mt-4 break-all inline-block">{settings.email}</span>
        </a>

        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0875B5] flex items-center justify-center mb-4"><MapPin className="w-6 h-6" /></div>
          <h2 className="font-extrabold text-base text-[#032B42]">{t('Current Delivery Region', 'தற்போதைய டெலிவரி பகுதி')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('Only enabled serviceable PIN codes are eligible for checkout.', 'செயல்படுத்தப்பட்ட சேவை பின்கோடுகளுக்கு மட்டுமே செக்அவுட் கிடைக்கும்.')}</p>
          <span className="text-sm font-extrabold text-slate-700 mt-4 inline-block">{settings.locationLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm">
          <h2 className="font-extrabold text-base text-[#032B42] uppercase tracking-wider mb-4">{t('Send us a Direct Message', 'நேரடியாக செய்தி அனுப்புங்கள்')}</h2>
          {isSent ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center"><CheckCircle2 className="w-6 h-6" /></div>
              <h3 className="font-extrabold text-base text-[#032B42]">{t('Message ready', 'செய்தி தயாராக உள்ளது')}</h3>
              <p className="text-sm text-slate-500">{t('Your support ticket is now saved. The seller can review it and reply from the protected dashboard.', 'உங்கள் ஆதரவு கோரிக்கை சேமிக்கப்பட்டது. விற்பனையாளர் அதை பார்த்து பாதுகாக்கப்பட்ட டாஷ்போர்டில் பதிலளிக்கலாம்.')}</p>
              <button onClick={() => setIsSent(false)} className="text-sm text-[#0875B5] underline">{t('Write another message', 'மற்றொரு செய்தி எழுதுங்கள்')}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-bold text-slate-700 block mb-1">{t('Your Name', 'உங்கள் பெயர்')}</label><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full text-sm p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" /></div>
              <div><label className="text-sm font-bold text-slate-700 block mb-1">{t('Email Address', 'மின்னஞ்சல் முகவரி')}</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-sm p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" /></div>
              <div><label className="text-sm font-bold text-slate-700 block mb-1">{t('Subject', 'பொருள்')}</label><input required value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full text-sm p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" /></div>
              <div><label className="text-sm font-bold text-slate-700 block mb-1">{t('Message', 'செய்தி')}</label><textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full text-sm p-3 bg-[#F8FDFF] border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5]" /></div>
              <button type="submit" className="bg-[#0875B5] hover:bg-[#064463] text-white text-sm font-extrabold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2"><Send className="w-4 h-4" />{t('Submit Query', 'கேள்வியை அனுப்புங்கள்')}</button>
            </form>
          )}
        </div>

        <div className="bg-[#F8FDFF] rounded-3xl border border-sky-100 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#0875B5]"><HelpCircle className="w-4 h-4" />{t('Frequently Asked Questions', 'அடிக்கடி கேட்கப்படும் கேள்விகள்')}</div>
          <div className="space-y-4 divide-y divide-sky-100 pt-2">
            {faqs.map((faq) => <div key={faq.q} className="pt-4 first:pt-0 space-y-1.5"><h3 className="text-sm font-extrabold text-[#032B42]">{faq.q}</h3><p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};
