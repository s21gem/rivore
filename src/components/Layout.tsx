import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, Search, User, Gift, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';
import CartSidebar from './CartSidebar';

const FALLBACK_LOGO_DARK = 'https://res.cloudinary.com/dum9idrbx/image/upload/q_auto/f_auto/v1776089332/Rivor%C3%A9_fhepjw.png';
const FALLBACK_LOGO_WHITE = 'https://res.cloudinary.com/dum9idrbx/image/upload/q_auto/f_auto/v1776089332/Rivor%C3%A9_fhepjw.png';

export default function Layout() {
  const { items: cartItems, isCartOpen, setCartOpen } = useCartStore();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [logoDark, setLogoDark] = useState(FALLBACK_LOGO_DARK);
  const [logoWhite, setLogoWhite] = useState(FALLBACK_LOGO_WHITE);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerMessages, setBannerMessages] = useState<string[]>([
    'Free Shipping on orders over ৳5000',
    'Visit our new flagship store at Banani',
    'Use code RIVORE10 for 10% off',
    'Luxury Fragrances Reimagined'
  ]);
  const [socialLinks, setSocialLinks] = useState({ facebook: '', instagram: '', tiktok: '', whatsapp: '' });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch settings (logos, banner, social links)
  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.logoDark) setLogoDark(data.logoDark);
          if (data.logoWhite) setLogoWhite(data.logoWhite);
          if (typeof data.bannerEnabled === 'boolean') setBannerEnabled(data.bannerEnabled);
          if (data.bannerMessages && data.bannerMessages.length > 0) setBannerMessages(data.bannerMessages);
          setSocialLinks({
            facebook: data.socialFacebook || '',
            instagram: data.socialInstagram || '',
            tiktok: data.socialTiktok || '',
            whatsapp: data.socialWhatsapp || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Desktop navbar: dark logo when at top (light bg bleed-through), white logo after scroll (dark navbar)
  const navbarLogo = scrolled ? logoWhite : logoDark;

  const isCheckout = location.pathname === '/checkout';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      {/* Top Notification Banner (Non-Sticky, CMS-driven) */}
      {location.pathname === '/' && bannerEnabled && bannerMessages.length > 0 && (
        <div className="w-full bg-gradient-to-r from-white via-[#f0e6ff] to-white border-b border-[#ebdfff] overflow-hidden flex items-center h-8 md:h-10 relative z-[60]">
          <div className="animate-marquee">
            <div className="flex items-center shrink-0">
               {bannerMessages.map((msg, i) => (
                 <span key={`a-${i}`} className="mx-4 md:mx-8 text-[10px] md:text-xs font-semibold text-[#6d28d9] dark:text-white tracking-[0.1em] uppercase whitespace-nowrap">• {msg}</span>
               ))}
            </div>
            <div className="flex items-center shrink-0">
               {bannerMessages.map((msg, i) => (
                 <span key={`b-${i}`} className="mx-4 md:mx-8 text-[10px] md:text-xs font-semibold text-[#6d28d9] dark:text-white tracking-[0.1em] uppercase whitespace-nowrap">• {msg}</span>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isCheckout 
          ? 'bg-white text-black border-b border-[#eee] block' 
          : `hidden md:block ${scrolled ? 'bg-[#0B0B0B]/95 backdrop-blur-xl border-b border-white/10 shadow-sm' : 'bg-[#0B0B0B]/80 backdrop-blur-md border-b border-white/5'}`
      }`}>
        <div className={`container mx-auto flex items-center justify-between ${isCheckout ? 'h-[60px] px-4' : 'h-16 px-6'}`}>
          
          {/* Mobile Hamburger (Only visible on Checkout Mobile) */}
          {isCheckout && (
            <div className="md:hidden flex items-center">
              <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2 text-black hover:bg-gray-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Logo — forces fallback logo white if not checkout */}
          <Link to="/" className="hover:opacity-80 transition-opacity flex-1 md:flex-none flex justify-center md:justify-start">
            <img
              src={isCheckout ? logoDark : logoWhite}
              alt="Rivore"
              className={`${isCheckout ? 'h-5 md:h-6' : 'h-6'} w-auto transition-opacity duration-300`}
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Desktop Nav (Hidden on mobile) */}
          <nav className={`hidden md:flex items-center space-x-10 ${isCheckout ? 'text-black font-semibold' : 'text-white/80'}`}>
            <Link to="/" className={`text-[13px] uppercase tracking-[0.15em] font-medium hover:text-${isCheckout ? 'black' : 'white'} transition-colors`}>Home</Link>
            <Link to="/shop" className={`text-[13px] uppercase tracking-[0.15em] font-medium hover:text-${isCheckout ? 'black' : 'white'} transition-colors`}>Shop</Link>
            <Link to="/combos" className={`text-[13px] uppercase tracking-[0.15em] font-medium hover:text-${isCheckout ? 'black' : 'white'} transition-colors`}>Combos</Link>
            <Link to="/about" className={`text-[13px] uppercase tracking-[0.15em] font-medium hover:text-${isCheckout ? 'black' : 'white'} transition-colors`}>About</Link>
            <Link to="/contact" className={`text-[13px] uppercase tracking-[0.15em] font-medium hover:text-${isCheckout ? 'black' : 'white'} transition-colors`}>Contact</Link>
          </nav>

          {/* Actions (Hidden on mobile checkout to keep it clean, active otherwise) */}
          <div className={`items-center space-x-6 ${isCheckout ? 'hidden md:flex' : 'flex'}`}>
            <button 
              onClick={() => setCartOpen(true)}
              className="relative group hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <ShoppingBag className={`w-5 h-5 group-hover:scale-105 transition-all duration-300 stroke-[1.5] ${isCheckout ? 'text-black hover:text-[#C9A96E]' : 'text-white/80 hover:text-[#C9A96E]'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#C9A96E] text-[#1A061C] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link to="/login" className="relative group hover:opacity-100 transition-opacity flex items-center justify-center">
              <User className={`w-5 h-5 group-hover:scale-105 transition-all duration-300 stroke-[1.5] ${isCheckout ? 'text-black hover:text-[#C9A96E]' : 'text-white/80 hover:text-[#C9A96E]'}`} />
            </Link>
          </div>
          
          {/* Mobile Right Spacer for centering if checkout */}
          {isCheckout && <div className="md:hidden w-10"></div>}
        </div>
      </header>

      {/* Slide Menu Overlay */}
      {isCheckout && menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[150] md:hidden" 
          onClick={() => setMenuOpen(false)} 
        />
      )}

      {/* Slide Menu Panel */}
      {isCheckout && (
        <div className={`fixed top-0 left-0 h-full w-[75%] bg-white z-[200] transform transition-transform duration-300 md:hidden shadow-2xl flex flex-col ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 h-[60px]">
            <img src={logoDark} alt="Rivore" className="h-6 w-auto" />
            <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col py-6 px-6 space-y-8 overflow-y-auto">
            <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center space-x-4 text-gray-800 font-medium">
              <Home className="w-5 h-5 text-gray-400" />
              <span>Home</span>
            </Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="flex items-center space-x-4 text-gray-800 font-medium">
              <Search className="w-5 h-5 text-gray-400" />
              <span>Shop</span>
            </Link>
            <Link to="/combos" onClick={() => setMenuOpen(false)} className="flex items-center space-x-4 text-gray-800 font-medium">
              <Gift className="w-5 h-5 text-gray-400" />
              <span>Combo</span>
            </Link>
            <button 
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(true);
              }} 
              className="flex items-center space-x-4 text-gray-800 font-medium w-full text-left"
            >
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <span>Cart</span>
            </button>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center space-x-4 text-gray-800 font-medium">
              <User className="w-5 h-5 text-gray-400" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-grow md:pb-0 ${isCheckout ? 'pb-0' : 'pb-20 pt-0'}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - HIDDEN ON CHECKOUT */}
      {!isCheckout && (
        <nav 
          className="md:hidden [.hide-mobile-nav_&]:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white text-black border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-around px-2 h-16 pt-1">
            <Link to="/combos" className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${location.pathname.startsWith('/combo') ? 'text-[color:var(--color-brand-wine)] drop-shadow-[0_0_8px_rgba(43,18,39,0.2)]' : 'text-gray-500'}`}>
              <Gift className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[11px] font-semibold">Combo</span>
            </Link>
            <Link to="/shop" className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${location.pathname === '/shop' ? 'text-[color:var(--color-brand-wine)] drop-shadow-[0_0_8px_rgba(43,18,39,0.2)]' : 'text-gray-500'}`}>
              <Search className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[11px] font-semibold">Shop</span>
            </Link>

            {/* Center Logo Button */}
            <div className="relative -top-6">
              <Link to="/" className={`flex items-center justify-center w-16 h-16 rounded-full shadow-[0_-4px_20px_rgba(0,0,0,0.1)] bg-white transform transition-all active:scale-95 hover:shadow-2xl overflow-hidden border-[3px] border-white ${location.pathname === '/' ? 'shadow-[0_0_15px_rgba(43,18,39,0.3)]' : ''}`}>
                <img src="/apple-touch-icon.png" alt="Rivore" className="w-full h-full object-cover" />
              </Link>
            </div>

            <button 
              onClick={() => setCartOpen(true)}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1 relative transition-colors ${isCartOpen ? 'text-[color:var(--color-brand-wine)] drop-shadow-[0_0_8px_rgba(43,18,39,0.2)]' : 'text-gray-500'}`}
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[color:var(--color-brand-wine)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold">Cart</span>
            </button>
            <Link to="/login" className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${location.pathname.startsWith('/login') ? 'text-[color:var(--color-brand-wine)] drop-shadow-[0_0_8px_rgba(43,18,39,0.2)]' : 'text-gray-500'}`}>
              <User className="w-6 h-6 stroke-[1.5]" />
              <span className="text-[11px] font-semibold">Profile</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Footer — premium minimal black background */}
      <footer className="bg-[#0B0B0B] text-white py-16 border-t border-white/5 pb-32 md:pb-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <div className="mb-6">
              <img src={logoWhite} alt="Rivore" className="h-7 w-auto" referrerPolicy="no-referrer" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
              Premium perfumes crafted for elegance and luxury. Discover your signature scent.
            </p>
            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#C9A96E] hover:bg-[#C9A96E]/10 transition-all" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#C9A96E] hover:bg-[#C9A96E]/10 transition-all" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#C9A96E] hover:bg-[#C9A96E]/10 transition-all" aria-label="TikTok">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 00-.81-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.93a8.27 8.27 0 004.76 1.5V7a4.84 4.84 0 01-1-.31z"/></svg>
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#C9A96E] hover:bg-[#C9A96E]/10 transition-all" aria-label="WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-medium mb-6 text-white">Shop</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to="/shop?category=Male" className="hover:text-[#C9A96E] transition-colors">Male Collection</Link></li>
              <li><Link to="/shop?category=Female" className="hover:text-[#C9A96E] transition-colors">Female Collection</Link></li>
              <li><Link to="/shop?category=Couple" className="hover:text-[#C9A96E] transition-colors">Couple Sets</Link></li>
              <li><Link to="/combos" className="hover:text-[#C9A96E] transition-colors">Exclusive Combos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-medium mb-6 text-white">Company</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to="/about" className="hover:text-[#C9A96E] transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-[#C9A96E] transition-colors">Contact Us</Link></li>
              <li><Link to="/track" className="hover:text-[#C9A96E] transition-colors">Track Order</Link></li>
              <li><Link to="/return-policy" className="hover:text-[#C9A96E] transition-colors">Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-medium mb-6 text-white">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
              const email = input?.value?.trim();
              if (email && email.includes('@')) {
                toast.success('Thank you for subscribing! 🎉');
                input.value = '';
              } else {
                toast.error('Please enter a valid email address.');
              }
            }}>
              <div className="flex border-b border-white/20 pb-2 transition-colors focus-within:border-[#C9A96E]">
                <input type="email" placeholder="Email address" className="bg-transparent w-full text-white placeholder:text-gray-500 focus:outline-none text-sm font-light" />
                <button type="submit" className="text-[10px] uppercase tracking-[0.15em] font-medium text-gray-300 hover:text-[#C9A96E] transition-colors">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col items-center md:flex-row md:justify-between text-[10px] text-gray-500 font-light tracking-[0.1em] uppercase text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} RIVORE. ALL RIGHTS RESERVED.</p>
          <p className="mt-4 md:mt-0">CRAFTED WITH ELEGANCE</p>
        </div>
      </footer>
      <CartSidebar />
    </div>
  );
}

