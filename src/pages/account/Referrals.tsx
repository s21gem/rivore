import React, { useEffect, useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { Loader2, Copy, Share2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Referrals() {
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const data = await customerApi.getReferrals();
      setReferral(data);
    } catch (error) {
      toast.error('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (referral?.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      toast.success('Referral code copied!');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#111111]">Refer & Earn</h1>
        <p className="text-[#777777] mt-2">Invite your friends to Rivoré. They get 10% off, and you get 500 reward points!</p>
      </div>

      <div className="bg-[#f8f5ff] border border-primary/20 rounded-[2rem] p-8 md:p-12 mb-10 text-center relative overflow-hidden">
        <Users className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Your Unique Referral Code</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Share this code with your friends during their checkout to claim your rewards.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="bg-white border-2 border-primary border-dashed rounded-2xl px-8 py-4 font-mono text-3xl font-bold text-primary tracking-widest">
            {referral?.referralCode || '------'}
          </div>
          <button 
            onClick={copyToClipboard}
            className="bg-[#111111] text-white p-4 rounded-2xl hover:bg-primary transition-colors shadow-lg"
          >
            <Copy className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Referrals</h2>
        
        {!referral?.referredUsers || referral.referredUsers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">
            You haven't referred anyone yet. Start sharing!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-sm uppercase font-bold text-gray-500">Friend's Email</th>
                  <th className="py-4 px-4 text-sm uppercase font-bold text-gray-500">Date Joined</th>
                  <th className="py-4 px-4 text-sm uppercase font-bold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {referral.referredUsers.map((ref: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{ref.email}</td>
                    <td className="py-4 px-4 text-gray-500">{new Date(ref.dateJoined).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      {ref.rewardIssued ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Rewarded</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending</span>
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
  );
}
