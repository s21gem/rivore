import React, { useState, useEffect } from 'react';
import { Award, Lock, Unlock, Gift, Sparkles, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function Rewards() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [unlockedReward, setUnlockedReward] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/customer/rewards', {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (type: string, cost: number) => {
    if (points < cost) {
      toast.error("Not enough points to unlock this reward.");
      return;
    }

    setRedeeming(type);
    try {
      const res = await fetch('/api/customer/rewards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('customer_token')}`
        },
        body: JSON.stringify({ rewardType: type })
      });

      const data = await res.json();

      if (res.ok) {
        setPoints(data.newPoints);
        setUnlockedReward(type);
        toast.success("Reward unlocked! Check your Coupons vault.");
        setTimeout(() => setUnlockedReward(null), 3000);
      } else {
        toast.error(data.message || 'Failed to redeem reward');
      }
    } catch (error) {
      toast.error('Network error during redemption');
    } finally {
      setRedeeming(null);
    }
  };

  const vaultItems = [
    { type: 'DISCOUNT_100', cost: 100, title: '৳100 Discount', desc: 'Flat discount on your next order.', icon: Award, color: 'text-rose-400', bg: 'bg-rose-50', border: 'border-rose-200' },
    { type: 'FREE_DELIVERY', cost: 300, title: 'Free Delivery', desc: 'Complimentary shipping across Bangladesh.', icon: Sparkles, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-200' },
    { type: 'MYSTERY_SAMPLE', cost: 500, title: 'Mystery Sample', desc: 'A curated 2ml vial included in your next box.', icon: Gift, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { type: 'EXCLUSIVE_GIFT', cost: 1000, title: 'Exclusive Gift', desc: 'A full premium body care item, free.', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' }
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-serif text-[#111111] mb-2">Rewards Vault</h1>
        <p className="text-[#777777]">Unlock exclusive perks using your accumulated loyalty points.</p>
      </div>

      {/* Points Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#111111] text-white p-10 text-center shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400 font-bold mb-4">Available Balance</p>
          <div className="flex justify-center items-end gap-3 mb-2">
            <span className="text-7xl font-serif font-light tracking-tighter">{points}</span>
            <span className="text-xl text-primary font-bold mb-2 tracking-widest">PTS</span>
          </div>
          <p className="text-gray-400 text-sm">Earn 1 Point for every ৳100 spent.</p>
        </div>
      </div>

      {/* Vault Grid */}
      <div>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-6">Unlockable Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vaultItems.map((item) => {
            const Icon = item.icon;
            const canUnlock = points >= item.cost;
            const isUnlocking = redeeming === item.type;
            const justUnlocked = unlockedReward === item.type;

            return (
              <motion.div 
                key={item.type}
                layout
                animate={justUnlocked ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}}
                className={`relative rounded-3xl border-2 p-6 flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                  justUnlocked ? 'bg-green-50 border-green-400 shadow-lg shadow-green-100' :
                  canUnlock ? `bg-white ${item.border} shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-lg` : 'bg-gray-50 border-gray-200 grayscale opacity-70'
                }`}
              >
                {/* Background Glow if unlockable */}
                {canUnlock && !justUnlocked && (
                  <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl ${item.bg}`}></div>
                )}

                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${justUnlocked ? 'bg-green-100 text-green-600' : canUnlock ? item.bg + ' ' + item.color : 'bg-gray-200 text-gray-400'}`}>
                    {justUnlocked ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    <span className="font-serif font-bold">{item.cost}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">PTS</span>
                  </div>
                </div>

                <div className="relative z-10 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>

                <button
                  onClick={() => handleRedeem(item.type, item.cost)}
                  disabled={!canUnlock || isUnlocking || justUnlocked}
                  className={`relative z-10 w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 overflow-hidden ${
                    justUnlocked ? 'bg-green-500 text-white' :
                    isUnlocking ? 'bg-gray-200 text-gray-500 cursor-wait' :
                    canUnlock ? 'bg-[#111111] text-white hover:bg-gray-900 hover:shadow-md' :
                    'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {justUnlocked ? (
                      <motion.span key="unlocked" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Unlocked
                      </motion.span>
                    ) : isUnlocking ? (
                      <motion.span key="unlocking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Decrypting...
                      </motion.span>
                    ) : canUnlock ? (
                      <motion.span key="unlock" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                        <Unlock className="w-4 h-4" /> Unlock Reward
                      </motion.span>
                    ) : (
                      <motion.span key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Locked
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
