import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory } from '../../types';
import { productService } from '../../services/productService';
import { wishlistService } from '../../services/wishlistService';
import { ProductCard } from '../product/ProductCard';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface ShopPageProps {
  initialCategory?: ProductCategory | 'all';
  onOpenProduct: (product: Product) => void;
  onRequireAuth: (message: string) => void;
  onOpenQuiz?: () => void;
  wishlistIds?: string[];
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'all',
  onOpenProduct,
  onRequireAuth,
  onOpenQuiz,
  wishlistIds: initialWishlistIds,
}) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(
    () => initialWishlistIds || wishlistService.getWishlistIds()
  );

  useEffect(() => {
    if (initialWishlistIds) {
      setWishlistIds(initialWishlistIds);
    }
    const unsub = wishlistService.subscribe((ids) => {
      setWishlistIds(ids);
    });
    return unsub;
  }, [initialWishlistIds]);

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Filters
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter options
  const colorOptions = ['all', 'Red', 'Blue', 'Gold', 'Black', 'Multicolour'];
  const genderOptions = ['all', 'Pair', 'Male', 'Female'];

  // All products
  const allProducts = productService.getAllProducts();

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Category
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (p.name?.toLowerCase() || '').includes(q);
          const matchDesc = (p.shortDescription?.toLowerCase() || '').includes(q) || (p.description?.toLowerCase() || '').includes(q);
          const matchVariety = (p.guppyDetails?.variety?.toLowerCase() || '').includes(q);
          if (!matchName && !matchDesc && !matchVariety) return false;
        }

        // Color filter (if guppies)
        if (selectedColor !== 'all') {
          if (p.category === 'guppies') {
            const c = p.guppyDetails?.colour?.toLowerCase() || '';
            const n = p.name?.toLowerCase() || '';
            if (!c.includes(selectedColor.toLowerCase()) && !n.includes(selectedColor.toLowerCase())) {
              return false;
            }
          }
        }

        // Gender filter
        if (selectedGender !== 'all' && p.category === 'guppies') {
          if (p.guppyDetails?.gender !== selectedGender) return false;
        }

        // In stock
        if (onlyInStock && (p.status !== 'ACTIVE' || p.stock <= 0)) {
          return false;
        }

        // Price
        if (p.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [allProducts, selectedCategory, searchQuery, selectedColor, selectedGender, onlyInStock, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedColor('all');
    setSelectedGender('all');
    setOnlyInStock(false);
    setMaxPrice(1000);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const hasActiveFilters =
    selectedColor !== 'all' ||
    selectedGender !== 'all' ||
    onlyInStock ||
    maxPrice < 1000 ||
    selectedCategory !== 'all' ||
    searchQuery.trim().length > 0;

  return (
    <div id="shop-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Shop Header Banner */}
      <div className="mb-8">
        <span className="text-xs font-bold text-[#0875B5] uppercase tracking-wider">
          Tamil Nadu Delivery Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] mt-1">
          Aquatic Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
          Browse seller-published guppies, fish food, combo packs and wholesale products in one catalog.
        </p>
      </div>

      {/* Category Tabs - Native-like smooth horizontal scroll on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 sm:pb-4 border-b border-sky-100 mb-4 sm:mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { label: 'All Products', value: 'all' },
          { label: 'Guppies', value: 'guppies' },
          { label: 'Fish Food', value: 'fish-food' },
          { label: 'Combo Packs', value: 'combo-packs' },
          { label: 'Wholesale', value: 'wholesale' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value as ProductCategory | 'all')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[40px] flex items-center shrink-0 ${
              selectedCategory === tab.value
                ? 'bg-[#0875B5] text-white shadow-sm'
                : 'bg-white hover:bg-sky-50 text-slate-600 border border-sky-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guppies, food, combos or wholesale..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] text-[#032B42] min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-sky-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 min-h-[44px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0875B5]" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#0875B5]" />
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2.5 text-xs font-semibold bg-white border border-sky-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#0875B5] min-h-[44px]"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid (Desktop Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <h3 className="font-bold text-xs text-[#032B42] uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0875B5]" />
              Filter Catalog
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Color Filter (For Guppies) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#032B42] block">Guppy Color</label>
            <div className="flex flex-wrap gap-1.5">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedColor === c
                      ? 'bg-[#0875B5] text-white'
                      : 'bg-sky-50 text-slate-600 hover:bg-sky-100'
                  }`}
                >
                  {c === 'all' ? 'All Colors' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#032B42] block">Gender / Pair</label>
            <div className="grid grid-cols-2 gap-1.5">
              {genderOptions.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-center transition-colors ${
                    selectedGender === g
                      ? 'bg-[#0875B5] text-white'
                      : 'bg-sky-50 text-slate-600 hover:bg-sky-100'
                  }`}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#032B42]">Max Price</label>
              <span className="font-mono text-[#0875B5] font-bold">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#0875B5] cursor-pointer"
            />
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2 border-t border-sky-100">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-[#0875B5] focus:ring-[#0875B5] border-sky-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <main className="lg:col-span-3">
          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-slate-400">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0875B5] text-[11px] font-semibold">
                  {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {selectedColor !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0875B5] text-[11px] font-semibold">
                  Color: {selectedColor}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedColor('all')} />
                </span>
              )}
              {selectedGender !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0875B5] text-[11px] font-semibold">
                  Gender: {selectedGender}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedGender('all')} />
                </span>
              )}
              {onlyInStock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0875B5] text-[11px] font-semibold">
                  In Stock Only
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyInStock(false)} />
                </span>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="text-xs text-slate-500 mb-4 font-medium">
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> items
          </p>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sky-100 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-sky-50 text-[#0875B5] mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#032B42]">No Products Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try adjusting your filter settings or search terms to find available guppies or feeds.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 bg-[#0875B5] text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 pb-24 md:pb-16">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenProduct={onOpenProduct}
                  onRequireAuth={onRequireAuth}
                  isWishlisted={(wishlistIds || []).includes(product.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET (Native commerce feel) */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div 
            className="w-full max-h-[85vh] bg-white rounded-t-3xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-sky-100 shrink-0">
              <div>
                <h3 className="font-bold text-base text-[#032B42]">Filter Catalog</h3>
                <p className="text-[11px] text-slate-400">Refine by strain color, gender and price</p>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto py-4 flex-1 pr-1">
              {/* Mobile Color Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#032B42]">Guppy Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium min-h-[40px] flex items-center transition-colors ${
                        selectedColor === c 
                          ? 'bg-[#0875B5] text-white shadow-xs font-bold' 
                          : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      {c === 'all' ? 'All Colors' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Gender */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#032B42]">Gender / Pair Selection</label>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-center min-h-[44px] flex items-center justify-center transition-colors ${
                        selectedGender === g 
                          ? 'bg-[#0875B5] text-white font-bold shadow-xs' 
                          : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div className="space-y-2.5 bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-[#032B42]">Max Price</label>
                  <span className="font-extrabold text-[#0875B5] text-sm">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0875B5] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>₹100</span>
                  <span>₹1,000</span>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0875B5] accent-[#0875B5]"
                  />
                  <span>Show in-stock items only</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-sky-100 flex gap-2.5 shrink-0">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold min-h-[48px] flex items-center justify-center transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-2 py-3.5 bg-[#0875B5] hover:bg-[#064463] text-white rounded-2xl text-xs font-bold min-h-[48px] flex items-center justify-center shadow-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
