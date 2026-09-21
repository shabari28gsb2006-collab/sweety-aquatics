import React, { useEffect, useMemo, useState } from 'react';

function remainingLabel(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [days ? `${days}d` : '', `${hours}h`, `${minutes}m`, `${seconds}s`].filter(Boolean).join(' ');
}

export const OfferCountdown: React.FC<{ offerPrice?: number; offerEndsAt?: string; compact?: boolean }> = ({ offerPrice, offerEndsAt, compact = false }) => {
  const endTime = useMemo(() => offerEndsAt ? new Date(offerEndsAt).getTime() : 0, [offerEndsAt]);
  const [remaining, setRemaining] = useState(() => endTime - Date.now());

  useEffect(() => {
    setRemaining(endTime - Date.now());
    if (!endTime) return;
    const timer = window.setInterval(() => setRemaining(endTime - Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endTime]);

  if (offerPrice == null || !endTime || remaining <= 0) return null;
  return (
    <div className={`${compact ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-2'} rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold`}>
      ₹{offerPrice} if ordered within <span className="font-mono tabular-nums">{remainingLabel(remaining)}</span>
    </div>
  );
};
