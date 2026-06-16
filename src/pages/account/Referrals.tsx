import React, { useEffect, useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { Loader2, Copy, Share2, Users, Trophy, Gift, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Referrals() {
  const [referral, setReferral] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [refData, leaderRes] = await Promise.all([
        customerApi.getReferrals(),
        fetch('/api/customer/referrals/leaderboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
        })
      ]);
      setReferral(refData);
      if (leaderRes.ok) {
        setLeaderboard(await leaderRes.json());
      }
    } catch (error) {
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referral?.referralCode 
    ? `${window.location.origin}/register?ref=${referral.referralCode}` 
    : '';

  const shareText = `Join the Rivoré Club! Get 10% off your first luxury fragrance order using my invite link: ${referralLink}`;

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent('Join Rivoré and get 10% off!')}`, '_blank');
  };

  const shareToMessenger = () => {
    window.open(`fb-messenger://share/?link=${encodeURIComponent(referralLink)}`, '_blank');
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const successfulReferralsCount = referral?.referredUsers?.filter((u: any) => u.rewardIssued).length || 0;
  const pointsEarned = successfulReferralsCount * 100;

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif text-[#111111] mb-3">Referral Club</h1>
        <p className="text-[#777777]">
          Invite your friends to experience Rivoré. They get a <strong className="text-primary">10% Welcome Gift</strong>, and you earn <strong className="text-primary">100 Reward Points</strong> when they make their first purchase.
        </p>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-4xl font-serif text-gray-900 mb-1">{successfulReferralsCount}</p>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Successful Invites</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6" />
          </div>
          <p className="text-4xl font-serif text-gray-900 mb-1">{pointsEarned}</p>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Points Earned</p>
        </div>
      </div>

      {/* Share Card */}
      <div className="bg-[#111111] text-white rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-gray-400 font-bold mb-6">Your Private Invite Link</h2>
          
          <div className="bg-black/50 border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto mb-8 backdrop-blur-md">
            <input 
              type="text" 
              readOnly 
              value={referralLink} 
              className="bg-transparent w-full px-4 py-3 text-center sm:text-left text-gray-200 font-mono text-sm outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="w-full sm:w-auto bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-4">Or share directly via</p>
          <div className="flex justify-center gap-4">
            <button onClick={shareToWhatsApp} className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.606 6.014L.132 23.468l5.586-1.464a12.008 12.008 0 006.313 1.764h.004c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.734c-1.785 0-3.535-.48-5.07-1.387l-.364-.216-3.771.989.998-3.676-.237-.377A9.972 9.972 0 012.033 12.03c0-5.518 4.49-10.006 10.004-10.006 2.673 0 5.185 1.04 7.075 2.932 1.89 1.892 2.93 4.404 2.93 7.076 0 5.516-4.49 10.002-10.011 10.002h-.001zm5.498-7.508c-.301-.151-1.784-.881-2.06-9.82-.276-.15-.477-.15-.678.151-.201.302-.778.982-.954 1.183-.176.201-.352.226-.653.075-.301-.151-1.272-.469-2.423-1.496-.895-.8-1.5-1.787-1.676-2.088-.176-.302-.019-.465.132-.616.136-.136.301-.352.452-.528.151-.176.201-.302.301-.503.101-.201.05-.377-.025-.528-.075-.151-.678-1.635-.928-2.238-.243-.588-.49-.508-.678-.518-.176-.008-.377-.008-.578-.008s-.528.075-.803.377c-.276.302-1.054 1.031-1.054 2.514s1.079 2.916 1.23 3.117c.151.201 2.124 3.242 5.143 4.544.718.309 1.278.494 1.714.633.722.229 1.38.196 1.896.119.58-.087 1.784-.73 2.035-1.434.251-.704.251-1.308.176-1.434-.075-.126-.276-.201-.577-.352z"/></svg>
            </button>
            <button onClick={shareToFacebook} className="w-12 h-12 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button onClick={shareToMessenger} className="w-12 h-12 bg-gradient-to-tr from-[#00C6FF] to-[#0072FF] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654v4.235l4.086-2.243c1.09.301 2.246.465 3.445.465 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.259-5.963 3.259 6.559-6.963 3.131 3.259 5.889-3.259-6.561 6.963z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Your Referrals List */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Invites</h2>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            {!referral?.referredUsers || referral.referredUsers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No invites yet</h3>
                <p className="text-gray-500 text-sm">Share your link to start earning rewards.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-4 px-6 text-xs uppercase tracking-widest font-bold text-gray-500">Friend's Email</th>
                      <th className="py-4 px-6 text-xs uppercase tracking-widest font-bold text-gray-500">Joined</th>
                      <th className="py-4 px-6 text-xs uppercase tracking-widest font-bold text-gray-500">Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referral.referredUsers.map((ref: any, index: number) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-sm text-gray-900">{ref.email}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{new Date(ref.dateJoined).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          {ref.rewardIssued ? (
                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] tracking-wider font-bold uppercase border border-green-200">Earned 100 PTS</span>
                          ) : (
                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] tracking-wider font-bold uppercase border border-amber-200">Pending Order</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border border-amber-100 p-6 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hall of Fame</h2>
                <p className="text-xs text-amber-700/70">Top Referrers</p>
              </div>
            </div>

            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No top referrers yet.</p>
              ) : (
                leaderboard.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-amber-50 shadow-[0_2px_10px_rgba(251,191,36,0.05)]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-400 text-white shadow-md shadow-amber-200' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-200 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>
                        {idx + 1}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{user.fullName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{user.successfulReferrals}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
