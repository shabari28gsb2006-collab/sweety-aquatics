import { buildWhatsAppUrl } from '../../config/siteConfig';
import React, { useEffect, useState } from 'react';
import { serviceabilityService, ServiceabilityResult } from '../../services/serviceabilityService';
import { CheckCircle2, AlertCircle, MapPin, Truck, MessageCircle, ArrowRight } from 'lucide-react';

interface PincodeCheckerProps {
  onServiceabilityChange?: (result: ServiceabilityResult) => void;
  compact?: boolean;
  initialPincode?: string;
}

export const PincodeChecker: React.FC<PincodeCheckerProps> = ({
  onServiceabilityChange,
  compact = false,
  initialPincode = '',
}) => {
  const [pincode, setPincode] = useState(initialPincode);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async (codeToCheck?: string) => {
    const code = (codeToCheck || pincode).trim();
    if (!code) return;

    setIsChecking(true);
    const res = await serviceabilityService.checkPincode(code);
    setResult(res);
    setIsChecking(false);
    onServiceabilityChange?.(res);
  };

  useEffect(() => {
    if (/^\d{6}$/.test(initialPincode)) void handleCheck(initialPincode);
    // Initial pincode is intentionally checked only when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPincode]);

  const handleQuickPick = async (code: string) => {
    setPincode(code);
    await handleCheck(code);
  };

  const estimatedArrivalLabel = (eta?: string) => {
    if (!eta) return 'Seller will confirm after packing';
    const numbers = eta.match(/\d+/g)?.map(Number) || [];
    const minDays = numbers[0] || 1;
    const maxDays = numbers[1] || Math.max(minDays, 2);
    const start = new Date(); start.setDate(start.getDate() + minDays);
    const end = new Date(); end.setDate(end.getDate() + maxDays);
    const fmt = (date: Date) => date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${fmt(start)} – ${fmt(end)} (estimate)`;
  };

  const openWhatsAppEnquiry = () => {
    const msg = encodeURIComponent(
      `Hello Sweety Birds & Fishes, my pincode is ${pincode || 'in Tamil Nadu'}. Can you check if live delivery is possible for my address?`
    );
    window.open(buildWhatsAppUrl(decodeURIComponent(msg)), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="pincode-checker-box"
      className={`rounded-2xl border transition-all ${
        result?.isServiceable
          ? 'bg-emerald-50/70 border-emerald-200'
          : result && !result.isServiceable
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-[#F5FCFF] border-sky-200'
      } ${compact ? 'p-3.5' : 'p-5'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#0875B5]" />
          <span className="text-xs font-bold tracking-wide uppercase text-[#064463]">
            Delivery Serviceability
          </span>
        </div>
        <span className="text-[10px] font-semibold bg-sky-100/80 text-[#0875B5] px-2 py-0.5 rounded-full">
          Tamil Nadu Only
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-3">
        Orders are currently accepted only for enabled serviceable PIN codes within Tamil Nadu.
      </p>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleCheck();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            id="input-pincode-checker"
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPincode(val);
              if (result) setResult(null);
            }}
            placeholder="Enter 6-digit PIN (e.g. 600028)"
            className="w-full text-xs font-mono tracking-wider px-3 py-2.5 bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] text-slate-800"
          />
        </div>
        <button
          id="btn-check-pincode"
          type="submit"
          disabled={pincode.length !== 6 || isChecking}
          className="bg-[#0875B5] hover:bg-[#064463] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          {isChecking ? 'Checking...' : 'Check'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Verified Pro EX PIN-code shortcuts for easy testing */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
        <span className="text-[10px] font-medium text-slate-400">Verified Pro EX:</span>
        <button
          type="button"
          onClick={() => void handleQuickPick('600028')}
          className="bg-white hover:bg-sky-50 border border-sky-200 text-[#0875B5] px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors"
        >
          600028 (Chennai)
        </button>
        <button
          type="button"
          onClick={() => void handleQuickPick('626125')}
          className="bg-white hover:bg-sky-50 border border-sky-200 text-[#0875B5] px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors"
        >
          626125 (SVP)
        </button>
        <button
          type="button"
          onClick={() => void handleQuickPick('620001')}
          className="bg-white hover:bg-sky-50 border border-sky-200 text-[#0875B5] px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors"
        >
          620001 (Trichy)
        </button>
      </div>

      {/* Result feedback */}
      {result && (
        <div className="mt-3 pt-3 border-t border-sky-100 animate-in fade-in">
          {result.isServiceable ? (
            <div className="flex items-start gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-900">✓ Delivery Available</p>
                <p className="text-emerald-700 mt-0.5">{result.message}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-600">
                  <Truck className="w-3.5 h-3.5" />
<span>Carrier: {result.courier} • Typical transit: {result.estimatedDeliveryTime}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/70 border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-800">
                  Estimated arrival: {estimatedArrivalLabel(result.estimatedDeliveryTime)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold">{result.message}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Contact us on WhatsApp if you want to ask about future delivery availability for this area.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openWhatsAppEnquiry}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                Enquire on WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
