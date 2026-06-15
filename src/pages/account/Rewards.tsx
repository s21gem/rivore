import React, { useEffect, useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { Loader2, Award, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Rewards() {
  const [reward, setReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const data = await customerApi.getRewards();
      setReward(data);
    } catch (error) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#111111]">Rivoré Rewards</h1>
        <p className="text-[#777777] mt-2">Earn points with every purchase and redeem them for exclusive discounts.</p>
      </div>

      <div className="bg-gradient-to-br from-[#111111] to-[#2a2a2a] rounded-[2rem] p-8 md:p-10 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-sm mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Available Balance
            </p>
            <div className="text-6xl font-serif font-bold mb-2">{reward?.points || 0}</div>
            <p className="text-gray-300">points</p>
          </div>
          
          <button className="w-full md:w-auto bg-white text-[#111111] px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            Redeem Points
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        
        {!reward?.transactions || reward.transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">
            No reward transactions yet. Start shopping to earn points!
          </div>
        ) : (
          <div className="space-y-4">
            {reward.transactions.map((tx: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'Earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'Earned' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-bold ${tx.type === 'Earned' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'Earned' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
