import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, getTotal, isCartOpen, setCartOpen } = useCartStore();
  const navigate = useNavigate();

  // Disable body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(`${name} removed from cart`);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[1002] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-serif font-semibold text-gray-900">Your Selection</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-serif text-gray-900">Your cart is empty</h3>
                  <p className="text-sm text-gray-400 max-w-[240px]">
                    Looks like you haven't added any premium fragrances yet.
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate('/shop');
                    }}
                    className="text-[11px] uppercase tracking-widest font-bold text-gray-900 border-b-2 border-gray-900 pb-1 mt-6 hover:opacity-70 transition-opacity"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                      {/* Item Image */}
                      <div className="w-24 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                        <img
                          src={item.image || '/apple-touch-icon.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                            <button
                              onClick={() => handleRemove(item.id, item.name)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                             {item.type === 'combo' ? 'Combo Set' : (item.size || 'Standard')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.stock !== undefined ? Math.min(item.stock, item.quantity + 1) : item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30"
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-gray-900">৳{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-8 border-t border-gray-100 bg-gray-50/30 space-y-6">
                <div className="space-y-3 font-medium">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span className="text-gray-900">৳{getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs tracking-wide">
                    <span>Shipping</span>
                    <span className="text-gray-400 uppercase text-[9px]">Calculated at Checkout</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                    <span className="text-sm font-serif text-gray-900">Estimated Total</span>
                    <span className="text-2xl font-serif font-bold text-[#6d28d9]">৳{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full group bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#6d28d9] transition-all duration-300 shadow-lg shadow-[#6d28d9]/10"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                        setCartOpen(false);
                        navigate('/shop');
                    }}
                    className="w-full py-4 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
