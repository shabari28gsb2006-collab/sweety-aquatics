import React, { useState, useEffect } from 'react';
import { cartService } from '../../services/cartService';
import { Home, Compass, Search, PackageCheck, ShoppingBag } from 'lucide-react';

interface MobileNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  isAdminView?: boolean;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenCart,
  isAdminView = false,
}) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    return cartService.subscribe(() => {
      setCartCount(cartService.getItemCount());
    });
  }, []);

  // Do NOT render on desktop or in admin panel
  if (isAdminView) return null;

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#021E31]/95 backdrop-blur-md border-t border-sky-900/60 mobile-nav-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* Home */}
        <button
          onClick={() => onNavigate('/')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentRoute === '/' || currentRoute === 'home'
              ? 'text-[#50D4EE]'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => onNavigate('/shop')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            currentRoute === '/shop' || currentRoute === '/guppies' || currentRoute === '/fish-food' || currentRoute === '/combo-packs' || currentRoute === '/wholesale'
              ? 'text-[#50D4EE]'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Shop"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Shop</span>
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Search"
        >
          <div className="w-10 h-10 -mt-3 rounded-full bg-gradient-to-tr from-[#0875B5] to-[#50D4EE] flex items-center justify-center text-[#021E31] shadow-lg">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium mt-0.5">Search</span>
        </button>

        {/* Orders */}
        <button
          onClick={() => onNavigate('/account?tab=orders')}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            (currentRoute || '').includes('orders') || (currentRoute || '').includes('track')
              ? 'text-[#50D4EE]'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Orders"
        >
          <PackageCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Orders</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#50D4EE] text-[#021E31] text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Cart</span>
        </button>
      </div>
    </nav>
  );
};
