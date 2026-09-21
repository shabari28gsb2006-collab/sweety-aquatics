import React, { useState } from 'react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { X, Sparkles, Check, ArrowRight, RotateCcw } from 'lucide-react';

interface FindYourGuppyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const FindYourGuppyModal: React.FC<FindYourGuppyModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [step, setStep] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  if (!isOpen) return null;

  const colorOptions = [
    { label: 'Blue', colorBg: 'bg-blue-600', description: 'Midnight Moscow & Galaxy Cyan' },
    { label: 'Red', colorBg: 'bg-red-600', description: 'Red Dragon & Albino Full Red' },
    { label: 'Yellow / Gold', colorBg: 'bg-amber-400', description: '24K Solid Gold & Blonde' },
    { label: 'Multicolour', colorBg: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400', description: 'Tuxedo & Rainbow Mosaic' },
  ];

  const genderOptions = ['Pair', 'Male', 'Female', 'Show All Available'];
  const experienceOptions = [
    { label: 'Beginner', desc: 'Hardy strains that adapt effortlessly to standard water parameters' },
    { label: 'Experienced', desc: 'Select show-grade strains with delicate delta fins & fine breeding lines' },
  ];

  // Matching logic
  const getRecommendations = (): Product[] => {
    let guppies = productService.getByCategory('guppies');

    if (selectedColor) {
      if (selectedColor === 'Blue') {
        guppies = guppies.filter(
          (g) => (g.name?.toLowerCase() || '').includes('blue') || (g.guppyDetails?.colour?.toLowerCase() || '').includes('blue')
        );
      } else if (selectedColor === 'Red') {
        guppies = guppies.filter(
          (g) => (g.name?.toLowerCase() || '').includes('red') || (g.guppyDetails?.colour?.toLowerCase() || '').includes('red')
        );
      } else if (selectedColor === 'Yellow / Gold') {
        guppies = guppies.filter(
          (g) => (g.name?.toLowerCase() || '').includes('gold') || (g.guppyDetails?.colour?.toLowerCase() || '').includes('gold')
        );
      }
    }

    if (selectedExperience === 'Beginner') {
      const beginners = guppies.filter((g) => g.guppyDetails?.breedingDifficulty === 'Beginner');
      if (beginners.length > 0) guppies = beginners;
    }

    // Fallback if strict filter yields 0
    if (guppies.length === 0) {
      guppies = productService.getFeaturedGuppies().slice(0, 3);
    }

    return guppies.slice(0, 3);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedColor('');
    setSelectedGender('');
    setSelectedExperience('');
  };

  return (
    <div
      id="find-guppy-modal-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="find-guppy-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden relative animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#021E31] via-[#064463] to-[#0875B5] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#50D4EE]/20 flex items-center justify-center text-[#50D4EE]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-['Manrope',sans-serif]">Find Your Ideal Guppy</h3>
              <p className="text-[11px] text-[#E8F9FC]/80">3 quick questions to match your aquarium style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-sky-100 w-full">
          <div
            className="h-full bg-[#0875B5] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: COLOR */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#0875B5] uppercase tracking-wider">Step 1 of 3</span>
                <h4 className="text-base font-bold text-[#032B42] mt-0.5">Which colors do you prefer?</h4>
                <p className="text-xs text-slate-500">Select the dominant hues that complement your setup.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSelectedColor(opt.label);
                      setStep(2);
                    }}
                    className="p-3 rounded-2xl border border-sky-100 hover:border-[#0875B5] bg-[#F8FDFF] hover:bg-sky-50/60 text-left transition-all flex items-start gap-3 group"
                  >
                    <div className={`w-6 h-6 rounded-full ${opt.colorBg} shrink-0 mt-0.5 shadow-xs`} />
                    <div>
                      <p className="text-xs font-bold text-[#032B42] group-hover:text-[#0875B5]">
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: GENDER / PAIR */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#0875B5] uppercase tracking-wider">Step 2 of 3</span>
                <h4 className="text-base font-bold text-[#032B42] mt-0.5">Looking for?</h4>
                <p className="text-xs text-slate-500">Choose single show males, females, or harmonious pairs.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {genderOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedGender(opt);
                      setStep(3);
                    }}
                    className="p-3.5 rounded-2xl border border-sky-100 hover:border-[#0875B5] bg-[#F8FDFF] hover:bg-sky-50 text-center font-bold text-xs text-[#032B42] hover:text-[#0875B5] transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                ← Back to colors
              </button>
            </div>
          )}

          {/* STEP 3: EXPERIENCE */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#0875B5] uppercase tracking-wider">Step 3 of 3</span>
                <h4 className="text-base font-bold text-[#032B42] mt-0.5">Aquarium Experience?</h4>
                <p className="text-xs text-slate-500">We balance strain sensitivity and fin development.</p>
              </div>

              <div className="space-y-2.5">
                {experienceOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSelectedExperience(opt.label);
                      setStep(4);
                    }}
                    className="w-full p-3.5 rounded-2xl border border-sky-100 hover:border-[#0875B5] bg-[#F8FDFF] hover:bg-sky-50 text-left transition-all group"
                  >
                    <p className="text-xs font-bold text-[#032B42] group-hover:text-[#0875B5]">{opt.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                ← Back to gender preference
              </button>
            </div>
          )}

          {/* STEP 4: RECOMMENDATIONS */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1">
                  <Check className="w-3.5 h-3.5" /> Matched for Your Tank
                </span>
                <h4 className="text-base font-bold text-[#032B42]">Recommended for You</h4>
                <p className="text-xs text-slate-500">
                  {selectedColor} • {selectedGender} • {selectedExperience}
                </p>
              </div>

              <div className="space-y-2.5">
                {getRecommendations().map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-sky-100 hover:border-[#0875B5] bg-[#F8FDFF] cursor-pointer transition-all hover:shadow-md"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover bg-sky-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#032B42] truncate">{product.name}</h5>
                      <p className="text-[11px] text-slate-500 truncate">{product.shortDescription}</p>
                      <span className="text-xs font-extrabold text-[#0875B5] mt-1 block">
                        ₹{product.price}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restart Quiz
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#0875B5] text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Browse Store
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
