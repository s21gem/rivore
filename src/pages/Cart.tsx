import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { trackInitiateCheckout } from '../components/MetaPixel';
import { toast } from 'sonner';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const navigate = useNavigate();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(`${name} removed from cart`);
  };

  const handleCheckout = () => {
    trackInitiateCheckout(getTotal(), items.length);
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-3xl font-serif font-light text-foreground mb-6">Your Cart is Empty</h2>
        <p className="text-sm font-light text-muted-foreground mb-10 text-center max-w-md leading-relaxed">
          Looks like you haven't added any of our premium fragrances to your cart yet.
        </p>
        <Link
          to="/shop"
          className="text-[10px] uppercase tracking-[0.2em] font-medium border-b border-accent text-accent pb-1 hover:opacity-70 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-16 border-b border-border pb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-4 font-medium text-muted-foreground">Your Selection</p>
          <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground">Shopping Cart</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3 space-y-12">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-8 pb-12 border-b border-border/50 last:border-0"
              >
                <Link to={`/${item.type === 'combo' ? 'combos' : `product/${item.id}`}`} className="w-full sm:w-40 aspect-[3/4] shrink-0 bg-muted">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=200&auto=format&fit=crop'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </Link>

                <div className="flex-grow flex flex-col justify-between h-full w-full py-2">
                  <div className="flex justify-between items-start mb-6 sm:mb-0">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
                        {item.type === 'combo' ? 'Combo Set' : 'Perfume'}
                      </p>
                      <Link
                        to={`/${item.type === 'combo' ? 'combos' : `product/${item.id}`}`}
                        className="text-2xl font-serif font-light text-foreground hover:text-accent transition-colors"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <p className="text-xl font-light text-accent">৳{item.price}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-light">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.stock !== undefined ? Math.min(item.stock, item.quantity + 1) : item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id, item.name)}
                      className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-1"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-muted/30 p-10 sticky top-28">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium text-accent mb-8 border-b border-border pb-4">Order Summary</h2>

              <div className="space-y-6 mb-10 text-sm font-light">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">৳{getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes</span>
                  <span className="text-foreground">Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-6 mt-6 flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Estimated Total</span>
                  <span className="text-3xl font-serif font-light text-accent">৳{getTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full block text-center bg-primary text-primary-foreground py-4 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-primary/90 transition-colors mb-6"
              >
                Proceed to Checkout
              </button>

              <div className="text-center">
                <Link to="/shop" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent border-b border-transparent hover:border-accent pb-1 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
