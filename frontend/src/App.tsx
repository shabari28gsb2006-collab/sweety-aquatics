import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Product, Order } from './types';
import { productService } from './services/productService';
import { authService } from './services/authService';
import { wishlistService } from './services/wishlistService';
import { orderService } from './services/orderService';

// Layout & Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNavigation } from './components/common/MobileNavigation';
import { CartDrawer } from './components/common/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/common/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { FindYourGuppyModal } from './components/product/FindYourGuppyModal';

// Pages
import { HomePage } from './components/pages/HomePage';
import { AquaticPageDecor } from './components/common/AquaticPageDecor';

const ShopPage = lazy(() => import('./components/pages/ShopPage').then(m => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import('./components/pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./components/pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./components/pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderSuccessPage = lazy(() => import('./components/pages/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));
const OrderTrackingPage = lazy(() => import('./components/pages/OrderTrackingPage').then(m => ({ default: m.OrderTrackingPage })));
const AccountPage = lazy(() => import('./components/pages/AccountPage').then(m => ({ default: m.AccountPage })));
const GuppyCareHubPage = lazy(() => import('./components/pages/GuppyCareHubPage').then(m => ({ default: m.GuppyCareHubPage })));
const GuppyCareArticlePage = lazy(() => import('./components/pages/GuppyCareArticlePage').then(m => ({ default: m.GuppyCareArticlePage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const TrustPage = lazy(() => import('./components/pages/TrustPage').then(m => ({ default: m.TrustPage })));
const GuppiesPage = lazy(() => import('./components/pages/CategoryPages').then(m => ({ default: m.GuppiesPage })));
const FishFoodPage = lazy(() => import('./components/pages/CategoryPages').then(m => ({ default: m.FishFoodPage })));
const ComboPacksPage = lazy(() => import('./components/pages/CategoryPages').then(m => ({ default: m.ComboPacksPage })));
const WholesaleCategoryPage = lazy(() => import('./components/pages/CategoryPages').then(m => ({ default: m.WholesaleCategoryPage })));

// Admin Console
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(module => ({ default: module.AdminLayout })));
const AdminLoginPage = lazy(() => import('./components/admin/AdminLoginPage').then(module => ({ default: module.AdminLoginPage })));

import { WhatsAppFloating } from './components/common/WhatsAppFloating';
import { articleService } from './services/articleService';

export default function App() {
  // Navigation Route State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return `${window.location.pathname || '/'}${window.location.search || ''}`;
  });

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
  const [isFindGuppyOpen, setIsFindGuppyOpen] = useState(false);

  // Selected entities for detail views
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => wishlistService.getWishlistIds());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminSessionChecked, setIsAdminSessionChecked] = useState(false);
  const [, setProductVersion] = useState(0);
  const [, setArticleVersion] = useState(0);

  useEffect(() => {
    const unsub = wishlistService.subscribe((ids) => {
      setWishlistIds(ids);
    });
    return unsub;
  }, []);
  useEffect(() => productService.subscribe(() => setProductVersion(version => version + 1)), []);
  useEffect(() => articleService.subscribe(() => setArticleVersion(version => version + 1)), []);

  useEffect(() => {
    const preload = () => void Promise.all([
      import('./components/pages/ShopPage'), import('./components/pages/ProductDetailPage'),
      import('./components/pages/CartPage'), import('./components/pages/CheckoutPage'),
      import('./components/pages/OrderSuccessPage'), import('./components/pages/OrderTrackingPage'),
      import('./components/pages/AccountPage'), import('./components/pages/CategoryPages'),
      import('./components/pages/GuppyCareHubPage'), import('./components/pages/GuppyCareArticlePage'),
      import('./components/pages/AboutPage'), import('./components/pages/ContactPage'), import('./components/pages/TrustPage'),
    ]);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || connection?.effectiveType === '2g') return;
    const win = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(preload, { timeout: 1500 });
      return () => win.cancelIdleCallback?.(idleId);
    }
    const timer = window.setTimeout(preload, 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const verifyAdminSession = async () => {
      const base = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '');
      const requestMe = () => fetch(`${base}/auth/admin/me`, { credentials: 'include' });
      try {
        let response = await requestMe();
        if (response.status === 401) {
          const refreshed = await fetch(`${base}/auth/admin/refresh`, {
            method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}',
          });
          if (refreshed.ok) response = await requestMe();
        }
        if (active) setIsAdminAuthenticated(response.ok);
      } catch {
        if (active) setIsAdminAuthenticated(false);
      } finally {
        if (active) setIsAdminSessionChecked(true);
      }
    };
    void verifyAdminSession();
    return () => { active = false; };
  }, []);

  // Listen to browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(`${window.location.pathname || '/'}${window.location.search || ''}`);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Safe navigation handler
  const handleNavigate = (route: string) => {
    if (route !== currentRoute) {
      window.history.pushState({}, '', route);
      setCurrentRoute(route);
      // Route changes should feel immediate; decorative smooth scrolling made
      // button clicks appear delayed on mobile devices.
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    handleNavigate(`/product/${product.id}`);
  };

  const handleRequireAuth = (message?: string) => {
    setAuthReason(message);
    setIsAuthOpen(true);
  };

  const handleOrderCompleted = (order: Order) => {
    setLastCompletedOrder(order);
    handleNavigate(`/order-success/${order.id}`);
  };

  // Check if current route is admin
  const routePath = currentRoute.split('?')[0];
  const isAdminView = routePath.startsWith('/admin');

  useEffect(() => {
    const pages: Record<string, [string, string]> = {
      '/': ['Sweety Birds & Fishes | Premium Guppies & Aquarium Fish Food', 'Shop vibrant guppy fish, aquarium fish food and curated aquarium combos at Sweety Birds & Fishes. Tamil Nadu delivery.'],
      '/shop': ['Shop Guppies, Fish Food & Aquarium Combos | Sweety', 'Browse available guppies, fish food, combo packs and seller-listed aquarium products.'],
      '/guppies': ['Buy Premium Guppy Fish | Sweety Birds & Fishes', 'Explore colourful guppy varieties, availability and care details at Sweety Birds & Fishes.'],
      '/fish-food': ['Aquarium Fish Food | Sweety Birds & Fishes', 'Discover fish food and feeding essentials for your aquarium.'],
      '/combo-packs': ['Aquarium Combo Packs | Sweety Birds & Fishes', 'Explore curated aquarium product bundles and combo packs.'],
      '/wholesale': ['Wholesale Aquarium Products | Sweety Birds & Fishes', 'Browse seller-listed wholesale aquarium products and bulk packs.'],
      '/about': ['About Sweety Birds & Fishes', 'Learn about Sweety Birds & Fishes and our aquarium product collection.'],
      '/contact': ['Contact Sweety Birds & Fishes', 'Contact Sweety Birds & Fishes for product enquiries and order support.'],
    };
    const [title, description] = pages[routePath] || (routePath.startsWith('/product/') ? ['Aquarium Product | Sweety Birds & Fishes', 'Explore product details, availability and ordering information at Sweety Birds & Fishes.'] : ['Sweety Birds & Fishes | Premium Aquarium Store', 'Shop guppies, fish food and curated aquarium products.']);
    document.title = title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute('content', description);
  }, [routePath]);

  // Route Router Logic
  const renderCurrentPage = () => {
    // 1. Admin
    if (isAdminView) {
      if (!isAdminSessionChecked) {
        return <div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">Checking secure seller session…</div>;
      }
      if (routePath === '/admin/login' || !isAdminAuthenticated) {
        return (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">Loading secure seller console…</div>}>
          <AdminLoginPage
            onLogin={() => {
              setIsAdminAuthenticated(true);
              handleNavigate('/admin');
            }}
            onBackToStore={() => handleNavigate('/')}
          />
          </Suspense>
        );
      }
      return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-500">Loading secure seller console…</div>}><AdminLayout onNavigateToStore={() => handleNavigate('/')} onLogout={() => { setIsAdminAuthenticated(false); handleNavigate('/admin/login'); }} /></Suspense>;
    }

    // 2. Product Detail: /product/:id
    if (routePath.startsWith('/product/')) {
      const productId = routePath.replace('/product/', '');
      const product = activeProduct?.id === productId
        ? activeProduct
        : productService.getProductById(productId);

      if (!product) return <div className="min-h-[50vh] flex items-center justify-center text-sm font-bold text-slate-500">Loading product…</div>;

      return (
        <ProductDetailPage
          product={product}
          onNavigate={handleNavigate}
          onRequireAuth={handleRequireAuth}
          onOpenProduct={handleOpenProduct}
          wishlistIds={wishlistIds}
        />
      );
    }

    // 3. Shop & dedicated category routes
    if (routePath === '/shop') {
      return (
        <ShopPage
          initialCategory="all"
          onOpenProduct={handleOpenProduct}
          onRequireAuth={handleRequireAuth}
          onOpenQuiz={() => setIsFindGuppyOpen(true)}
          wishlistIds={wishlistIds}
        />
      );
    }

    const categoryPageProps = {
      onOpenProduct: handleOpenProduct,
      onRequireAuth: handleRequireAuth,
      onNavigate: handleNavigate,
      wishlistIds,
    };
    if (routePath === '/guppies') return <GuppiesPage {...categoryPageProps} />;
    if (routePath === '/fish-food') return <FishFoodPage {...categoryPageProps} />;
    if (routePath === '/combo-packs') return <ComboPacksPage {...categoryPageProps} />;
    if (routePath === '/wholesale') return <WholesaleCategoryPage {...categoryPageProps} />;

    // 4. Cart
    if (routePath === '/cart') {
      return (
        <CartPage
          onNavigate={handleNavigate}
          onOpenProduct={handleOpenProduct}
          onRequireAuth={handleRequireAuth}
        />
      );
    }

    // 5. Checkout
    if (routePath === '/checkout') {
      return (
        <CheckoutPage
          onNavigate={handleNavigate}
          onRequireAuth={handleRequireAuth}
          onOrderCompleted={handleOrderCompleted}
        />
      );
    }

    // 6. Order Success: /order-success/:id
    if (routePath.startsWith('/order-success')) {
      const orderId = routePath.replace('/order-success/', '').replace('/order-success', '');
      const order = lastCompletedOrder || (orderId ? orderService.getOrderById(orderId) : undefined);

      if (order) {
        return <OrderSuccessPage order={order} onNavigate={handleNavigate} />;
      }
      // Fallback
      return <AccountPage initialTab="orders" onNavigate={handleNavigate} onOpenProduct={handleOpenProduct} onRequireAuth={handleRequireAuth} />;
    }

    // 7. Order Tracking: /track-order/:id
    if (routePath.startsWith('/track-order/')) {
      const orderId = routePath.replace('/track-order/', '');
      return <OrderTrackingPage orderId={orderId} onNavigate={handleNavigate} />;
    }

    // 8. Account: /account
    if (routePath.startsWith('/account')) {
      return (
        <AccountPage
          initialTab={(new URLSearchParams(currentRoute.split('?')[1] || '').get('tab') as 'profile' | 'orders' | 'wishlist' | 'addresses' | 'aquarium' | 'notifications' | 'support' | null) || 'orders'}
          onNavigate={handleNavigate}
          onOpenProduct={handleOpenProduct}
          onRequireAuth={handleRequireAuth}
        />
      );
    }

    // 9. Guppy Care Article: /guppy-care/:slug
    if (routePath.startsWith('/guppy-care/')) {
      const slug = routePath.replace('/guppy-care/', '');
      return <GuppyCareArticlePage slug={slug} onNavigate={handleNavigate} />;
    }

    // 10. Guppy Care Hub: /guppy-care
    if (routePath === '/guppy-care') {
      return (
        <GuppyCareHubPage
          onNavigate={handleNavigate}
          onSelectArticle={(slug) => handleNavigate(`/guppy-care/${slug}`)}
        />
      );
    }

    if (routePath === '/why-trust-us') {
      return <TrustPage onNavigate={handleNavigate} />;
    }

    // 12. About
    if (routePath === '/about') {
      return <AboutPage onNavigate={handleNavigate} />;
    }

    // 13. Contact
    if (routePath === '/contact') {
      return <ContactPage />;
    }

    // Default: Home Page
    return (
      <HomePage
        onNavigate={handleNavigate}
        onOpenProduct={handleOpenProduct}
        onRequireAuth={handleRequireAuth}
        onOpenQuiz={() => setIsFindGuppyOpen(true)}
        wishlistIds={wishlistIds}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FDFF] text-[#032B42] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Store Header (hidden on admin view) */}
      {!isAdminView && (
        <Header
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onNavigate={handleNavigate}
          currentRoute={currentRoute}
        />
      )}

      {!isAdminView && <AquaticPageDecor />}

      {/* Main Content Area */}
      <main key={routePath} className="page-route-enter flex-1 pb-16 md:pb-0 relative z-10">
        <Suspense fallback={<div className="min-h-[45vh] flex items-center justify-center text-sm font-bold text-slate-500">Loading…</div>}>
          {renderCurrentPage()}
        </Suspense>
      </main>

      {/* Store Footer (hidden on admin view) */}
      {!isAdminView && <Footer onNavigate={handleNavigate} />}

      {/* Mobile Bottom Navigation (hidden on admin view) */}
      {!isAdminView && (
        <MobileNavigation
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          if (authService.isAuthenticatedAndVerified()) {
            handleNavigate('/checkout');
          } else {
            handleRequireAuth('Please sign in and verify your email before checkout.');
          }
        }}
        onRequireAuth={handleRequireAuth}
      />

      {/* Global Product Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleOpenProduct}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        reasonMessage={authReason}
      />

      {/* Find Your Guppy Recommendation Modal */}
      <FindYourGuppyModal
        isOpen={isFindGuppyOpen}
        onClose={() => setIsFindGuppyOpen(false)}
        onSelectProduct={handleOpenProduct}
      />

      {/* Floating WhatsApp Quick Connect Button */}
      {!isAdminView && <WhatsAppFloating />}
    </div>
  );
}
