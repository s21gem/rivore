import React, { useState, useEffect } from 'react';
import { Ticket, Search, Gift, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        // Fetch birthday coupon if exists
        const bdayRes = await fetch('/api/customer/birthday-coupon', {
          headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
        });
        const bdayData = await bdayRes.json();
        
        const availableCoupons = [];
        if (bdayData.coupon) {
          availableCoupons.push({
            ...bdayData.coupon,
            title: 'Birthday Gift',
            description: 'A special birthday discount just for you!',
            icon: Gift
          });
        }
        
        // In a real app we'd fetch other active public/private coupons here too
        setCoupons(availableCoupons);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopied(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-light text-[#111111]">My Coupons</h1>
        <p className="text-[#777777] mt-2">Exclusive discounts and seasonal offers.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-100 rounded-3xl"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
          <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-gray-900 mb-2">No active coupons</h3>
          <p className="text-gray-500">Check back later or wait for your birthday!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((coupon, idx) => {
            const Icon = coupon.icon || Ticket;
            return (
              <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{coupon.title || 'Special Discount'}</h3>
                      <p className="text-xs text-gray-500">Valid until {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-serif text-primary">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </span>
                    <span className="text-gray-500 ml-2 font-medium">OFF</span>
                    <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>
                  </div>
                </div>

                <div className="relative z-10 border-t border-dashed border-gray-200 pt-4 mt-auto">
                  <button 
                    onClick={() => copyToClipboard(coupon.code)}
                    className={`w-full py-3 rounded-xl font-mono font-bold text-sm flex justify-center items-center gap-2 transition-colors border ${
                      copied === coupon.code 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {copied === coupon.code ? (
                      <><CheckCircle className="w-4 h-4" /> COPIED</>
                    ) : (
                      <><Copy className="w-4 h-4 text-gray-400" /> {coupon.code}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
