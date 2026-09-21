import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { User } from '../../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Fish,
  ChevronDown,
  LogIn,
} from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  isAdminView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenCart,
  onOpenAuth,
  isAdminView = false,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubAuth = authService.subscribe(setUser);
    const unsubCart = cartService.subscribe(() => setCartCount(cartService.getItemCount()));
    const unsubWishlist = wishlistService.subscribe((list) => setWishlistCount(list.length));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      unsubAuth();
      unsubCart();
      unsubWishlist();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isHome = currentRoute === '/' || currentRoute === 'home';

  // Navigation Links
  const navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Shop', route: '/shop', hasDropdown: true },
    { label: 'Care Tips', route: '/guppy-care' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' },
  ];

  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || !isHome
          ? 'bg-[#021E31]/95 backdrop-blur-md shadow-md border-b border-sky-900/40 py-2.5'
          : 'bg-gradient-to-b from-[#021E31]/90 via-[#021E31]/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:gap-5">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 group text-left shrink-0 xl:min-w-[205px] xl:mr-8 2xl:mr-12"
            aria-label="Sweety Birds & Fishes Homepage"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0875B5] to-[#50D4EE] p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-[#021E31] rounded-[14px] flex items-center justify-center">
                <Fish className="w-5 h-5 text-[#50D4EE]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight font-['Manrope',sans-serif] block leading-none">
                Sweety
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#50D4EE] uppercase whitespace-nowrap">
                Birds &amp; Fishes
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex flex-1 items-center justify-center gap-2 2xl:gap-3 text-sm font-semibold text-white/90">
            {navLinks.map((link) => (
              <div key={link.route} className="relative group">
                <button
                  onClick={() => onNavigate(link.route)}
                  className={`premium-nav-link px-4 py-2.5 rounded-2xl transition-all duration-300 flex items-center gap-1.5 ${
                    currentRoute === link.route
                      ? 'bg-white/15 text-[#50D4EE]'
                      : 'hover:bg-white/10 hover:text-white text-white/80'
                  }`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-3 h-3 text-white/60" />}
                </button>

                {/* Submenu for Shop */}
                {link.hasDropdown && (
                  <div className="absolute top-full left-0 w-48 pt-2 hidden group-hover:block animate-in fade-in">
                    <div className="premium-nav-menu bg-[#032B42]/98 backdrop-blur-xl border border-sky-700/60 rounded-3xl p-2.5 shadow-2xl space-y-1">
                      <button
                        onClick={() => onNavigate('/guppies')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#064463] text-[#E8F9FC] flex items-center justify-between"
                      >
                        <span>Guppies</span>
                        <span className="text-[10px] bg-sky-900/80 text-[#50D4EE] px-1.5 py-0.5 rounded">
                          Live
                        </span>
                      </button>
                      <button
                        onClick={() => onNavigate('/fish-food')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#064463] text-[#E8F9FC] flex items-center justify-between"
                      >
                        <span>Fish Food</span>
                        <span className="text-[10px] bg-sky-900/80 text-[#50D4EE] px-1.5 py-0.5 rounded">
                          Food
                        </span>
                      </button>
                      <button
                        onClick={() => onNavigate('/combo-packs')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#064463] text-[#E8F9FC] flex items-center justify-between"
                      >
                        <span>Combo Packs</span>
                        <span className="text-[10px] bg-sky-900/80 text-emerald-400 px-1.5 py-0.5 rounded">
                          Save ₹
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            <div className="hidden lg:block"><LanguageSwitcher compact /></div>
            {/* Search Button */}
            <button
              id="btn-header-search"
              onClick={onOpenSearch}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 hover:text-white flex items-center justify-center transition-all"
              aria-label="Search products"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="btn-header-wishlist"
              onClick={() => onNavigate('/account?tab=wishlist')}
              className="relative w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white/90 hover:text-white flex items-center justify-center transition-all"
              aria-label="View wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account Profile Button */}
            {user ? (
              <button
                id="btn-header-account"
                onClick={() => onNavigate('/account')}
                className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white transition-all min-h-[40px]"
                aria-label="View account profile"
              >
                <div className="w-6 h-6 rounded-full bg-[#50D4EE]/20 border border-[#50D4EE]/60 flex items-center justify-center text-[#50D4EE] shrink-0">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <span className="font-semibold block leading-none">{user.name.split(' ')[0]}</span>
                  {user.isEmailVerified && (
                    <span className="text-[9px] text-emerald-400 font-mono">Verified ✓</span>
                  )}
                </div>
              </button>
            ) : (
              <button
                id="btn-header-login"
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors min-h-[40px]"
              >
                <LogIn className="w-3.5 h-3.5 text-[#50D4EE]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Drawer Trigger */}
            <button
              id="btn-header-cart"
              onClick={onOpenCart}
              className="relative w-10 h-10 rounded-xl bg-[#0875B5] hover:bg-[#064463] active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
              aria-label="Open shopping cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#50D4EE] text-[#021E31] text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white flex items-center justify-center transition-all"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end xl:hidden">
          <div className="w-4/5 max-w-sm bg-[#021E31] h-full p-5 sm:p-6 text-white flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-sky-900/80">
                <div className="flex items-center gap-2">
                  <Fish className="w-5 h-5 text-[#50D4EE]" />
                  <span className="font-bold text-sm">Sweety Birds &amp; Fishes</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 active:bg-white/20 text-white flex items-center justify-center"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Bar in Drawer */}
              <div className="py-4 border-b border-sky-900/60">
                {user ? (
                  <div
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/account');
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#50D4EE]/20 flex items-center justify-center text-[#50D4EE] shrink-0 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-[#50D4EE] flex items-center gap-1">
                        <span>My Account &amp; Orders</span>
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full bg-[#0875B5] active:bg-[#064463] text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In / Register
                  </button>
                )}
              </div>

              {/* Mobile Nav Links */}
              <nav className="py-3 space-y-1 text-sm font-semibold">
                {navLinks.map((link) => (
                  <button
                    key={link.route}
                    onClick={() => {
                      onNavigate(link.route);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between min-h-[44px] ${
                      currentRoute === link.route ? 'bg-[#0875B5] text-white font-bold' : 'hover:bg-white/10 text-[#E8F9FC]'
                    }`}
                  >
                    <span>{link.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-4 border-t border-sky-900/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-300">Language / மொழி</span>
                <LanguageSwitcher />
              </div>
              <button onClick={() => { setMobileMenuOpen(false); onNavigate('/guppy-care'); }} className="w-full rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-3 text-left text-sm font-semibold text-cyan-100 flex items-center justify-between">
                <span>Guppy Care Tips</span><ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Delivery only to enabled Tamil Nadu service areas
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
