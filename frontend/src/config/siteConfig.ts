import { siteSettingsService } from '../services/siteSettingsService';

export function getSiteContact() {
  return siteSettingsService.getSettings();
}

export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message);
  const runtimeNumber = siteSettingsService.getSettings().whatsappNumber;
  const envNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim();
  const number = (envNumber || runtimeNumber).replace(/\D/g, '');
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}
