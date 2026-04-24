import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import { useCartStore } from '../store/cartStore';
import { trackAddToCart, trackViewContent } from '../components/MetaPixel';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Star, Phone, Check, X, ShieldAlert } from 'lucide-react';

export default function ComboPage() {
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useCartStore((state) => state.setCartOpen);
  const [combos, setCombos] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder States
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeCombo, setActiveCombo] = useState<any>(null);
  const [customSelections, setCustomSelections] = useState<any[]>([]);

  useEffect(() => {
    if (isBuilderOpen) {
      document.body.classList.add('hide-mobile-nav');
    } else {
      document.body.classList.remove('hide-mobile-nav');
    }
    return () => {
      document.body.classList.remove('hide-mobile-nav');
    };
  }, [isBuilderOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
           fetch('/api/combos'),
           fetch('/api/products?limit=1000') // fetch massive list for builder caching
        ]);
        if (cRes.ok && pRes.ok) {
          const cData = await cRes.json();
          const pData = await pRes.json();
          
          const safeCombos = Array.isArray(cData) ? cData.map((c: any) => ({
             ...c,
             products: c.products || [],
             customSize: c.customSize || (c.products ? c.products.length : 0)
          })) : [];
          
          setCombos(safeCombos);
          setAllProducts(pData.products || pData || []);
          
          safeCombos.forEach((combo: any) => {
            trackViewContent(combo.name, combo.category || 'Combo', combo.price);
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (combo: any) => {
    addItem({
      id: combo._id || combo.id,
      name: combo.name,
      price: combo.price,
      quantity: 1,
      image: combo.image || combo.images?.[0] || '',
      type: 'combo',
    });
    trackAddToCart(combo.name, combo.category || 'Combo', combo.price);
    toast.success(`${combo.name} added to cart`);
    setCartOpen(true);
  };

  const openBuilder = (combo: any) => {
    setActiveCombo(combo);
    setCustomSelections([]);
    setIsBuilderOpen(true);
  };

  const toggleProductSelection = (prod: any) => {
    if (prod.stock <= 0) return; // Prevent OOS click bypassing

    setCustomSelections(prev => {
       const exists = prev.some(p => p._id === prod._id);
       if (exists) {
         return prev.filter(p => p._id !== prod._id);
       }
       if (prev.length >= activeCombo.customSize) {
         toast.error(`You can only select exactly ${activeCombo.customSize} items!`);
         // Small visual shake or ignore
         return prev;
       }
       return [...prev, prod];
    });
  };

  const commitCustomComboToCart = () => {
    if (customSelections.length !== activeCombo.customSize) {
       toast.error(`Please select exactly ${activeCombo.customSize} items.`);
       return;
    }

    const customIds = customSelections.map(p => p._id);
    const sortedHash = [...customIds].sort().join('-');
    const cartHash = `${activeCombo._id}-custom-${sortedHash}`;

    addItem({
      id: cartHash,
      comboId: activeCombo._id,
      customProducts: customIds, // explicitly passing to database mapping
      name: `Custom ${activeCombo.name} (${customSelections.map(p => p.name).join(', ')})`,
      price: activeCombo.price,
      quantity: 1,
      image: activeCombo.image || activeCombo.images?.[0] || '',
      type: 'combo',
    });

    toast.success(`Custom combo added to cart!`);
    setCartOpen(true);
    setIsBuilderOpen(false);
    setActiveCombo(null);
    setCustomSelections([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center luxury-bg">
        <Loader size="lg" />
      </div>
    );
  }

  if (!combos || combos.length === 0) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center luxury-bg">
         <h2 className="text-2xl font-serif font-bold text-[#555555]">No combos available</h2>
         <p className="text-[#777777] mt-2">Please check back later.</p>
       </div>
    );
  }

  return (
    <div className="min-h-screen py-16 relative overflow-hidden luxury-bg">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-[#111111] mb-4">Exclusive Combos</h1>
          <p className="text-lg text-[#555555] max-w-2xl mx-auto">
            Experience the full spectrum of Rivore with our specially curated bundle sets. Pick a curated box or build your own!
          </p>
        </div>

        <div className="space-y-24">
          {combos.map((combo, index) => {
            const includedItems = combo.includedPerfumes?.length > 0 
              ? combo.includedPerfumes 
              : (combo.products || []).map((p: any) => p.name || p) || [];
              
            const highlights = combo.highlights?.length > 0 
              ? combo.highlights 
              : ['Best Value', 'Perfect Gift'];

            return (
            <motion.div
              key={combo._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}
            >
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-xl bg-white border border-[#eeeeee] flex items-center justify-center p-8 group">
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none"><div className="w-64 h-64 bg-[#f8f5ff] blur-[80px] rounded-full group-hover:bg-[#f3efff] group-hover:w-72 group-hover:h-72 transition-all duration-700"></div></div>

                  {(combo.images && combo.images.length > 1) ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {combo.images.map((img: string, i: number) => {
                        const offsets = ['-translate-x-12 scale-90 z-10 opacity-80', 'z-30 scale-110', 'translate-x-12 scale-90 z-20 opacity-80'];
                        const fallbackClass = i === 0 ? 'z-30 scale-100' : (i === 1 ? '-translate-x-12 scale-90 z-10 opacity-90' : 'translate-x-12 scale-90 z-20 opacity-90');
                        return (
                          <img
                            key={i}
                            src={img}
                            alt={`${combo.name} part ${i+1}`}
                            className={`absolute inset-0 m-auto w-2/3 h-2/3 object-contain transition-all duration-700 group-hover:-translate-y-4 ${combo.images.length === 3 ? offsets[i] : fallbackClass}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <img
                      src={combo.image || combo.images?.[0] || 'https://via.placeholder.com/800x800'}
                      alt={combo.name}
                      className="w-full h-full object-contain relative z-10 group-hover:-translate-y-4 group-hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/apple-touch-icon.png' }}
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none z-40"></div>
                  
                  <div className="absolute top-8 left-8 flex flex-col gap-3 z-50">
                    {highlights.map((highlight: string, i: number) => (
                      <span key={i} className="bg-white/90 backdrop-blur-md border border-[#eeeeee] text-[#111111] px-5 py-2 rounded-full text-sm font-bold tracking-wide shadow-sm flex items-center gap-2">
                        <Star className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-10 left-10 text-[#111111] z-50 drop-shadow-md">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#C9A96E] mb-3">{combo.category} Collection</p>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold">{combo.name}</h2>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-serif font-bold text-[#111111]">{combo.isCustomizable ? 'Build Your Own' : 'The Bundle'}</h3>
                    {combo.isCustomizable && <span className="bg-[#C9A96E]/15 text-[#C9A96E] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#C9A96E]/20">Custom Box</span>}
                  </div>
                  <p className="text-[#555555] text-lg leading-relaxed">
                    {combo.description}
                  </p>
                </div>

                <div className="bg-white border border-[#eeeeee] p-8 rounded-[2rem] shadow-sm">
                  {combo.isCustomizable ? (
                      <div>
                         <h4 className="font-serif font-semibold text-xl mb-4 text-[#C9A96E]">
                           You Pick Any {combo.customSize} Perfumes!
                         </h4>
                         <p className="text-[#555555] mb-4">Select exactly {combo.customSize} bottles of your choice from our exclusive collection. Mix and match to discover your perfect signature scent rotational set.</p>
                      </div>
                  ) : (
                    <>
                      <h4 className="font-serif font-semibold text-xl mb-4 text-[#C9A96E] flex items-center gap-2">
                        Included in this combo:
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {includedItems.map((itemName: string, i: number) => (
                          <li key={i} className="flex items-center text-[#111111] bg-[#faf8ff] p-3 rounded-xl border border-[#eeeeee]">
                            <CheckCircle2 className="w-5 h-5 text-[#C9A96E] mr-3 flex-shrink-0" />
                            <span className="font-medium">{itemName}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-[#eeeeee]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                    <div>
                      <p className="text-sm text-[#777777] uppercase tracking-wider mb-1">Bundle Price</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-serif font-bold text-[#C9A96E]">৳{combo.price}</p>
                        <span className="text-sm text-[#999999] line-through">৳{combo.price + 500}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleAddToCart(combo)}
                        className="btn-primary px-8 py-4 rounded-full font-bold text-lg w-full"
                      >
                        Order Combo Now
                      </button>
                      <button
                        onClick={() => openBuilder(combo)}
                        className="bg-transparent text-[#111111] px-8 py-4 rounded-full font-bold text-lg border-2 border-[#eeeeee] hover:border-[#cccccc] hover:bg-[#faf8ff] active:scale-95 transition-all duration-300 w-full flex items-center gap-2 justify-center"
                      >
                        Make Your Own Combo
                      </button>
                      <div className="flex items-center gap-1.5 mt-1 text-red-500 font-medium text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Limited stock available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
        </div>
      </div>

      {/* CUSTOM COMBO BUILDER MODAL OVERLAY */}
      <AnimatePresence>
        {isBuilderOpen && activeCombo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex flex-col md:items-center justify-end md:justify-center p-0 md:p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full h-[95vh] md:max-w-5xl md:h-[85vh] rounded-t-[2rem] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex justify-between items-center bg-[#FAF5F8] sticky top-0 z-10">
                 <div>
                   <p className="text-xs uppercase tracking-widest text-[#C9A96E] font-bold mb-1">Make Your Own</p>
                   <h2 className="text-2xl font-serif font-bold text-foreground">{activeCombo.name}</h2>
                 </div>
                 <button onClick={() => setIsBuilderOpen(false)} className="p-2 bg-white rounded-full hover:bg-muted transition-colors border border-border shadow-sm">
                   <X className="w-6 h-6 text-foreground" />
                 </button>
              </div>

              {/* Progress Tracker Horizontal */}
              <div className="bg-white border-b border-border px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-[88px] z-10 shadow-sm">
                 <div>
                   <p className="font-medium text-lg">Select <span className="font-bold text-primary">{activeCombo.customSize}</span> Perfumes</p>
                   <p className="text-sm text-muted-foreground">Tap on a perfume to add it to your custom box.</p>
                 </div>
                 
                 <div className="flex gap-2">
                   {Array.from({ length: activeCombo.customSize }).map((_, i) => {
                     const isFilled = customSelections[i];
                     return (
                       <div key={i} className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${isFilled ? 'border-primary bg-primary/5' : 'border-dashed border-gray-300 bg-gray-50'}`}>
                          {isFilled ? (
                            <img src={isFilled.image || isFilled.images?.[0]} className="w-full h-full object-cover scale-150" alt={isFilled.name} />
                          ) : (
                            <span className="text-gray-400 text-lg font-light">{i + 1}</span>
                          )}
                       </div>
                     )
                   })}
                 </div>
              </div>

              {/* Product Grid Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white hide-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pb-24 md:pb-0">
                  {allProducts.map(prod => {
                    const isSelected = customSelections.find(p => p._id === prod._id);
                    const isOOS = prod.stock <= 0;
                    const maxReached = customSelections.length >= activeCombo.customSize;

                    return (
                      <div 
                        key={prod._id} 
                        onClick={() => toggleProductSelection(prod)}
                        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                           isOOS ? 'opacity-50 cursor-not-allowed' : 
                           isSelected ? 'ring-2 ring-[#C9A96E] shadow-md border-transparent' : 
                          'hover:shadow-md cursor-pointer border-[#eeeeee]'
                        } bg-white border border-[#eeeeee]`}
                      >
                         <div className="aspect-[3/4] flex items-center justify-center p-4 relative bg-[#faf8ff]">
                            <div className="absolute inset-0 flex justify-center items-center pointer-events-none"><div className="w-20 h-20 bg-white blur-[30px] rounded-full"></div></div>
                            {isOOS && <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-red-50 text-red-600 text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] border border-red-200">Out Of Stock</span></div>}
                            <img src={prod.image || prod.images?.[0]} alt={prod.name} className="w-full h-full object-contain relative z-10" />
                            
                            {/* Selection Checkbox */}
                            {!isOOS && (
                               <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 z-20 flex items-center justify-center transition-all ${isSelected ? 'bg-[#C9A96E] border-[#C9A96E] shadow-sm' : 'bg-white/80 border-[#cccccc] backdrop-blur-sm'}`}>
                                 {isSelected && <Check className="w-4 h-4 text-white" />}
                               </div>
                            )}
                         </div>
                         <div className="p-3 text-center bg-white border-t border-[#eeeeee]">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#777777] font-medium">{prod.category || 'Perfume'}</p>
                            <h3 className="font-semibold text-sm line-clamp-1 text-[#111111] leading-tight">{prod.name}</h3>
                         </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* OOS Message Helper */}
                <div className="mt-8 mb-4 p-4 border border-[#eeeeee] bg-[#faf8ff] rounded-xl flex items-center gap-3">
                   <div className="bg-white p-2 rounded-full shrink-0 border border-[#eeeeee] shadow-sm"><ShieldAlert className="w-5 h-5 text-[#C9A96E]"/></div>
                   <div>
                     <p className="text-sm font-semibold text-[#111111]">Need an Out Of Stock item?</p>
                     <p className="text-xs text-[#555555]">Select available items to check out securely. Then call us at <span className="font-bold text-[#111111] underline">01234567890</span> and we'll magically swap it for you prior to shipping if inventory opens!</p>
                   </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="border-t border-border bg-white p-4 md:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] safe-bottom z-20">
                <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                   <div className="hidden md:flex flex-col">
                      <p className="font-serif font-bold text-xl">{activeCombo.name}</p>
                      <p className="text-sm text-foreground font-medium">৳{activeCombo.price}</p>
                   </div>
                   
                   <p className="md:hidden font-bold text-primary">
                     {customSelections.length} / {activeCombo.customSize} Selected
                   </p>

                   <button 
                     onClick={commitCustomComboToCart}
                     disabled={customSelections.length !== activeCombo.customSize}
                     className={`flex-1 md:flex-none w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 ${
                       customSelections.length === activeCombo.customSize 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-once' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                     }`}
                   >
                     Add Combo To Cart
                   </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
