import { useState, useEffect, useRef, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Gem, MapPin, Store } from 'lucide-react';
import { useAutoScroll } from '../utils/useAutoScroll';

// Read pre-cached settings from inline script in index.html
const getCachedSettings = () => (window as any).__SETTINGS_CACHE__ || null;

const SignatureCard = ({ product, index }: { product: any, index: number, key?: string | number }) => {
  const signatureContent: Record<string, { tagline: string }> = {
    'Bloom': { tagline: 'The Essence of Spring' },
    'Intense': { tagline: 'Command the Room' },
    'Amber': { tagline: 'Addictive & Warm' },
    'Infina': { tagline: 'Smooth & Tropical' }
  };
  
  const content = signatureContent[product.name] || { tagline: product.name };
  const displayImage = product.image || product.images?.[0] || 'https://via.placeholder.com/800x1000';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 md:gap-12 py-12 md:py-16`}
    >
      {/* Image Side */}
      <div className="w-full md:w-1/2 flex justify-center items-center h-[300px] md:h-[450px] shrink-0">
        <Link to={`/product/${product.slug || product._id || product.id}`} className="relative block group h-full w-full flex items-center justify-center">
            <div 
              className="relative flex items-center justify-center p-0 h-full w-[240px] md:w-[400px] bg-transparent group-hover:scale-105 group-hover:-translate-y-4"
              style={{ transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }}
            >
              <img 
                src={displayImage} 
                alt={product.name} 
                className={`w-full h-full object-contain z-10 transition-all duration-500 ${product.images?.length > 1 ? 'group-hover:opacity-0' : ''}`}
                referrerPolicy="no-referrer" 
                loading={index === 0 ? "eager" : "lazy"}
                onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
              />
              
              {product.images?.length > 1 && (
                <img 
                  src={product.images[1]} 
                  alt={`${product.name} Hover`} 
                  className="w-full h-full object-contain absolute inset-0 m-auto z-10 opacity-0 group-hover:opacity-100 transition-all duration-500" 
                  referrerPolicy="no-referrer" 
                  loading="lazy"
                />
              )}
              
              {/* Stock Badge */}
              <div className="absolute top-4 right-4 z-20">
                {product.stock <= 0 ? (
                  <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] md:text-sm font-bold uppercase tracking-wider px-3 py-1.5 md:px-5 md:py-2.5 rounded-full shadow-lg border border-red-400">
                    Out of Stock
                  </span>
                ) : product.stock <= (product.lowStockThreshold || 5) ? (
                  <span className="bg-yellow-500/90 backdrop-blur-sm text-white text-[10px] md:text-sm font-bold uppercase tracking-wider px-3 py-1.5 md:px-5 md:py-2.5 rounded-full shadow-lg border border-yellow-400">
                    Low Stock
                  </span>
                ) : null}
              </div>
            </div>
        </Link>
      </div>
      
      {/* Description Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center md:justify-start">
        <div className="bg-white p-5 md:p-10 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.06)] border border-[#eeeeee] w-full max-w-lg flex flex-col justify-center text-center md:text-left transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)]">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#C9A96E] mb-2">{product.category}</p>
          <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#111111] mb-1 md:mb-2">{product.name}</h3>
          <h4 className="text-sm md:text-lg font-serif italic text-[#111111]/70 mb-3 md:mb-5">{content.tagline}</h4>
          <p className="text-xs md:text-[15px] text-[#555] mb-5 md:mb-8 leading-relaxed">{product.description}</p>
          <div className="flex justify-center md:justify-start mt-6 md:mt-10">
            <Link 
              to={`/product/${product.slug || product._id || product.id}`} 
              className="bg-[#111111] text-white w-full sm:w-auto px-10 py-3.5 rounded-lg text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] inline-block text-center"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  // Initialize hero images from cache immediately — no flicker
  const [settings, setSettings] = useState<any>(getCachedSettings() || {});
  const [heroImages, setHeroImages] = useState<string[]>(settings?.heroImages?.length ? settings.heroImages : (settings?.heroImage ? [settings.heroImage] : []));
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [comboImage, setComboImage] = useState(settings?.comboSectionImage || '');
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [bestSellerIndex, setBestSellerIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { scrollRef: testimonialsScrollRef, handlers: testimonialsScrollHandlers } = useAutoScroll(0.5);

  // CMS-driven state
  const [cmsSignatureProducts, setCmsSignatureProducts] = useState<{productId: string; tagline: string}[]>([]);
  const [cmsWhyRivore, setCmsWhyRivore] = useState<{icon: string; title: string; description: string}[]>([]);
  const [storeLocation, setStoreLocation] = useState({
    name: 'RIVORÉ Flagship Store',
    address: 'House 50, Road 11\nBlock F, Banani\nDhaka 1213, Bangladesh',
    hours: '11:00 AM - 9:00 PM (Everyday)',
    mapUrl: 'https://maps.google.com',
    image: ''
  });





  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const [productsRes, settingsRes] = await Promise.all([
          fetch('/api/products?limit=20'),
          fetch('/api/settings')
        ]);
        
        let allProducts: any[] = [];
        if (productsRes.ok) {
          const data = await productsRes.json();
          allProducts = data.products || data || [];
        }
        
        let sigProductIds: {productId: string; tagline: string}[] = [];
        let settingsData: any = null;
        if (settingsRes.ok) {
          settingsData = await settingsRes.json();
          setSettings(settingsData);
          if (settingsData.signatureProducts && settingsData.signatureProducts.length > 0) {
            sigProductIds = settingsData.signatureProducts;
            setCmsSignatureProducts(settingsData.signatureProducts);
          }
          if (settingsData.whyRivoreItems && settingsData.whyRivoreItems.length > 0) {
            setCmsWhyRivore(settingsData.whyRivoreItems);
          }
          if (settingsData.storeLocationImage) {
            setStoreLocation(prev => ({ ...prev, image: settingsData.storeLocationImage }));
          }
          
          if (settingsData.heroImages && settingsData.heroImages.length > 0) {
            setHeroImages(settingsData.heroImages);
          } else if (settingsData.heroImage) {
            setHeroImages([settingsData.heroImage]);
          }
        }
        
        // Signature products: use CMS selection if available, else fallback to hardcoded names
        let signature: any[] = [];
        if (sigProductIds.length > 0) {
          // Match by product ID from CMS
          for (const sp of sigProductIds) {
            const found = allProducts.find((p: any) => (p._id === sp.productId || p.id === sp.productId));
            if (found) {
              signature.push({ ...found, _cmsTagline: sp.tagline });
            }
          }
        }
        if (signature.length === 0) {
          const targetNames = ['Bloom', 'Intense', 'Amber', 'Infina'];
          signature = allProducts.filter((p: any) => targetNames.includes(p.name));
          signature.sort((a: any, b: any) => targetNames.indexOf(a.name) - targetNames.indexOf(b.name));
        }
        setFeaturedProducts(signature.length > 0 ? signature : allProducts.slice(0, 4));
        let bestSellerSource: any[] = [];
        
        // Best Sellers: use CMS selection if available
        if (settingsData?.bestSellerSliderItems && settingsData.bestSellerSliderItems.length > 0) {
          bestSellerSource = settingsData.bestSellerSliderItems.map((item: any) => {
            const found = allProducts.find((p: any) => (p._id === item.productId || p.id === item.productId));
            if (found) {
              return { ...found, _customImage: item.image, _customTitle: item.title };
            }
            return null;
          }).filter(Boolean);
        }

        if (bestSellerSource.length === 0) {
          bestSellerSource = allProducts.slice(0, 8);
        }

        let extended = [...bestSellerSource];
        while (extended.length > 0 && extended.length < 13) {
          extended = [...extended, ...bestSellerSource];
        }
        setBestSellers(extended.slice(0, 13));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials?active=true&limit=10');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials');
      }
    };

    fetchFeatured();
    fetchTestimonials();
  }, []);

  // Handle Screen Resize
  useEffect(() => {
    const updateCards = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateCards();
    window.addEventListener('resize', updateCards);
    return () => window.removeEventListener('resize', updateCards);
  }, []);

  // Setup auto-slide for hero carousel
  useEffect(() => {
    const defaultImages = [
      'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop'
    ];
    const displayHeroImages = heroImages.length > 0 ? heroImages : defaultImages;
    if (displayHeroImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setHeroBgIndex(prev => (prev + 1) % displayHeroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Setup auto-slide for best sellers carousel
  useEffect(() => {
    if (bestSellers.length <= 1) return;
    const interval = setInterval(() => {
      setBestSellerIndex(prev => (prev + 1) % bestSellers.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [bestSellers.length]);

  return (
    <div className="flex flex-col min-h-screen relative luxury-bg">
      {/* Floating ambient blobs */}
      <div className="luxury-blob luxury-blob-1" aria-hidden="true"></div>
      <div className="luxury-blob luxury-blob-2" aria-hidden="true"></div>
      <div className="luxury-blob luxury-blob-3" aria-hidden="true"></div>

      {/* Hero Section */}
      <section className="relative min-h-[85dvh] md:h-screen w-full flex items-center justify-center overflow-hidden hero-glow z-10 bg-[#ffffff] pt-[56px] md:pt-[64px] pb-20 md:pb-0">
        {/* Background carousel only */}
        {(heroImages.length > 0 ? heroImages : [
          'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop'
        ]).map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Luxury Perfume"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ 
              opacity: idx === heroBgIndex ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out'
            }}
            referrerPolicy="no-referrer"
            loading={idx === 0 ? "eager" : "lazy"}
          />
        ))}
        {(settings?.heroHeading || settings?.heroSubheading || settings?.heroButtonText) && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="relative z-20 text-center px-5 md:px-12 py-8 md:py-10 max-w-4xl mx-auto backdrop-blur-md bg-white/40 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[2rem] md:rounded-[2.5rem] drop-shadow-xl"
          >
            {settings?.heroHeading && (
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-6xl font-serif font-bold mb-3 md:mb-4 tracking-tight leading-tight"
                style={{ color: settings.heroHeadingColor || '#111111' }}
              >
                {settings.heroHeading}
              </motion.h1>
            )}
            {settings?.heroSubheading && (
              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.8 }}
                className="text-base md:text-xl mb-8 font-medium max-w-2xl mx-auto"
                style={{ color: settings.heroSubheadingColor || '#333333' }}
              >
                {settings.heroSubheading}
              </motion.p>
            )}
            {(settings?.heroButtonText || settings?.heroButtonLink) && (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                {settings?.heroButtonText && settings?.heroButtonLink && (
                  <Link
                    to={settings.heroButtonLink}
                    className="px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                    style={{ 
                      backgroundColor: settings.heroButtonBgColor || '#111111', 
                      color: settings.heroButtonTextColor || '#ffffff' 
                    }}
                  >
                    {settings.heroButtonText}
                  </Link>
                )}
                {/* Secondary Button logic kept from original if combo features still needed alongside main CMS button */}
                <Link
                  to="/combos"
                  className="bg-white/60 backdrop-blur-sm border-2 border-[#111111]/10 text-[#111111] px-8 py-4 rounded-full font-bold text-lg hover:border-[#111111]/30 hover:bg-white/80 hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                >
                  Explore Combos
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </section>

      {/* Weekly Best Sellers Carousel */}
      {bestSellers.length > 0 && (() => {
        const goNext = () => setBestSellerIndex(prev => (prev + 1) % bestSellers.length);
        const goPrev = () => setBestSellerIndex(prev => (prev - 1 + bestSellers.length) % bestSellers.length);
        return (
        <section className="relative w-full z-20 overflow-hidden bg-white flex flex-col justify-center py-10 md:py-16">
          <div className="container mx-auto px-4 z-20 relative">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#111111]">Weekly Best Sellers</h2>
            </div>
          </div>

          <div className="relative w-full">
            {/* Left Arrow */}
            <button onClick={goPrev} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/60 backdrop-blur-md border border-black/10 flex items-center justify-center hover:bg-white/90 hover:scale-110 transition-all duration-300 shadow-lg" aria-label="Previous">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {/* Right Arrow */}
            <button onClick={goNext} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[60] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/60 backdrop-blur-md border border-black/10 flex items-center justify-center hover:bg-white/90 hover:scale-110 transition-all duration-300 shadow-lg" aria-label="Next">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>

            <div
              className="relative h-[340px] md:h-[500px] flex items-center justify-center w-full mx-auto overflow-visible px-0 select-none touch-pan-y"
              onMouseDown={(e) => {
                const startX = e.clientX; let moved = false;
                const onMove = (ev: MouseEvent) => { if (!moved && Math.abs(ev.clientX - startX) > 40) { moved = true; ev.clientX - startX > 0 ? goPrev() : goNext(); } };
                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX; let moved = false;
                const onMove = (ev: TouchEvent) => { if (!moved && Math.abs(ev.touches[0].clientX - startX) > 40) { moved = true; ev.touches[0].clientX - startX > 0 ? goPrev() : goNext(); } };
                const onEnd = () => { document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
                document.addEventListener('touchmove', onMove); document.addEventListener('touchend', onEnd);
              }}
            >
              {bestSellers.map((product, i) => {
                const N = bestSellers.length;
                let rel = i - bestSellerIndex;
                if (rel < -Math.floor(N / 2)) rel += N;
                if (rel > Math.floor(N / 2)) rel -= N;
                const displayImage = product.image || product.images?.[0] || '/apple-touch-icon.png';
                const cardBg = product.images?.[1] || 'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=800&auto=format&fit=crop';
                const abs = Math.abs(rel);
                const dir = rel > 0 ? 1 : -1;
                const maxV = Math.floor(N / 2);
                const sc = abs === 0 ? 1 : Math.max(0.3, 1 - abs * 0.12);
                const off = abs === 0 ? 0 : (isMobile ? 115 : 220) + (abs - 1) * (isMobile ? 95 : 170);
                const style: CSSProperties = {
                  position: 'absolute', top: '10px', left: '50%',
                  width: isMobile ? '210px' : '340px', height: isMobile ? '300px' : '480px',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'center center',
                  transform: abs > maxV ? `translateX(calc(-50% + ${dir * (off + 200)}px)) scale(0.2)` : `translateX(calc(-50% + ${dir * off}px)) scale(${sc})`,
                  zIndex: abs > maxV ? 0 : 50 - abs,
                  opacity: abs > maxV ? 0 : (abs > (isMobile ? 3 : 5) ? Math.max(0, 1 - (abs - (isMobile ? 3 : 5)) * 0.4) : 1),
                  pointerEvents: abs > maxV ? 'none' : 'auto',
                  boxShadow: abs === 0 ? '0 25px 50px -12px rgba(0,0,0,0.25)' : '0 10px 30px -10px rgba(0,0,0,0.12)',
                  filter: abs === 0 ? 'brightness(1)' : `brightness(${Math.max(0.6, 1 - abs * 0.1)})`,
                };
                return (
                  <div key={`bs-${i}`} className="rounded-2xl overflow-hidden bg-white group border border-[#eeeeee]" style={style} onClick={() => { if (rel !== 0) setBestSellerIndex(i); }}>
                    <Link to={`/product/${product.slug || product._id || product.id}`} className="block w-full h-full relative" onClick={(e) => rel !== 0 && e.preventDefault()}>
                      <img src={cardBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 md:opacity-[0.12] transition-opacity duration-500 group-hover:opacity-20" loading="lazy" />
                      <div className="absolute inset-0 flex flex-col p-6 z-10 bg-gradient-to-t from-white/95 via-white/50 to-white/95">
                        <h3 className="text-base md:text-2xl font-serif font-bold text-[#111] text-center mb-auto mt-2 tracking-wide">{product._customTitle || product.name}</h3>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64">
                          <img src={product._customImage || displayImage} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500" onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }} />
                        </div>
                        <div className="mt-auto text-center z-20">
                          <span className={`inline-block bg-[#C9A96E] text-white px-5 py-2.5 md:px-8 md:py-3.5 rounded-lg text-sm md:text-base font-bold shadow-md hover:bg-[#b0915a] hover:scale-105 transition-all duration-300 ${rel !== 0 ? 'pointer-events-none' : ''}`}>Buy Now</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center items-center gap-2 mt-6 pb-4 relative z-20">
            {Array.from(new Set(bestSellers.map(p => p._id || p.id))).map((_, idx, arr) => {
              const isActive = (bestSellerIndex % arr.length) === idx;
              return <button key={`dot-${idx}`} onClick={() => setBestSellerIndex(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? 'w-8 bg-[#111]' : 'w-2 bg-[#ccc] hover:bg-[#999]'}`} aria-label={`Go to ${idx + 1}`} />;
            })}
          </div>
        </section>
        );
      })()}

      {/* Signature Collection */}
      <section className="relative z-30 bg-[#fbf9ff] py-16 md:py-24 border-t border-[#eeeeee]">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#111111] mb-4">Signature Collection</h2>
          <p className="text-[#555] max-w-2xl mx-auto text-lg leading-relaxed">
            Explore our most loved fragrances, handpicked for their unique notes and lasting impression.
          </p>
        </div>

        <div className="container mx-auto px-6 md:px-10 lg:px-16">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => (
              <SignatureCard 
                key={product._id || product.id}
                product={product}
                index={index}
              />
            ))
          ) : (
            <div className="w-full py-20 flex items-center justify-center text-muted-foreground">
              No signature products available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Why Rivore Intro */}
      <section className="relative z-40 bg-white pt-16 md:pt-20 pb-6 md:pb-10 border-t border-[#f0f0f0]">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#111111] mb-4">Why Rivore?</h2>
          <p className="text-[#555] max-w-2xl mx-auto text-lg ranking-wide leading-relaxed">Experience the difference of true luxury.</p>
        </div>
      </section>

      {/* Why Rivore Cards (CMS-driven) */}
      {(() => {
        const whyRivoreFeatures = cmsWhyRivore.length > 0 ? cmsWhyRivore.map(item => {
          const IconMap: Record<string, any> = { Clock, Sparkles, Gem };
          const IconComp = IconMap[item.icon] || Sparkles;
          return { icon: IconComp, title: item.title, desc: item.description };
        }) : [
          { icon: Clock, title: 'Long-Lasting Fragrance', desc: 'Formulated with high-quality oils to ensure your scent stays with you from morning to night.' },
          { icon: Sparkles, title: 'Premium Inspired Scents', desc: 'Crafted by master perfumers to rival the world\'s most exclusive designer fragrances.' },
          { icon: Gem, title: 'Accessible Elegance', desc: 'We believe everyone deserves to smell incredible without the exorbitant luxury price tag.' }
        ];

        return (
          <>
            <section className="w-full hidden md:flex flex-col justify-center z-40 py-12" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 50%, #f3efff 100%)' }}>
              <div className="container mx-auto px-6 md:px-10 lg:px-16">
                <div className="grid grid-cols-3 gap-8">
                  {whyRivoreFeatures.map((feature, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                      className="relative p-8 rounded-3xl text-center flex flex-col items-center group cursor-default overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(243,239,255,0.5) 50%, rgba(237,230,255,0.4) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(109,40,217,0.1)',
                        boxShadow: '0 8px 32px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(109,40,217,0.12), inset 0 1px 0 rgba(255,255,255,0.8)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(109,40,217,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.6)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(109,40,217,0.1)';
                      }}
                    >
                      {/* Glass shine overlay */}
                      <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }} />
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.08) 0%, rgba(201,169,110,0.08) 100%)', border: '1px solid rgba(109,40,217,0.1)' }}>
                        <feature.icon className="w-7 h-7 text-[#6d28d9]" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-[#111111] mb-3 relative">{feature.title}</h3>
                      <p className="text-[#555] text-base leading-relaxed relative">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Mobile: vertical stacked cards */}
            <section className="w-full flex md:hidden flex-col z-40 py-8 px-6 gap-5" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8f5ff 50%, #f3efff 100%)' }}>
              {whyRivoreFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative p-6 rounded-3xl text-center flex flex-col items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(243,239,255,0.55) 50%, rgba(237,230,255,0.45) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(109,40,217,0.1)',
                    boxShadow: '0 8px 32px rgba(109,40,217,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  {/* Glass shine overlay */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-3xl" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.08) 0%, rgba(201,169,110,0.08) 100%)', border: '1px solid rgba(109,40,217,0.1)' }}>
                    <feature.icon className="w-6 h-6 text-[#6d28d9]" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#111111] mb-2 relative">{feature.title}</h3>
                  <p className="text-[#555] text-sm leading-relaxed relative">{feature.desc}</p>
                </motion.div>
              ))}
            </section>
          </>
        );
      })()}

      {/* Combo Highlights */}
      <section className="relative w-full flex items-center z-50 border-t border-[#e0e0e0] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] py-16 md:py-24" style={{ background: '#faf8ff' }}>
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-4 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-[#111111]">The Perfect Pairings</h2>
              <p className="text-lg text-[#555555] mb-10 font-light leading-relaxed max-w-lg mx-auto md:mx-0">
                Discover our curated combo sets. Whether you're looking for the ultimate grooming kit, a luxurious collection, or a matching couple's set, we have the perfect bundle for you at an exceptional value.
              </p>
              <Link
                to="/combos"
                className="inline-block btn-primary px-10 py-4 rounded-full"
              >
                Explore Collections
              </Link>
            </div>
            <div className="md:w-1/2 relative flex items-center justify-center">
               <div className="absolute inset-0 bg-[#f8f5ff] blur-3xl rounded-full -z-10"></div>
              <img 
                src={comboImage || 'https://images.unsplash.com/photo-1615486171448-4df171221b06?q=80&w=800&auto=format&fit=crop'} 
                alt="Rivore Combo Collection" 
                className="rounded-3xl object-cover w-full max-w-md aspect-square shadow-lg border border-[#eeeeee]" 
                referrerPolicy="no-referrer" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Premium Luxury Testimonials */}
      <section 
        className="py-14 md:py-24 relative z-60 text-center bg-white border-t border-[#eeeeee] shadow-[0_-20px_50px_rgba(0,0,0,0.05)]"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(109,40,217,0.08), transparent 60%),
            linear-gradient(to bottom, #ffffff, #f5f3ff)
          `
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-breathe"></div>
        
        <div className="container mx-auto px-6 md:px-10 lg:px-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#111111] mb-4">What Our Clients Say</h2>
            <p className="text-[#555] max-w-2xl mx-auto text-lg leading-relaxed mb-16 px-4">
              The essence of Rivor&eacute; is best reflected in the voices of those who wear our creations.
            </p>
          </motion.div>
        </div>
          
        {testimonials.length > 0 ? (
          <div className="relative w-full pt-12 pb-4 z-10 overflow-hidden">
              <div 
                className="flex w-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing gap-6 px-6 pt-[35px]"
                ref={testimonialsScrollRef}
                {...testimonialsScrollHandlers}
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {[...testimonials, ...testimonials].map((testimonial, i) => (
                  <div 
                    key={testimonial._id ? `${testimonial._id}-${i}` : i} 
                    className="w-[300px] md:w-[450px] shrink-0 box-border relative group"
                  >
                    {/* Balanced Glassmorphic Card */}
                    <div className="relative pt-[50px] px-5 md:px-8 pb-6 md:pb-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-[#eeeeee] flex flex-col items-center justify-center text-center gap-3 min-h-[240px] md:min-h-[260px] h-full">

                      {/* Glass Reflection Overlay */}
                      <div 
                        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
                        }}
                      ></div>

                      {/* Huge Background Quote Icon */}
                      <div className="absolute top-10 left-8 text-8xl md:text-9xl font-serif text-black opacity-[0.08] leading-none select-none pointer-events-none">
                        "
                      </div>

                      {/* Overlapping Avatar */}
                      <div className="absolute -top-[30px] left-1/2 -translate-x-1/2 z-10 w-[60px] h-[60px]">
                        {testimonial.image ? (
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            loading="lazy" 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }} 
                            className="w-full h-full rounded-full object-cover border-[3px] border-white bg-white" 
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-[color:var(--color-brand-wine)] to-[#4A1D54] text-white flex items-center justify-center text-2xl font-bold font-serif border-[3px] border-white">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Middle Content */}
                      <div className="flex justify-center mb-2 mt-2 relative z-10">
                        {[...Array(testimonial.rating)].map((_, j) => (
                          <svg key={`filled-${j}`} className="w-5 h-5 text-[#C9A96E] drop-shadow-[0_0_4px_rgba(201,169,110,0.4)] fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        {[...Array(5 - testimonial.rating)].map((_, j) => (
                          <svg key={`empty-${j}`} className="w-5 h-5 text-gray-300/50 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      {/* Testimonial Quote */}
                      <p className="text-[#374151] italic md:text-lg font-light leading-relaxed relative z-10 flex-grow">
                         &ldquo;{testimonial.message}&rdquo;
                      </p>
                      
                      {/* Author Name */}
                      <div className="relative z-10 mt-2">
                        <p className="font-semibold text-[#111827] tracking-wide text-sm font-sans">
                          {testimonial.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No testimonials available yet.</p>
          )}
      </section>

      {/* Store Location */}
      <section className="py-16 md:py-28 relative z-[65] bg-white border-t border-[#eeeeee]">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-10 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#111111] mb-4">Visit Us</h2>
            <p className="text-[#555] max-w-2xl mx-auto text-lg leading-relaxed">
              Experience our creations in person at our flagship store.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-12 lg:gap-20">
            {/* Left side: Card */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end relative">
              <div className="relative bg-[#f5f0ff] p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-[480px] shadow-[0_20px_60px_rgba(109,40,217,0.06)] ml-0 md:ml-10 mt-8 md:mt-0">
                {/* Uplifting MAP PIN */}
                <div className="absolute -top-6 left-4 md:-top-10 md:-left-10 w-[60px] h-[60px] md:w-[88px] md:h-[88px] bg-white rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.08)] border-4 border-[#f5f0ff] z-10 transform -rotate-6 transition-all duration-500 hover:rotate-0 hover:-translate-y-3 hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)]">
                  <MapPin className="w-8 h-8 md:w-10 md:h-10 text-black fill-transparent stroke-[1.5]" />
                </div>
                
                <h3 className="text-2xl md:text-[28px] font-serif font-bold text-[#111111] mb-5 mt-2 leading-tight">{storeLocation.name}</h3>
                <p className="text-[#444] text-[15px] md:text-lg leading-relaxed md:leading-[1.8] mb-8 font-light">
                  {storeLocation.address.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < storeLocation.address.split('\n').length - 1 && <br />}</span>
                  ))}
                </p>
                <div className="h-[1px] w-12 bg-black/10 mb-8"></div>
                <p className="text-[#444] text-[13px] md:text-[15px] leading-relaxed mb-10 font-light">
                  <span className="font-semibold text-[#111] uppercase tracking-widest text-[11px] md:text-xs">Hours</span><br /> 
                  {storeLocation.hours}
                </p>
                
                <a 
                  href={storeLocation.mapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 md:px-10 py-3.5 md:py-4 border-[1.5px] border-black text-black font-semibold text-[11px] md:text-xs uppercase tracking-[0.15em] rounded-full hover:bg-black hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  View on map
                </a>
              </div>
            </div>

            {/* Right side: Transparent Image Hover Effect */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
              <div className="relative w-full max-w-[500px] h-[350px] md:h-[450px] flex items-center justify-center group" style={{ perspective: '1000px' }}>
                <div className="absolute inset-0 bg-[#f8f5ff] blur-3xl rounded-full opacity-60 -z-10 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700"></div>
                
                <img 
                  src={storeLocation.image || '/store-transparent.png'} 
                  alt="Rivore Store" 
                  className="object-contain w-full h-full transform transition-all duration-700 ease-out group-hover:-translate-y-6 group-hover:scale-105"
                  onError={(e) => { 
                    (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dum9idrbx/image/upload/v1700000000/placeholder-store.png';
                    (e.target as HTMLImageElement).style.opacity = '0.05';
                  }}
                />
                
                {/* Fallback prompt text if image fails to load */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none opacity-[0.15] z-[-1] text-center">
                  <Store className="w-24 h-24 mb-4 text-black" strokeWidth={1} />
                  <span className="text-black font-serif italic text-lg uppercase tracking-widest">Store Showcase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
