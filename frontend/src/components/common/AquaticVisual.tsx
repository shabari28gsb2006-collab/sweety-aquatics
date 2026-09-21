import React from 'react';
type Variant = 'guppies' | 'food' | 'combo' | 'aquarium';

const backgrounds: Record<Variant, string> = {
  guppies: '/images/guppy-aquarium-premium.png',
  aquarium: '/images/guppy-aquarium-premium.png',
  food: '/images/fish-food-aquarium-premium.png',
  combo: '/images/combo-aquarium-premium.png',
};

export const AquaticVisual: React.FC<{ variant?: Variant; className?: string }> = ({ variant = 'aquarium', className = '' }) => {
  return (
    <div aria-hidden="true" className={`aquatic-visual ${className}`}>
      <img src={backgrounds[variant]} alt="" className="aquatic-scene-image" />
      <div className="aquatic-light aquatic-light-one" />
      <div className="aquatic-light aquatic-light-two" />
      <div className="aquatic-bubble bubble-one" /><div className="aquatic-bubble bubble-two" />
      <div className="aquatic-bubble bubble-three" /><div className="aquatic-bubble bubble-four" />
      <div className="aquatic-scene-shade" />
    </div>
  );
};
