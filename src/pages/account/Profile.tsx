import React, { useEffect, useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { toast } from 'sonner';
import { Loader2, Award, ChevronRight, Gift, Copy, Users } from 'lucide-react';
import Recommendations from '../../components/Recommendations';
import { useSettingsStore } from '../../store/settingsStore';

export default function Profile() {
  const { user, updateUser } = useCustomerAuthStore();
  const { settings, fetchSettings } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [birthdayCoupon, setBirthdayCoupon] = useState<any>(null);
  const [referralData, setReferralData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchSettings();
    fetchBirthdayCoupon();
    fetchReferrals();
  }, []);

  const fetchBirthdayCoupon = async () => {
    try {
      const data = await customerApi.getBirthdayCoupon();
      if (data && data.coupon) {
        setBirthdayCoupon(data.coupon);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchReferrals = async () => {
    try {
      const data = await customerApi.getReferrals();
      setReferralData(data);
    } catch (e) {
      // ignore
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await customerApi.getProfile();
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        gender: data.gender || ''
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user } = await customerApi.updateProfile(formData);
      updateUser(user);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const tierSettings = settings?.tierSettings;
  const lifetimeSpend = user?.lifetimeSpend || 0;
  const currentTier = user?.tier || 'Regular';

  let nextTier = '';
  let spendToNext = 0;
  let progress = 0;

  if (tierSettings?.enabled) {
    if (currentTier === 'Regular') {
      nextTier = 'Silver';
      spendToNext = tierSettings.silverSpend - lifetimeSpend;
      progress = (lifetimeSpend / tierSettings.silverSpend) * 100;
    } else if (currentTier === 'Silver') {
      nextTier = 'Gold';
      spendToNext = tierSettings.goldSpend - lifetimeSpend;
      progress = (lifetimeSpend / tierSettings.goldSpend) * 100;
    } else if (currentTier === 'Gold') {
      nextTier = 'Platinum';
      spendToNext = tierSettings.platinumSpend - lifetimeSpend;
      progress = (lifetimeSpend / tierSettings.platinumSpend) * 100;
    } else if (currentTier === 'Platinum') {
      progress = 100;
    }
  }

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Silver': return 'text-gray-500 bg-gray-100 border-gray-200';
      case 'Gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Platinum': return 'text-slate-800 bg-slate-100 border-slate-300';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#111111]">Personal Profile</h1>
        <p className="text-[#777777] mt-2">Manage your personal information and contact details.</p>
      </div>

      {birthdayCoupon && (
        <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Happy Birthday! 🎉</h3>
              <p className="text-white/90 text-sm mb-4">
                As a special treat, enjoy {birthdayCoupon.discountType === 'percentage' ? `${birthdayCoupon.discountAmount}%` : `৳${birthdayCoupon.discountAmount}`} off your next order. Valid for 7 days.
              </p>
              <div className="bg-white/20 p-3 rounded-xl flex items-center justify-between backdrop-blur-sm border border-white/20">
                <span className="font-mono text-lg font-bold tracking-widest">{birthdayCoupon.code}</span>
                <button 
                  onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(birthdayCoupon.code); toast.success('Coupon code copied!'); }}
                  className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-white/90 transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tierSettings?.enabled && (
        <div className={`mb-8 p-6 rounded-2xl border ${getTierColor(currentTier)} shadow-sm`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-lg uppercase tracking-wider">{currentTier} Member</h3>
              </div>
              <p className="text-sm opacity-80">Lifetime Spend: ৳{lifetimeSpend.toLocaleString()}</p>
            </div>
            <div className="text-right">
              {currentTier === 'Platinum' ? (
                <span className="text-sm font-medium uppercase tracking-widest opacity-80">Highest Tier</span>
              ) : (
                <span className="text-sm font-medium uppercase tracking-widest opacity-80">Next: {nextTier}</span>
              )}
            </div>
          </div>
          
          {currentTier !== 'Platinum' && (
            <div>
              <div className="w-full bg-black/5 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-current h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
              </div>
              <p className="text-xs font-medium opacity-80 text-right">Spend ৳{spendToNext > 0 ? spendToNext.toLocaleString() : 0} more for {nextTier}</p>
            </div>
          )}
        </div>
      )}

      {/* REFERRAL SYSTEM SECTION */}
      {settings?.referralRewardSettings?.enabled && referralData && (
        <div className="mb-8 p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-indigo-900">Refer a Friend</h3>
          </div>
          <p className="text-sm text-indigo-800/80 mb-6">
            Invite your friends to Rivoré. You'll earn <span className="font-bold text-indigo-700">{settings.referralRewardSettings.rewardPoints} points</span> when they complete their first order!
          </p>

          <div className="bg-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-100 mb-6">
            <div className="w-full sm:w-auto overflow-hidden">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Your Referral Link</p>
              <div className="font-mono text-sm text-slate-700 truncate select-all">
                {window.location.origin}/register?ref={referralData.referralCode}
              </div>
            </div>
            <button 
              onClick={(e) => { 
                e.preventDefault(); 
                navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referralData.referralCode}`); 
                toast.success('Referral link copied!'); 
              }}
              className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-indigo-900">{referralData.referredUsers?.length || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-indigo-100 text-center">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">Points Earned</p>
              <p className="text-2xl font-bold text-indigo-900">
                {referralData.referredUsers?.filter((u: any) => u.rewardIssued).length * (settings.referralRewardSettings.rewardPoints || 100) || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
              placeholder="+880 1..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Gender (Optional)</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-8 bg-[#111111] text-white px-8 py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(109,40,217,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
        </button>
      </form>

      <div className="mt-16 -mx-4 md:-mx-8 border-t border-gray-100 pt-8">
        <Recommendations title="Recommended For You" limit={4} />
      </div>
    </div>
  );
}
