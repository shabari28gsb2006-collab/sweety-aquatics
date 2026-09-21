import React from 'react';

interface AmbientGuppyProps {
  className: string;
  flip?: boolean;
  tone?: 'cyan' | 'coral' | 'gold';
}

const AmbientGuppy: React.FC<AmbientGuppyProps> = ({ className, flip = false, tone = 'cyan' }) => {
  const body = tone === 'coral' ? '#EF6A66' : tone === 'gold' ? '#F4B85B' : '#2DB9E5';
  const fin = tone === 'coral' ? '#FFB08A' : tone === 'gold' ? '#FFE29A' : '#80E8FF';
  return (
    <svg className={`decor-guppy ${className}`} viewBox="0 0 190 90" role="presentation">
      <g transform={flip ? 'translate(190 0) scale(-1 1)' : undefined}>
        <g className="decor-guppy-tail">
          <path d="M64 45 C38 22, 20 14, 4 18 C17 34, 17 56, 4 72 C23 75, 42 67, 66 48 Z" fill={fin} opacity="0.72" />
          <path d="M62 45 C42 32, 29 25, 16 25 M62 45 C40 45, 26 45, 12 45 M62 45 C42 57, 28 65, 15 66" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
        </g>
        <path d="M58 44 C70 25, 111 22, 145 36 C160 42, 164 49, 145 56 C108 69, 72 64, 58 48 Z" fill={body} opacity="0.84" />
        <path d="M72 39 C93 29, 123 31, 143 39" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeLinecap="round" opacity=".6" />
        <path className="decor-guppy-fin" d="M100 31 C94 17, 78 12, 72 24 C82 24, 91 29, 100 36 Z" fill={fin} opacity=".68" />
        <path className="decor-guppy-fin fin-lower" d="M110 58 C99 71, 85 72, 81 61 C92 62, 101 59, 110 54 Z" fill={fin} opacity=".48" />
        <circle cx="145" cy="40" r="4.5" fill="white" opacity=".92" />
        <circle cx="146" cy="40" r="2.3" fill="#021E31" />
        <circle cx="145.3" cy="39.3" r=".8" fill="white" />
      </g>
    </svg>
  );
};



const AmbientDolphin: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip = false }) => (
  <svg className={`decor-dolphin ${className}`.trim()} viewBox="0 0 260 120" role="presentation">
    <g transform={flip ? 'translate(260 0) scale(-1 1)' : undefined}>
      <path d="M30 64 C54 34, 106 24, 152 34 C178 40, 206 54, 220 66 C232 76, 236 82, 228 87 C214 95, 183 94, 160 86 C137 78, 118 72, 96 72 C81 72, 67 76, 54 82 C46 86, 37 85, 35 78 C32 72, 28 68, 30 64 Z" fill="rgba(119,230,246,.58)" />
      <path d="M152 34 C148 18, 160 10, 176 13 C168 18, 163 27, 166 38 Z" fill="rgba(171,247,255,.62)" />
      <path d="M218 66 C233 55, 248 56, 255 65 C248 71, 241 77, 230 81 Z" fill="rgba(171,247,255,.52)" />
      <path d="M90 72 C95 84, 89 95, 78 98 C78 89, 81 81, 86 74 Z" fill="rgba(171,247,255,.45)" />
      <circle cx="63" cy="53" r="4.3" fill="rgba(255,255,255,.95)" />
      <circle cx="64" cy="53" r="2.2" fill="#08344B" />
      <path d="M48 63 C57 66, 65 66, 73 63" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

const ReefHome: React.FC = () => (
  <div className="reef-home" aria-hidden="true">
    <div className="reef-rock rock-left" />
    <div className="reef-rock rock-middle" />
    <div className="reef-rock rock-right" />
    <div className="reef-cave" />
    <div className="reef-grass grass-left"><span/><span/><span/><span/></div>
    <div className="reef-grass grass-right"><span/><span/><span/><span/></div>
    <div className="reef-bubble bubble-a" />
    <div className="reef-bubble bubble-b" />
    <div className="reef-bubble bubble-c" />
  </div>
);

export const AquaticPageDecor: React.FC = () => {
  return (
    <div className="aquatic-page-decor" aria-hidden="true">
      <div className="aquatic-page-photo" />
      <div className="aquatic-caustics" />
      <div className="aquatic-surface-ripples" />

      <div className="aquatic-seaweed seaweed-left">
        <span className="leaf-1" /><span className="leaf-2" /><span className="leaf-3" />
        <span className="leaf-4" /><span className="leaf-5" /><span className="leaf-6" />
      </div>
      <div className="aquatic-seaweed seaweed-right">
        <span className="leaf-1" /><span className="leaf-2" /><span className="leaf-3" />
        <span className="leaf-4" /><span className="leaf-5" /><span className="leaf-6" />
      </div>
      <div className="aquatic-seaweed seaweed-mid">
        <span className="leaf-1" /><span className="leaf-2" /><span className="leaf-3" />
        <span className="leaf-4" /><span className="leaf-5" />
      </div>
      <div className="aquatic-light-ribbon ribbon-one" />
      <div className="aquatic-light-ribbon ribbon-two" />

      <ReefHome />
      <AmbientDolphin className="decor-dolphin-one" />
      <AmbientDolphin className="decor-dolphin-two" flip />

      <AmbientGuppy className="decor-guppy-one" tone="cyan" />
      <AmbientGuppy className="decor-guppy-two" tone="coral" flip />
      <AmbientGuppy className="decor-guppy-three" tone="gold" />

      {Array.from({ length: 18 }).map((_, idx) => (
        <span key={idx} className={`aquatic-bubble bubble-${idx + 1}`} />
      ))}
    </div>
  );
};
