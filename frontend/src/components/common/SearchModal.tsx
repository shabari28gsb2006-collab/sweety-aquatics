import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { Search, X, ArrowRight, Star } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.trim().length > 1) {
      setResults(productService.searchProducts(query));
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in"
    >
      <div
        id="search-modal-card"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-sky-100 flex items-center gap-3 bg-[#F8FDFF]">
          <Search className="w-5 h-5 text-[#0875B5]" />
          <input
            type="text"
            autoFocus
            placeholder="Search guppy strains, micro pellets, combos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none text-[#032B42] placeholder-slate-400 font-medium"
          />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4">
          {query.trim().length <= 1 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <p>Type at least 2 characters to search varieties &amp; nutrition.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {['Red Dragon', 'Blue Moscow', 'Micro Pellets', 'Spirulina', 'Combo'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setQuery(chip)}
                    className="px-2.5 py-1 bg-sky-50 text-[#0875B5] rounded-lg text-[11px] font-medium hover:bg-sky-100 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No aquatic products matched &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F5FCFF] border border-transparent hover:border-sky-100 cursor-pointer transition-colors"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-sky-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#0875B5] uppercase tracking-wider">
                        {product.category}
                      </span>
                      <div className="flex items-center text-[10px] text-amber-500 font-semibold">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-[#032B42] truncate">{product.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{product.shortDescription}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#032B42]">₹{product.price}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-1 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
