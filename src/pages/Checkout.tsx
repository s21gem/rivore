import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { trackPurchase } from '../components/MetaPixel';
import { toast } from 'sonner';
import { Truck, ShieldCheck, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';

const BD_CITIES = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Other'
];

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<{id: string; name: string; icon: string}[]>([{ id: 'COD', name: 'Cash on Delivery', icon: 'truck' }]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    paymentMethod: 'COD',
  });

  const [shippingCharge, setShippingCharge] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; type: string; amount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Hydrate from localStorage for auto-fill logic
  useEffect(() => {
    const saved = localStorage.getItem('rivore_checkout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed, paymentMethod: prev.paymentMethod }));
      } catch (e) {
        console.error('Error parsing save data');
      }
    }
    // Fetch available payment methods
    fetch('/api/payment/methods')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.length > 0) setPaymentMethods(data);
      })
      .catch(() => {});

    // Fetch settings for shipping charge
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.shippingCharge !== undefined) {
          setShippingCharge(data.shippingCharge);
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          type: data.coupon.discountType,
          amount: data.coupon.discountAmount
        });
        toast.success('Coupon applied successfully!');
      } else {
        setAppliedCoupon(null);
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      toast.error('Error validating coupon. Please try again.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const subtotal = getTotal();
  let discountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountValue = (subtotal * appliedCoupon.amount) / 100;
    } else {
      discountValue = appliedCoupon.amount;
    }
  }
  const finalTotal = Math.max(0, subtotal - discountValue) + shippingCharge;

  // Sync to localStorage
  useEffect(() => {
    // Only save identity fields, never payment tokens
    const { name, phone, address, city } = formData;
    localStorage.setItem('rivore_checkout', JSON.stringify({ name, phone, address, city }));
  }, [formData]);

  if (items.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // clear error for this field
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.phone.trim() || formData.phone.length < 11) newErrors.phone = 'Valid phone number required';
    if (!formData.address.trim()) newErrors.address = 'Detailed address is required';
    
    setErrors(newErrors);
    
    // Auto focus first error
    const firstError = Object.keys(newErrors)[0];
    if (firstError) {
      const el = document.getElementsByName(firstError)[0];
      if (el) el.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        items: items.map(item => ({
          product: item.type === 'product' ? item.productId : undefined,
          combo: item.type === 'combo' ? (item.comboId || item.id) : undefined,
          customProducts: item.customProducts,
          size: item.size,
          name: item.name,
          image: item.image || '',
          price: item.price,
          quantity: item.quantity,
          type: item.type,
        })),
        totalAmount: finalTotal,
        couponCode: appliedCoupon?.code,
        discountApplied: discountValue,
        paymentMethod: formData.paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderResult = await response.json();
        const orderId = orderResult._id || orderResult.id;

        // Handle online payment flows
        if (formData.paymentMethod === 'bKash') {
          const bkashRes = await fetch('/api/payment/bkash/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: finalTotal, orderId }),
          });
          const bkashData = await bkashRes.json();
          if (bkashData.bkashURL) {
            window.location.href = bkashData.bkashURL;
            return;
          } else {
            throw new Error(bkashData.message || 'bKash payment failed');
          }
        } else if (formData.paymentMethod === 'SSLCommerz') {
          const sslRes = await fetch('/api/payment/sslcommerz/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: finalTotal,
              orderId,
              customerName: formData.name,
              customerEmail: '',
              customerPhone: formData.phone,
              customerAddress: formData.address,
              customerCity: formData.city,
            }),
          });
          const sslData = await sslRes.json();
          if (sslData.gatewayUrl) {
            window.location.href = sslData.gatewayUrl;
            return;
          } else {
            throw new Error(sslData.message || 'SSLCommerz payment failed');
          }
        } else if (formData.paymentMethod === 'UddoktaPay') {
          const udRes = await fetch('/api/payment/uddoktapay/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: finalTotal,
              orderId,
              customerName: formData.name,
              customerEmail: '',
              customerPhone: formData.phone,
            }),
          });
          const udData = await udRes.json();
          if (udData.paymentUrl) {
            window.location.href = udData.paymentUrl;
            return;
          } else {
            throw new Error(udData.message || 'UddoktaPay payment failed');
          }
        }

        // COD flow — show success
        const contents = items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price
        }));
        trackPurchase(finalTotal, 'BDT', contents);
        clearCart();
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN RENDER
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-20 flex items-center justify-center">
        <div className="bg-white p-10 md:p-14 rounded-3xl border border-border text-center max-w-xl mx-4 shadow-sm animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShieldCheck className="w-10 h-10 text-green-600" />
           </div>
           <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">Order Placed Successfully 🎉</h1>
           <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl mb-8">
             <p className="text-lg font-medium text-primary">
               Our team will call you to confirm your order.
             </p>
             <p className="text-sm text-muted-foreground mt-2">
               Please keep your phone nearby.
             </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to={`/track?phone=${encodeURIComponent(formData.phone)}`} className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-md flex-1">
               <Truck className="w-4 h-4" /> Track Order
             </Link>
             <Link to="/" className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-4 rounded-full text-sm font-medium hover:bg-muted/80 transition-all shadow-sm flex-1">
               <ShoppingBag className="w-4 h-4" /> Shop More
             </Link>
           </div>
        </div>
      </div>
    );
  }

  // STANDARD CHECKOUT RENDER
  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-32 lg:pb-20 pt-10 lg:pt-20"> {/* pb-32 to accommodate sticky mobile bar */}
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Complete Your Order</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" /> Fast & Secure 1-Step Checkout
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">
          
          {/* Left Column: Form Section */}
          <div className="w-full lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span> 
                  Delivery Details
                </h2>
                
                <div className="grid grid-cols-1 gap-5">
                  <div className="relative">
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Abdullah Rayhan"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium ${errors.name ? 'border-red-500 border-2 bg-red-50/20' : 'border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl outline-none transition-all font-mono text-lg placeholder:text-gray-400 ${errors.phone ? 'border-red-500 border-2 bg-red-50/20' : 'border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.phone}</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Location / City *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl outline-none transition-all font-medium appearance-none cursor-pointer border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10`}
                    >
                      {BD_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Detailed Address *</label>
                    <input
                      type="text"
                      name="address"
                      placeholder="House, Road, Area"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-gray-50 rounded-xl outline-none transition-all font-medium placeholder:text-gray-400 ${errors.address ? 'border-red-500 border-2 bg-red-50/20' : 'border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.address}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span> 
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const isSelected = formData.paymentMethod === method.id;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center p-5 border-2 rounded-xl cursor-pointer relative overflow-hidden transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary accent-primary"
                        />
                        <div className="ml-4 flex flex-col">
                          <span className="font-bold text-foreground flex items-center gap-2">
                            {method.id === 'bKash' && <span className="w-6 h-6 bg-[#E2136E] rounded text-white text-[8px] font-bold flex items-center justify-center">bK</span>}
                            {method.id === 'SSLCommerz' && <span className="w-6 h-6 bg-blue-600 rounded text-white text-[7px] font-bold flex items-center justify-center">SSL</span>}
                            {method.id === 'UddoktaPay' && <span className="w-6 h-6 bg-green-600 rounded text-white text-[7px] font-bold flex items-center justify-center">UP</span>}
                            {method.name}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {method.id === 'COD' && 'Pay with cash when package arrives'}
                            {method.id === 'bKash' && 'Pay securely via bKash mobile wallet'}
                            {method.id === 'SSLCommerz' && 'Pay via Card, bKash, Nagad, Rocket & more'}
                            {method.id === 'UddoktaPay' && 'Pay via UddoktaPay gateway'}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Desktop CTA (Hidden on small mobile) */}
              <div className="hidden lg:block pt-6">
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse">
                    <AlertCircle className="w-4 h-4"/> Only few items left in stock
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-5 rounded-2xl text-xl font-bold hover:bg-primary/90 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center shadow-[0_10px_40px_-10px_rgba(var(--color-brand-wine-rgb),0.6)]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="w-full lg:w-2/5">
            <div className="sticky top-28 lg:top-32 space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-6 pb-4 border-b border-border">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={item.image} alt={item.name} className="w-14 aspect-square rounded-lg object-cover bg-white border border-gray-200 shadow-sm" referrerPolicy="no-referrer" />
                          <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex flex-col">
                           <span className="font-semibold text-sm max-w-[150px] truncate">{item.name}</span>
                           {item.size && <span className="text-xs text-muted-foreground">{item.size}</span>}
                        </div>
                      </div>
                      <span className="font-bold">৳{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="mb-6 flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                    placeholder="Discount / Coupon Code" 
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all uppercase placeholder:normal-case font-medium text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyCoupon} 
                    disabled={validatingCoupon || !couponCode.trim()} 
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0 text-sm"
                  >
                    {validatingCoupon ? 'Wait' : 'Apply'}
                  </button>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-6 space-y-3 font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-lg -mx-3">
                      <span>Discount ({appliedCoupon.code}) {appliedCoupon.type === 'percentage' ? `-${appliedCoupon.amount}%` : ''}</span>
                      <span>-৳{discountValue.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span>{shippingCharge > 0 ? `৳${shippingCharge.toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mt-4">
                    <span className="font-bold text-foreground">Total To Pay</span>
                    <span className="text-3xl font-serif font-bold text-primary">৳{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Psychological Trust Badges */}
              <div className="grid grid-cols-1 gap-3">
                 <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                   <div className="bg-blue-50 p-2 rounded-full"><Truck className="w-5 h-5 text-blue-600"/></div>
                   <div>
                     <p className="font-semibold text-sm text-foreground">Fast Delivery</p>
                     <p className="text-xs text-muted-foreground">All Over Bangladesh inside 48-72h</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                   <div className="bg-green-50 p-2 rounded-full"><ShieldCheck className="w-5 h-5 text-green-600"/></div>
                   <div>
                     <p className="font-semibold text-sm text-foreground">Cash on Delivery</p>
                     <p className="text-xs text-muted-foreground">Pay safely handing cash to rider</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                   <div className="bg-purple-50 p-2 rounded-full"><RefreshCw className="w-5 h-5 text-purple-600"/></div>
                   <div>
                     <p className="font-semibold text-sm text-foreground">Easy Return</p>
                     <p className="text-xs text-muted-foreground">Hassle-free guarantee upon delivery</p>
                   </div>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-[60] flex items-center justify-between gap-4"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
         <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Total Payable</span>
            <span className="text-xl font-bold text-[color:var(--color-brand-wine)]">৳{finalTotal.toFixed(2)}</span>
         </div>
         <button
           onClick={(e) => { e.preventDefault(); handleSubmit(); }}
           disabled={loading}
           className="flex-1 bg-[color:var(--color-brand-wine)] text-white py-3.5 rounded-xl text-lg font-bold active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center shadow-lg"
         >
           {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm Order'}
         </button>
      </div>
    </div>
  );
}
