import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { trackAddToCart, trackViewContent } from '../components/MetaPixel';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const { settings, fetchSettings } = useSettingsStore();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const productSectionRef = useRef<HTMLDivElement>(null);

  const prevImage = () => {
    if (product?.images?.length) {
      setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    if (product?.images?.length) {
      setActiveImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Set default size if available
          let defaultSize = '';
          if (data.sizes) {
            if (data.sizes['50ml']) defaultSize = '50ml';
            else if (data.sizes['30ml']) defaultSize = '30ml';
            else if (data.sizes['10ml']) defaultSize = '10ml';
            else defaultSize = Object.keys(data.sizes)[0] || '';
            setSelectedSize(defaultSize);
          }

          // Track ViewContent
          const price = data.sizes ? data.sizes[defaultSize] : data.price;
          trackViewContent(data.name, data.category, price);

          // Fetch related products - priority: same category, then random
          let relatedRes = await fetch(`/api/products?category=${data.category}&limit=12`);
          let filtered: any[] = [];

          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            filtered = (relatedData.products || relatedData).filter((p: any) => p._id !== data._id && p.id !== data.id);
          }

          // If not enough from same category, fill with random products
          if (filtered.length < 6) {
            const fallbackRes = await fetch(`/api/products?limit=12`);
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              const existing = new Set(filtered.map((p: any) => p._id || p.id));
              existing.add(data._id || data.id);
              const extras = (fallbackData.products || fallbackData).filter((p: any) => !existing.has(p._id || p.id));
              filtered = [...filtered, ...extras];
            }
          }

          // Shuffle for variety, then limit to 6
          filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 6);
          setRelatedProducts(filtered);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Primary: IntersectionObserver on the product section
  useEffect(() => {
    if (!productSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(productSectionRef.current);
    return () => observer.disconnect();
  }, [product]);

  // Fallback: scroll-based detection in case observer doesn't fire
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleQuickAddToCart = useCallback((relatedProduct: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = relatedProduct.sizes ? (Object.keys(relatedProduct.sizes).find(s => s === '50ml') || Object.keys(relatedProduct.sizes)[0]) : '';
    const originalPrice = relatedProduct.sizes ? relatedProduct.sizes[defaultSize] : relatedProduct.price;
    const discountPct = relatedProduct.discountAmount || 0;
    const finalPrice = discountPct > 0 ? Math.round(originalPrice * (1 - discountPct / 100)) : originalPrice;
    addItem({
      id: `${relatedProduct._id || relatedProduct.id}-${defaultSize}`,
      productId: relatedProduct._id || relatedProduct.id,
      size: defaultSize,
      name: `${relatedProduct.name}${defaultSize ? ` (${defaultSize})` : ''}`,
      price: finalPrice,
      quantity: 1,
      image: relatedProduct.image || relatedProduct.images?.[0] || '',
      type: 'product',
      stock: relatedProduct.stock,
    });
    trackAddToCart(relatedProduct.name, relatedProduct.category, finalPrice);
    toast.success(`${relatedProduct.name} added to cart`);
    setCartOpen(true);
  }, [addItem, setCartOpen]);



  const handleAddToCart = () => {
    if (product) {
      const originalPrice = product.sizes ? product.sizes[selectedSize] : product.price;
      const discountPct = product.discountAmount || 0;
      const finalPrice = discountPct > 0 ? Math.round(originalPrice * (1 - discountPct / 100)) : originalPrice;
      addItem({
        id: `${product._id || product.id}-${selectedSize}`,
        productId: product._id || product.id,
        size: selectedSize,
        name: `${product.name} (${selectedSize})`,
        price: finalPrice,
        quantity,
        image: product.image || product.images?.[0] || '',
        type: 'product',
        stock: product.stock,
      });
      trackAddToCart(product.name, product.category, finalPrice * quantity);
      toast.success(`${quantity}x ${product.name} (${selectedSize}) added to cart`);
      setCartOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-3xl font-serif font-bold text-primary mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-accent underline">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 overflow-x-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-[1400px]">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span className="mx-2">/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-primary">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div ref={productSectionRef} className="flex flex-col md:flex-row gap-12">
          {/* Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square w-full max-w-[350px] md:max-w-[400px] lg:max-w-[450px] mx-auto flex items-center justify-center p-2 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-[#faf8ff] border border-[#eeeeee] group"
            >
              <div className="absolute inset-0 m-auto w-2/3 h-2/3 bg-white blur-[80px] rounded-full pointer-events-none"></div>
              <img
                src={product.images?.[activeImage] || product.image || 'https://via.placeholder.com/800x1000'}
                alt={product.name}
                className="w-full h-full object-contain relative z-10 group-hover:-translate-y-4 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
              />

              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.preventDefault(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </motion.div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all p-2 flex items-center justify-center bg-[#faf8ff] ${activeImage === idx ? 'border-[#111111] shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105 hover:border-[#cccccc]'
                      }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">{product.category}</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">{product.name}</h1>
            <div className="flex items-center gap-3 mb-8">
              {(product.discountAmount || 0) > 0 && (
                <>
                  <p className="text-xl md:text-2xl font-medium text-muted-foreground line-through opacity-70">৳{product.sizes ? product.sizes[selectedSize] : product.price}</p>
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{product.discountAmount}% OFF</span>
                </>
              )}
              <p className="text-3xl font-medium text-foreground">৳{(product.discountAmount || 0) > 0 ? Math.round((product.sizes ? product.sizes[selectedSize] : product.price) * (1 - (product.discountAmount || 0) / 100)) : (product.sizes ? product.sizes[selectedSize] : product.price)}</p>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Size Selection */}
            {product.sizes && (
              <div className="mb-10">
                <h3 className="font-serif font-semibold text-xl mb-4 text-primary">Select Size</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(product.sizes).map(([size, price]) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fragrance Notes MOVED BELOW MAIN PRODUCT AREA */}
            {/* Dynamic Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="bg-muted/50 p-6 rounded-2xl mb-10 border border-border">
                <h3 className="font-serif font-semibold text-xl mb-4 text-primary">Details</h3>
                <div className="space-y-4">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold block mb-1">{key}</span>
                      <p className="text-foreground">{value as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-8">
              {product.stock <= 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="font-medium text-sm">Out of Stock</span>
                </div>
              ) : product.stock <= (product.lowStockThreshold || 5) ? (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    <span className="font-medium text-sm">Only {product.stock} left in stock – order now!</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(product.stock / 20) * 100}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="font-medium text-sm">In Stock</span>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex items-center gap-6 mt-auto">
              <div className="flex items-center border border-border rounded-full bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-xl text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  disabled={product.stock <= 0}
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center text-xl text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  disabled={product.stock <= 0 || quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-primary text-primary-foreground h-12 rounded-full font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Fragrance Notes Showcase Section */}
        {(product.topNotes?.length > 0 || product.midNotes?.length > 0 || product.baseNotes?.length > 0 || product.notes) && (
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mt-12 md:mt-20 items-stretch min-h-[min(500px,70vh)]">
            {/* Left Side: Fragrance Notes Details Card */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="bg-[#fcfaff] p-8 md:p-10 rounded-[2.5rem] border border-[#eeeeee] shadow-[0_10px_40px_rgba(0,0,0,0.02)] h-full flex flex-col justify-center">
                <h3 className="font-serif font-bold text-3xl md:text-4xl mb-6 text-[#111111]">Fragrance Notes</h3>
                <div className="space-y-8">
                  {(product.topNotes?.length > 0 || product.notes?.top) && (
                    <div>
                      <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#C9A96E] font-bold block mb-2">Top Notes</span>
                      <p className="text-[#333] text-lg md:text-xl font-serif italic">{product.topNotes?.length > 0 ? product.topNotes.join(', ') : product.notes?.top}</p>
                    </div>
                  )}
                  {(product.midNotes?.length > 0 || product.notes?.middle) && (
                    <div>
                      <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#C9A96E] font-bold block mb-2">Middle Notes</span>
                      <p className="text-[#333] text-lg md:text-xl font-serif italic">{product.midNotes?.length > 0 ? product.midNotes.join(', ') : product.notes?.middle}</p>
                    </div>
                  )}
                  {(product.baseNotes?.length > 0 || product.notes?.base) && (
                    <div>
                      <span className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#C9A96E] font-bold block mb-2">Base Notes</span>
                      <p className="text-[#333] text-lg md:text-xl font-serif italic">{product.baseNotes?.length > 0 ? product.baseNotes.join(', ') : product.notes?.base}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Side: Fragrance Notes Image Hub */}
            <div className="w-full md:w-1/2">
              <div className="relative w-full h-full min-h-[350px] rounded-[2.5rem] bg-transparent overflow-hidden border-0 flex items-center justify-center group" style={{ perspective: '1000px' }}>
                
                <img 
                  src={product.notesImage || settings?.fragranceNotesImage || "/notes-transparent.png"} 
                  alt="Fragrance Ingredients" 
                  className="object-contain w-full h-full p-10 transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-3"
                  onError={(e) => { 
                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/5101/5101037.png';
                    (e.target as HTMLImageElement).style.opacity = '0.04';
                  }}
                />
                
                {/* Fallback internal text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.25] z-[-1] text-center">
                  <span className="text-[#6d28d9] font-serif italic text-xl uppercase tracking-widest px-4 leading-relaxed">Fragrance Ingredients<br/>Showcase</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products - You May Also Like */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-32 pt-24 pb-28 border-t border-[#eeeeee] relative w-screen ml-[calc(-50vw+50%)] overflow-hidden bg-gradient-to-b from-[#f8f5ff]/60 to-white"
          >
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#f3efff] blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#f8f5ff] blur-[100px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4">
              {/* Section Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center mb-14"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#111111] mb-3 tracking-wide">You May Also Like</h2>
                <div className="w-16 h-[2px] bg-[#111111] mx-auto mb-4"></div>
                <p className="text-[#555555] text-sm uppercase tracking-[0.25em] font-medium">Discover your next signature scent</p>
              </motion.div>

              {/* Carousel Container */}
              {/* Infinite Marquee Container */}
              <div className="relative mx-[-1rem] overflow-hidden">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-white to-transparent z-20 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-white to-transparent z-20 pointer-events-none"></div>

                <div className="animate-marquee hover:[animation-play-state:paused] pb-8 pt-2 items-stretch">
                  {[1, 2].map((set) => (
                    <div key={`set-${set}`} className="flex shrink-0 gap-4 md:gap-7 pr-4 md:pr-7 items-stretch">
                      {relatedProducts.map((relatedProduct, idx) => {
                        const displayPrice = relatedProduct.sizes ? (relatedProduct.sizes['50ml'] || Object.values(relatedProduct.sizes)[0]) : relatedProduct.price;
                        const displayImage = relatedProduct.image || relatedProduct.images?.[0] || '/apple-touch-icon.png';

                        return (
                          <Link
                            key={`${relatedProduct._id || relatedProduct.id}-${idx}-${set}`}
                            to={`/product/${relatedProduct.slug || relatedProduct._id || relatedProduct.id}`}
                            className="group/card block w-[260px] md:w-[280px] shrink-0 h-auto"
                          >
                            {/* Luxury Glass Card */}
                            <div className="relative rounded-3xl overflow-hidden bg-white border border-[#eeeeee] shadow-[0_8px_32px_rgba(0,0,0,0.05)] group-hover/card:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 ease-out group-hover/card:-translate-y-3 h-full flex flex-col">
                              {/* Product Image Container */}
                              <div className="relative aspect-square overflow-hidden bg-[#faf8ff] shrink-0">
                                {/* Studio Spotlight Glow */}
                                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                                  <div className="w-44 h-44 bg-white blur-[40px] rounded-full group-hover/card:w-56 group-hover/card:h-56 transition-all duration-700"></div>
                                </div>
                                {/* Warm base glow */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/3 bg-gradient-to-t from-[#C9A96E]/[0.08] to-transparent blur-[40px] pointer-events-none"></div>
                                {/* Product Image - Floating */}
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                  <img
                                    src={displayImage}
                                    alt={relatedProduct.name}
                                    className="w-full h-full object-contain relative z-10 transform -translate-y-[6px] scale-[1.02] group-hover/card:-translate-y-4 group-hover/card:scale-[1.07] transition-all duration-500 ease-out"
                                    style={{ padding: '2rem' }}
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
                                  />
                                </div>
                                {/* Light sweep on hover */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.6] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                                {/* Hover Overlay Glass Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/[0.05] to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-400 pointer-events-none"></div>
                              </div>
                              <div className="p-5 text-center bg-white border-t border-[#eeeeee] flex-grow flex flex-col justify-center">
                                <p className="text-[10px] text-[#777777] uppercase tracking-[0.2em] mb-1.5 font-medium">{ relatedProduct.category}</p>
                                <h3 className="text-base font-serif font-bold text-[#111111] mb-1.5 tracking-wide truncate">{relatedProduct.name}</h3>
                                <div className="flex items-center justify-center gap-2">
                                  {(relatedProduct.discountAmount || 0) > 0 && <span className="text-xs text-muted-foreground line-through opacity-70">৳{displayPrice}</span>}
                                  <p className="font-bold text-sm tracking-wider gradient-text-luxury">৳{(relatedProduct.discountAmount || 0) > 0 ? Math.round(displayPrice * (1 - (relatedProduct.discountAmount || 0) / 100)) : displayPrice}</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sticky Product Bar */}
      <AnimatePresence>
        {showStickyBar && product && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 md:top-16 left-0 right-0 z-[999] bg-white/95 backdrop-blur-md border-b border-[#eeeeee] shadow-sm"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-2 h-14 md:h-[58px]">
              {/* Left: Product info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-[#f8f5ff] border border-[#eeeeee] flex items-center justify-center p-1">
                  <img
                    src={product?.image || product?.images?.[0] || '/apple-touch-icon.png'}
                    alt={product?.name || 'Product'}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-[#111111] text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{product?.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111111] gradient-text-luxury">৳{(product?.discountAmount || 0) > 0 ? Math.round((product?.sizes ? product.sizes[selectedSize] : product?.price) * (1 - (product?.discountAmount || 0) / 100)) : (product?.sizes ? product.sizes[selectedSize] : product?.price)}</span>
                    {selectedSize && <span className="text-[10px] text-[#777777] uppercase tracking-wider hidden sm:inline">• {selectedSize}</span>}
                  </div>
                </div>
              </div>

              {/* Right: CTA */}
              <button
                onClick={handleAddToCart}
                disabled={product?.stock <= 0}
                className="flex-shrink-0 btn-primary px-5 md:px-7 py-2.5 rounded-full text-xs md:text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product?.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
