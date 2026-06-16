import React, { useState, useEffect } from 'react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { Shield, Sparkles, Crown, Check } from 'lucide-react';
import { customerApi } from '../../lib/customerApi';

export default function Membership() {
  const { user } = useCustomerAuthStore();
  const [lifetimeSpend, setLifetimeSpend] = useState(user?.lifetimeSpend || 0);

  useEffect(() => {
    // If we want a fresh read
    const fetchSpend = async () => {
      try {
        const data = await customerApi.getOrders();
        const spent = data.filter((o: any) => o.status === 'Delivered').reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        setLifetimeSpend(spent);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user?.lifetimeSpend) {
      fetchSpend();
    }
  }, [user]);

  const tiers = [
    {
      name: 'Silver',
      icon: Shield,
      spendRequired: 5000,
      discount: '5%',
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      border: 'border-slate-200'
    },
    {
      name: 'Gold',
      icon: Sparkles,
      spendRequired: 10000,
      discount: '10%',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-200'
    },
    {
      name: 'Platinum',
      icon: Crown,
      spendRequired: 15000,
      discount: '20%',
      color: 'text-zinc-800',
      bg: 'bg-zinc-200',
      border: 'border-zinc-300'
    }
  ];

  const currentTierIndex = tiers.findIndex(t => t.name === (user?.tier || 'Regular'));
  // If not found (e.g. Regular), it's -1

  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[Math.max(0, currentTierIndex + 1)] : null;
  const progressToNext = nextTier ? Math.min(100, (lifetimeSpend / nextTier.spendRequired) * 100) : 100;
  const amountNeeded = nextTier ? nextTier.spendRequired - lifetimeSpend : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-light text-[#111111]">Membership Status</h1>
        <p className="text-[#777777] mt-3">Unlock exclusive benefits, automatic discounts, and luxury rewards as you journey with Rivoré.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Current Status</p>
        <h2 className="text-4xl font-serif text-gray-900 mb-6">{user?.tier || 'Regular'} Member</h2>

        {nextTier ? (
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span className="text-gray-500">৳{lifetimeSpend.toLocaleString()} spent</span>
              <span className="text-primary">৳{amountNeeded.toLocaleString()} to {nextTier.name}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${progressToNext}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="inline-block bg-zinc-900 text-zinc-100 px-6 py-2 rounded-full text-sm font-semibold tracking-wider">
            Highest Tier Reached
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-serif text-[#111111] mb-6 text-center">Tier Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, idx) => {
            const isUnlocked = idx <= currentTierIndex;
            const Icon = tier.icon;
            return (
              <div 
                key={tier.name}
                className={`relative rounded-3xl p-6 border transition-all ${
                  isUnlocked ? `border-2 ${tier.border} ${tier.bg} shadow-md` : 'border-gray-100 bg-white opacity-60 grayscale'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute top-4 right-4 bg-white/80 p-1 rounded-full shadow-sm">
                    <Check className={`w-4 h-4 ${tier.color}`} />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white shadow-sm ${tier.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-gray-900 mb-1">{tier.name}</h4>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                  {tier.spendRequired > 0 ? `৳${tier.spendRequired.toLocaleString()} Lifetime` : 'Free to join'}
                </p>
                <div className="bg-white/60 rounded-xl p-4 border border-white">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-gray-700">Store Discount</span>
                     <span className={`text-lg font-bold ${tier.color}`}>{tier.discount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
