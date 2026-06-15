import React, { useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { Loader2, KeyRound, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletters: true
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      await customerApi.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preferences updated');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#111111]">Account Settings</h1>
        <p className="text-[#777777] mt-2">Manage your security and preferences.</p>
      </div>

      <div className="space-y-12">
        {/* Security Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#111111] text-white px-8 py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Notifications Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-500">Emails about your order status and shipping</p>
              </div>
              <button 
                onClick={() => handleToggle('orderUpdates')}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${notifications.orderUpdates ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${notifications.orderUpdates ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Promotions & Offers</p>
                <p className="text-sm text-gray-500">Exclusive deals and new arrivals</p>
              </div>
              <button 
                onClick={() => handleToggle('promotions')}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${notifications.promotions ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${notifications.promotions ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-500">Weekly updates from Rivoré</p>
              </div>
              <button 
                onClick={() => handleToggle('newsletters')}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${notifications.newsletters ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${notifications.newsletters ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
