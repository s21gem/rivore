import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { customerApi } from '../lib/customerApi';
import { bdLocations } from '../lib/locations';
import { trackPurchase } from '../components/MetaPixel';
import { toast } from 'sonner';
import { Truck, ShieldCheck, RefreshCw, AlertCircle, ShoppingBag, Plus, MapPin, Award } from 'lucide-react';
import { TurnstileWidget } from '../components/TurnstileWidget';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useCustomerAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<{id: string; name: string; icon: string}[]>([{ id: 'COD', name: 'Cash on Delivery', icon: 'truck' }]);
  
  // Address Management
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    division: '',
    district: '',
    area: '',
    fullAddress: '',
    landmark: '',
    paymentMethod: user?.preferredPaymentMethod || 'COD',
  });

  const [shippingCharge, setShippingCharge] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; type: string; amount: number} | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Rewards
  const [rewardSettings, setRewardSettings] = useState<any>(null);
  const [tierSettings, setTierSettings] = useState<any>(null);
  const [customerReward, setCustomerReward] = useState<any>(null);
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    // Hydrate manual form data from local storage if 'new'
    const saved = localStorage.getItem('rivore_checkout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed, paymentMethod: prev.paymentMethod }));
      } catch (e) { }
    }

    // Fetch Payment Methods
    fetch('/api/payment/methods')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && data.length > 0) setPaymentMethods(data); })
      .catch(() => {});

    // Fetch Settings (Shipping & Rewards)
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(data => { 
        if (data) {
          if (data.shippingCharge !== undefined) setShippingCharge(data.shippingCharge); 
          if (data.rewardSettings) setRewardSettings(data.rewardSettings);
          if (data.tierSettings) setTierSettings(data.tierSettings);
        }
      })
      .catch(() => {});

    // Fetch User Addresses if logged in
    if (user) {
      if (user.preferredPaymentMethod) {
        setFormData(prev => ({ ...prev, paymentMethod: user.preferredPaymentMethod as string }));
      }
      setIsFetchingAddresses(true);
      customerApi.getAddresses()
        .then(addresses => {
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddr._id);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingAddresses(false));
        
      customerApi.getRewards()
        .then(data => setCustomerReward(data))
        .catch(() => {});
    }
  }, [user]);

  // Derived state for dynamic dropdowns
  const availableDivisions = bdLocations;
  const selectedDivisionObj = availableDivisions.find(d => d.name === formData.division);
  const availableDistricts = selectedDivisionObj ? selectedDivisionObj.districts : [];
  const selectedDistrictObj = availableDistricts.find(d => d.name === formData.district);
  const availableAreas = selectedDistrictObj ? selectedDistrictObj.areas : [];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), customerId: user?.id })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({ code: data.coupon.code, type: data.coupon.discountType, amount: data.coupon.discountAmount });
        toast.success('Coupon applied successfully!');
      } else {
        setAppliedCoupon(null);
        toast.error(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      toast.error('Error validating coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const subtotal = getTotal();
  let discountValue = 0;

  // 1. Tier Discount
  let tierDiscountValue = 0;
  let tierDiscountPercentage = 0;
  if (user?.tier && tierSettings?.enabled) {
    if (user.tier === 'Silver') tierDiscountPercentage = tierSettings.silverDiscount;
    else if (user.tier === 'Gold') tierDiscountPercentage = tierSettings.goldDiscount;
    else if (user.tier === 'Platinum') tierDiscountPercentage = tierSettings.platinumDiscount;
  }
  if (tierDiscountPercentage > 0) {
    tierDiscountValue = (subtotal * tierDiscountPercentage) / 100;
  }

  // 2. Coupon Discount
  let couponDiscountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') couponDiscountValue = (subtotal * appliedCoupon.amount) / 100;
    else couponDiscountValue = appliedCoupon.amount;
  }

  // Apply Highest Single Discount (Coupon vs Tier)
  let isTierDiscountApplied = false;
  let isCouponDiscountApplied = false;

  if (tierDiscountValue >= couponDiscountValue && tierDiscountValue > 0) {
    discountValue += tierDiscountValue;
    isTierDiscountApplied = true;
  } else if (couponDiscountValue > tierDiscountValue && couponDiscountValue > 0) {
    discountValue += couponDiscountValue;
    isCouponDiscountApplied = true;
  }
  
  // 3. Point Discount
  let pointDiscount = 0;
  if (redeemedPoints > 0 && rewardSettings?.discountPerPoint) {
    pointDiscount = redeemedPoints * rewardSettings.discountPerPoint;
    discountValue += pointDiscount;
  }
  
  const finalTotal = Math.max(0, subtotal - discountValue) + shippingCharge;
  
  const handleRedeemPoints = () => {
    if (isRedeeming) {
      setRedeemedPoints(0);
      setIsRedeeming(false);
    } else {
      // Calculate max points they can redeem
      const maxPointsValue = Math.min(
        customerReward?.points || 0,
        Math.floor((subtotal - (discountValue - pointDiscount)) / (rewardSettings?.discountPerPoint || 1))
      );
      if (maxPointsValue > 0) {
        setRedeemedPoints(maxPointsValue);
        setIsRedeeming(true);
      } else {
        toast.error("Not enough points or cart total too low.");
      }
    }
  };

  // Sync manual form data to localStorage
  useEffect(() => {
    if (selectedAddressId === 'new') {
      const { name, phone, division, district, area, fullAddress, landmark } = formData;
      localStorage.setItem('rivore_checkout', JSON.stringify({ name, phone, division, district, area, fullAddress, landmark }));
    }
  }, [formData, selectedAddressId]);

  if (items.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'division') setFormData(f => ({ ...f, division: value, district: '', area: '' }));
    else if (name === 'district') setFormData(f => ({ ...f, district: value, area: '' }));
    else setFormData(f => ({ ...f, [name]: value }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (selectedAddressId === 'new') {
      if (!formData.name.trim()) newErrors.name = 'Required';
      if (!formData.phone.trim() || formData.phone.length < 11) newErrors.phone = 'Invalid phone';
      if (!formData.division) newErrors.division = 'Required';
      if (!formData.district) newErrors.district = 'Required';
      if (!formData.area) newErrors.area = 'Required';
      if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      // Resolve final customer delivery data
      let deliveryName, deliveryPhone, deliveryAddress, deliveryCity;
      
      if (selectedAddressId === 'new') {
        deliveryName = formData.name;
        deliveryPhone = formData.phone;
        deliveryAddress = `${formData.fullAddress}, ${formData.area}, ${formData.district}, ${formData.division}`;
        if (formData.landmark) deliveryAddress += ` (Landmark: ${formData.landmark})`;
        deliveryCity = formData.district || formData.division;
      } else {
        const addr = savedAddresses.find(a => a._id === selectedAddressId);
        deliveryName = addr.recipientName;
        deliveryPhone = addr.phone;
        deliveryAddress = `${addr.fullAddress}, ${addr.area}, ${addr.district}, ${addr.division}`;
        if (addr.landmark) deliveryAddress += ` (Landmark: ${addr.landmark})`;
        deliveryCity = addr.district || addr.division;
      }

      const orderData = {
        customerId: user?.id,
        customer: {
          name: deliveryName,
          phone: deliveryPhone,
          address: deliveryAddress,
          city: deliveryCity,
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
        redeemedPoints: redeemedPoints > 0 ? redeemedPoints : undefined,
        paymentMethod: formData.paymentMethod,
        turnstileToken: turnstileToken,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderResult = await response.json();
        const orderId = orderResult._id || orderResult.id;

        // Payment Gateway integrations
        if (formData.paymentMethod === 'bKash') {
          const res = await fetch('/api/payment/bkash/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: finalTotal, orderId }) });
          const data = await res.json();
          if (data.bkashURL) { window.location.href = data.bkashURL; return; } else throw new Error(data.message);
        } else if (formData.paymentMethod === 'SSLCommerz') {
          const res = await fetch('/api/payment/sslcommerz/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: finalTotal, orderId, customerName: deliveryName, customerPhone: deliveryPhone, customerAddress: deliveryAddress, customerCity: deliveryCity }) });
          const data = await res.json();
          if (data.gatewayUrl) { window.location.href = data.gatewayUrl; return; } else throw new Error(data.message);
        } else if (formData.paymentMethod === 'UddoktaPay') {
          const res = await fetch('/api/payment/uddoktapay/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
          const data = await res.json();
          if (data.payment_url) { window.location.href = data.payment_url; return; } else throw new Error(data.message);
        }

        // COD Success
        trackPurchase(finalTotal, 'BDT', items.map(i => ({ id: i.id, quantity: i.quantity, item_price: i.price })));
        clearCart();
        setIsSuccess(true);
      } else {
        const err = await response.json();
        throw new Error(err.message || 'Failed to place order');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-20 flex items-center justify-center">
        <div className="bg-white p-10 md:p-14 rounded-3xl border border-border text-center max-w-xl mx-4 shadow-sm animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck className="w-10 h-10 text-green-600" /></div>
           <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">Order Placed Successfully 🎉</h1>
           <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl mb-8">
             <p className="text-lg font-medium text-primary">Our team will call you to confirm your order.</p>
             <p className="text-sm text-muted-foreground mt-2">Please keep your phone nearby.</p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to={`/track`} className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-bold hover:bg-primary/90 flex-1"><Truck className="w-4 h-4" /> Track Order</Link>
             <Link to="/" className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-4 rounded-full text-sm font-bold hover:bg-muted/80 flex-1"><ShoppingBag className="w-4 h-4" /> Shop More</Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] pb-32 lg:pb-20 pt-10 lg:pt-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground">Complete Your Order</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" /> Fast & Secure 1-Step Checkout
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">
          
          <div className="w-full lg:w-3/5">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-border">
              
              {/* Delivery Details Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span> 
                    Delivery Details
                  </h2>
                  {!user && (
                    <Link to="/login" className="text-sm font-bold text-primary hover:underline">Log in to use saved addresses</Link>
                  )}
                </div>

                {user && savedAddresses.length > 0 && (
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map(addr => (
                      <div 
                        key={addr._id} 
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer relative transition-all ${selectedAddressId === addr._id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" /> {addr.recipientName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{addr.phone}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{addr.fullAddress}, {addr.area}, {addr.district}</p>
                      </div>
                    ))}
                    <div 
                      onClick={() => setSelectedAddressId('new')}
                      className={`p-4 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center text-gray-500 transition-all ${selectedAddressId === 'new' ? 'border-primary text-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      <Plus className="w-6 h-6 mb-2" />
                      <span className="font-bold text-sm">Add New Address</span>
                    </div>
                  </div>
                )}
                
                {selectedAddressId === 'new' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <div className="relative md:col-span-2">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Recipient Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-5 py-4 bg-white rounded-xl outline-none font-medium border ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'}`} />
                    </div>

                    <div className="relative md:col-span-2">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-5 py-4 bg-white rounded-xl outline-none font-mono text-lg border ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'}`} />
                    </div>

                    <div className="relative">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Division *</label>
                      <select name="division" value={formData.division} onChange={handleChange} className={`w-full px-5 py-4 bg-white rounded-xl outline-none font-medium appearance-none border ${errors.division ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}>
                        <option value="">Select Division</option>
                        {availableDivisions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">District *</label>
                      <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.division} className={`w-full px-5 py-4 bg-white rounded-xl outline-none font-medium appearance-none border ${errors.district ? 'border-red-500' : 'border-gray-200 focus:border-primary disabled:opacity-50'}`}>
                        <option value="">Select District</option>
                        {availableDistricts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>

                    <div className="relative md:col-span-2">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Area / Thana *</label>
                      <select name="area" value={formData.area} onChange={handleChange} disabled={!formData.district} className={`w-full px-5 py-4 bg-white rounded-xl outline-none font-medium appearance-none border ${errors.area ? 'border-red-500' : 'border-gray-200 focus:border-primary disabled:opacity-50'}`}>
                        <option value="">Select Area</option>
                        {availableAreas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                      </select>
                    </div>

                    <div className="relative md:col-span-2">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Full Address *</label>
                      <input type="text" name="fullAddress" value={formData.fullAddress} onChange={handleChange} placeholder="House No, Road No, Block, etc." className={`w-full px-5 py-4 bg-white rounded-xl outline-none font-medium border ${errors.fullAddress ? 'border-red-500' : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10'}`} />
                    </div>

                    <div className="relative md:col-span-2">
                      <label className="block text-xs uppercase font-bold text-muted-foreground mb-1.5 ml-1">Landmark (Optional)</label>
                      <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near mosque, beside hospital, etc." className="w-full px-5 py-4 bg-white rounded-xl outline-none font-medium border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10" />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div className="pt-6 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span> 
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const isSelected = formData.paymentMethod === method.id;
                    return (
                      <label key={method.id} className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="paymentMethod" value={method.id} checked={isSelected} onChange={handleChange} className="w-5 h-5 text-primary focus:ring-primary accent-primary" />
                        <div className="ml-4 flex flex-col">
                          <span className="font-bold text-foreground">{method.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6">
                <TurnstileWidget 
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => toast.error('Security verification failed.')}
                />
              </div>
              <div className="hidden lg:block">
                <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-5 rounded-2xl text-xl font-bold hover:bg-primary/90 transition-all flex justify-center items-center shadow-lg disabled:opacity-70 mt-4">
                  {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-2/5">
            <div className="sticky top-28 lg:top-32 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-border shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-6 pb-4 border-b border-border">Order Summary</h2>
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-14 aspect-square rounded-lg object-cover bg-white border border-gray-200 shadow-sm" />
                        <div className="flex flex-col"><span className="font-semibold text-sm max-w-[150px] truncate">{item.name}</span><span className="text-xs text-muted-foreground">Qty: {item.quantity}</span></div>
                      </div>
                      <span className="font-bold">৳{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-300 pt-6 space-y-3 font-medium">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>৳{subtotal.toFixed(2)}</span></div>
                  {isTierDiscountApplied && <div className="flex justify-between text-indigo-600 font-semibold bg-indigo-50 px-3 py-2 rounded-lg -mx-3"><span>{user?.tier} Tier Discount ({tierDiscountPercentage}%)</span><span>-৳{tierDiscountValue.toFixed(2)}</span></div>}
                  {isCouponDiscountApplied && <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-3 py-2 rounded-lg -mx-3"><span>Coupon ({appliedCoupon?.code})</span><span>-৳{couponDiscountValue.toFixed(2)}</span></div>}
                  {appliedCoupon && !isCouponDiscountApplied && <div className="flex justify-between text-gray-400 text-sm italic px-3 py-1"><span>Coupon ({appliedCoupon.code}) not applied (Tier discount is higher)</span></div>}
                  {redeemedPoints > 0 && <div className="flex justify-between text-amber-600 font-semibold bg-amber-50 px-3 py-2 rounded-lg -mx-3"><span>Points Redeemed ({redeemedPoints})</span><span>-৳{pointDiscount.toFixed(2)}</span></div>}
                  <div className="flex justify-between text-muted-foreground"><span>Delivery Charge</span><span>{shippingCharge > 0 ? `৳${shippingCharge.toFixed(2)}` : 'Free'}</span></div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mt-4"><span className="font-bold text-foreground">Total To Pay</span><span className="text-3xl font-serif font-bold text-primary">৳{finalTotal.toFixed(2)}</span></div>
                </div>
                
                {/* Rewards Redemption */}
                {user && rewardSettings?.enabled && customerReward?.points > 0 && (
                  <div className="border-t border-border pt-6 mt-6">
                    <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1"><Award className="w-4 h-4 text-amber-500" /> Rivoré Rewards</h4>
                          <p className="text-xs text-amber-700/80 mb-3">You have <strong>{customerReward.points}</strong> points available.</p>
                        </div>
                        {isRedeeming ? (
                          <button onClick={handleRedeemPoints} className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200">Remove</button>
                        ) : (
                          <button onClick={handleRedeemPoints} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600">Apply Points</button>
                        )}
                      </div>
                      {isRedeeming && (
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" 
                            min="1" 
                            max={Math.min(customerReward.points, Math.floor((subtotal - (discountValue - pointDiscount)) / rewardSettings.discountPerPoint))} 
                            value={redeemedPoints} 
                            onChange={(e) => setRedeemedPoints(Number(e.target.value))}
                            className="w-full accent-amber-500"
                          />
                          <span className="text-sm font-bold text-amber-900 min-w-[30px]">{redeemedPoints}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-[60] flex items-center justify-between gap-4" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
         <div className="flex flex-col"><span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Total Payable</span><span className="text-xl font-bold text-primary">৳{finalTotal.toFixed(2)}</span></div>
         <button onClick={(e) => { e.preventDefault(); handleSubmit(); }} disabled={loading} className="flex-1 bg-primary text-white py-3.5 rounded-xl text-lg font-bold shadow-lg disabled:opacity-70 flex justify-center">{loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm Order'}</button>
      </div>
    </div>
  );
}
