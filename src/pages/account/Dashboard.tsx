import React, { useEffect, useState } from 'react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { Link } from 'react-router-dom';
import { Package, Award, Sparkles, CreditCard, ChevronRight, Gift, Users, Clock, ShoppingBag } from 'lucide-react';
import { customerApi } from '../../lib/customerApi';

export default function Dashboard() {
  const { user } = useCustomerAuthStore();
  const [data, setData] = useState({
    orders: [] as any[],
    rewards: { points: 0, transactions: [] as any[] },
    referrals: null as any,
    recommendations: [] as any[],
    loading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('customer_token')}` };
        const [ordersRes, rewardsRes, scentRes, refRes] = await Promise.all([
          customerApi.getOrders(),
          fetch('/api/customer/rewards', { headers }).then(res => res.ok ? res.json() : { points: 0, transactions: [] }),
          fetch('/api/customer/scent-collection', { headers }).then(res => res.ok ? res.json() : { recommendations: [] }),
          fetch('/api/customer/referrals', { headers }).then(res => res.ok ? res.json() : null)
        ]);

        setData({
          orders: ordersRes || [],
          rewards: rewardsRes || { points: 0, transactions: [] },
          referrals: refRes,
          recommendations: scentRes.recommendations || [],
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, [user]);

  const isBirthdayToday = React.useMemo(() => {
    if (!user?.dob) return false;
    const dob = new Date(user.dob);
    const today = new Date();
    return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
  }, [user?.dob]);

  if (data.loading) {
    return (
      <div className="animate-pulse flex flex-col gap-8 h-screen">
        <div className="h-96 bg-gray-100 rounded-[3rem] w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><div className="h-32 bg-gray-100 rounded-2xl"></div><div className="h-32 bg-gray-100 rounded-2xl"></div></div>
      </div>
    );
  }

  // --- Calculations ---
  const totalSpent = data.orders.filter((o: any) => o.status === 'Delivered').reduce((sum: number, o: any) => sum + o.totalAmount, 0);
  const lifetimeSpend = user?.lifetimeSpend || totalSpent;
  const successfulReferrals = data.referrals?.referredUsers?.filter((u: any) => u.rewardIssued).length || 0;
  const referralEarnings = successfulReferrals * 100;
  
  // --- Progress System ---
  const tier = user?.tier || 'Regular';
  let nextTier = 'Silver';
  let spendRequired = 5000;
  if (tier === 'Silver') { nextTier = 'Gold'; spendRequired = 10000; }
  else if (tier === 'Gold') { nextTier = 'Platinum'; spendRequired = 15000; }
  else if (tier === 'Platinum') { nextTier = 'Platinum'; spendRequired = 15000; }
  
  const progressToNext = tier === 'Platinum' ? 100 : Math.min(100, (lifetimeSpend / spendRequired) * 100);

  // --- Card Themes ---
  let cardBg = 'bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]';
  let cardText = 'text-gray-100';
  let cardAccent = 'text-gray-400';
  let cardShine = 'from-white/5 to-transparent';
  
  if (tier === 'Silver') {
    cardBg = 'bg-gradient-to-br from-[#e2e2e2] via-[#d1d1d1] to-[#b0b0b0]';
    cardText = 'text-gray-900';
    cardAccent = 'text-gray-600';
    cardShine = 'from-white/40 to-transparent';
  } else if (tier === 'Gold') {
    cardBg = 'bg-gradient-to-br from-[#f6d365] via-[#ffb347] to-[#d4af37]';
    cardText = 'text-yellow-950';
    cardAccent = 'text-yellow-800';
    cardShine = 'from-white/30 to-transparent';
  } else if (tier === 'Platinum') {
    cardBg = 'bg-gradient-to-br from-[#1c1c1c] via-[#2d2d2d] to-[#000000]';
    cardText = 'text-zinc-200';
    cardAccent = 'text-zinc-500';
    cardShine = 'from-white/10 to-transparent';
  }

  const joinDate = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="space-y-12 pb-12">
      
      {/* Birthday Banner */}
      {isBirthdayToday && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl p-1 shadow-lg animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="bg-white/95 backdrop-blur-sm rounded-[1.4rem] p-6 text-center border border-white/50 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
             <div className="relative z-10 flex flex-col items-center">
               <span className="text-4xl mb-2">🎉</span>
               <h2 className="text-2xl font-serif text-amber-900 mb-1">Happy Birthday, {user?.fullName?.split(' ')[0] || 'Member'}!</h2>
               <p className="text-amber-800/80 mb-4 max-w-md">A special birthday gift from Rivoré awaits you.</p>
               <Link to="/account/coupons" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full tracking-wider uppercase text-xs transition-colors shadow-md shadow-amber-500/20">Claim Gift</Link>
             </div>
          </div>
        </div>
      )}

      {/* DASHBOARD HERO */}
      <section className="relative w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-[#f4f2f7] min-h-[450px] flex items-center p-8 md:p-16 shadow-inner border border-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ece7f5] via-[#ffffff] to-[#f8f9fa] opacity-90"></div>
        
        {/* Floating Glass Elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse duration-1000"></div>
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rotate-12"></div>
        <div className="hidden lg:block absolute right-32 top-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-white/20 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.02)] -rotate-6"></div>

        <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Welcome Block */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="w-4 h-4" /> Exclusive Club Member
            </div>
            <h1 className="text-4xl md:text-6xl font-serif text-[#111111] leading-tight">
              Welcome back,<br/><span className="font-light italic text-gray-500">{user?.fullName || 'Member'}</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Member Since</p>
                <p className="text-xl font-serif text-gray-900">{joinDate}</p>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Current Status</p>
                <p className="text-xl font-serif text-gray-900">{tier}</p>
              </div>
            </div>
          </div>

          {/* MEMBERSHIP CARD */}
          <div className="w-full max-w-[400px] lg:max-w-[450px] shrink-0 perspective-1000">
            <div className={`relative w-full aspect-[1.586/1] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col justify-between shadow-2xl transition-all duration-700 hover:scale-105 hover:rotate-1 ${cardBg} ${cardText} border border-white/10`}>
              <div className={`absolute inset-0 bg-gradient-to-tr ${cardShine} rounded-[1.5rem] md:rounded-[2rem]`}></div>
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl tracking-widest uppercase">Rivoré</h3>
                  <p className={`text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold ${cardAccent} mt-1`}>Private Club</p>
                </div>
                <div className="text-right">
                  <p className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold ${cardAccent} mb-0.5`}>Status</p>
                  <p className="font-serif text-lg tracking-wider">{tier}</p>
                </div>
              </div>

              <div className="relative z-10 mt-auto">
                <p className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold ${cardAccent} mb-1`}>Member ID / {user?.email.split('@')[0]}</p>
                <p className="font-mono text-lg md:text-xl uppercase tracking-[0.2em] mb-4">
                  {user?._id?.substring(0,4) || 'RIV'}-{user?._id?.substring(4,8) || '0000'}-{user?._id?.substring(8,12) || '0000'}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold ${cardAccent} mb-0.5`}>Cardholder</p>
                    <p className="font-medium text-sm md:text-base uppercase tracking-wider">{user?.fullName || 'Valued Member'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold ${cardAccent} mb-0.5`}>Since</p>
                    <p className="font-medium text-sm md:text-base">{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* LUXURY PROGRESS SYSTEM & STATS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress System */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-6">Tier Progress</h3>
          <div className="flex justify-between items-end mb-2">
            <span className="font-serif text-2xl text-gray-900">{tier} Member</span>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{progressToNext.toFixed(0)}% to {nextTier}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-4 mb-3">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progressToNext}%` }}></div>
          </div>
          {tier !== 'Platinum' ? (
            <p className="text-xs text-gray-500 text-right">Spend ৳{(spendRequired - lifetimeSpend).toLocaleString()} more to upgrade</p>
          ) : (
            <p className="text-xs text-gray-500 text-right">You are at the highest tier.</p>
          )}
        </div>

        {/* Member Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center hover:-translate-y-1 transition-transform">
            <Package className="w-6 h-6 text-gray-400 mb-3" />
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Total Orders</p>
            <p className="text-2xl font-serif text-gray-900">{data.orders.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center hover:-translate-y-1 transition-transform">
            <CreditCard className="w-6 h-6 text-gray-400 mb-3" />
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Lifetime Spend</p>
            <p className="text-2xl font-serif text-gray-900">৳{lifetimeSpend.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center hover:-translate-y-1 transition-transform">
            <Award className="w-6 h-6 text-primary mb-3" />
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Reward Points</p>
            <p className="text-2xl font-serif text-primary">{data.rewards.points}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-center hover:-translate-y-1 transition-transform">
            <Users className="w-6 h-6 text-emerald-500 mb-3" />
            <p className="text-xs uppercase tracking-widest text-emerald-500 font-bold mb-1">Ref. Earnings</p>
            <p className="text-2xl font-serif text-emerald-600">৳{referralEarnings}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* EXCLUSIVE BENEFITS & RECENT ACTIVITY */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Recent Activity */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">Recent Activity</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Your latest journey</p>
              </div>
              <Link to="/account/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
            </div>
            <div className="p-0">
              {data.orders.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Clock className="w-6 h-6 text-gray-300" /></div>
                  <h3 className="text-lg font-serif text-gray-900 mb-1">Your fragrance journey begins here.</h3>
                  <p className="text-gray-500 text-sm">Discover your signature scent to unlock rewards.</p>
                  <Link to="/shop" className="inline-block mt-4 text-xs font-bold uppercase tracking-widest bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-primary transition-colors">Explore Collection</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.orders.slice(0, 3).map((order) => (
                    <div key={order._id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-bold text-gray-900">৳{order.totalAmount}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Personalized Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-serif text-gray-900">Curated For You</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Based on your collection</p>
              </div>
              <Link to="/shop" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">Shop All <ChevronRight className="w-3 h-3" /></Link>
            </div>
            
            {data.recommendations.length === 0 ? (
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-[2rem] p-8 border border-gray-100 text-center">
                <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Make your first purchase to receive personalized fragrance recommendations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.recommendations.slice(0,4).map((product) => (
                  <Link key={product._id} to={`/product/${product._id}`} className="group bg-white border border-gray-100 rounded-2xl p-3 hover:border-primary/30 hover:shadow-md transition-all flex flex-col">
                    <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3 relative">
                      <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">{product.category}</p>
                    <p className="font-serif font-bold text-gray-900 mt-auto">৳{product.price}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
          
        </div>

        {/* MY PRIVILEGES SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-[#111111] text-white rounded-[2rem] p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> My Privileges
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">✔</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Birthday Rewards</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">✔</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Loyalty Discounts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">✔</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Referral Bonuses</span>
                </li>
                <li className={`flex items-center gap-3 ${tier === 'Regular' ? 'opacity-40' : ''}`}>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">{tier === 'Regular' ? '🔒' : '✔'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Early Access Collections</span>
                </li>
                <li className={`flex items-center gap-3 ${(tier === 'Regular' || tier === 'Silver') ? 'opacity-40' : ''}`}>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">{(tier === 'Regular' || tier === 'Silver') ? '🔒' : '✔'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-300">VIP Offers</span>
                </li>
              </ul>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link to="/account/membership" className="w-full block text-center bg-white text-black py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                  View Full Benefits
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
