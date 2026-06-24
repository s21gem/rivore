import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, User, ShoppingBag, ShieldCheck, Gift, Clock, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { customerApi } from '../lib/customerApi';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { TurnstileWidget } from '../components/TurnstileWidget';

export default function CheckoutAuth() {
  const navigate = useNavigate();
  const { user, setAuth } = useCustomerAuthStore();
  
  const [activeTab, setActiveTab] = useState<'guest' | 'login' | 'register'>('guest');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Settings for dynamic benefits
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (user) {
      navigate('/checkout');
    }
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await customerApi.login({ email: loginEmail, password: loginPassword, turnstileToken });
      setAuth(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/checkout');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await customerApi.register({ name: regName, email: regEmail, password: regPassword, turnstileToken });
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
      navigate('/checkout');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Clock, title: 'Faster Checkout', desc: 'Save your addresses and details' },
    { icon: Truck, title: 'Order Tracking', desc: 'Real-time updates on your shipments' },
    { icon: Gift, title: 'Exclusive Offers', desc: 'Personalized coupons just for you' },
  ];

  if (settings?.rewardSettings?.enabled || settings?.tierSettings?.enabled) {
    benefits.push({ icon: ShieldCheck, title: 'Loyalty Rewards', desc: 'Earn points and tier discounts' });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-12 md:py-20 px-4 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#eeeeee] overflow-hidden">
        
        {/* Left Side - Authentication Options */}
        <div className="w-full lg:w-3/5 p-8 md:p-12 lg:p-16">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#111111] mb-2">Secure Checkout</h1>
            <p className="text-[#555555]">How would you like to proceed?</p>
          </div>

          {/* Segmented Controls */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setActiveTab('guest')} 
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'guest' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Guest
            </button>
            <button 
              onClick={() => setActiveTab('login')} 
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'login' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setActiveTab('register')} 
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'register' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Create Account
            </button>
          </div>

          {/* Form Area */}
          <div className="min-h-[300px]">
            {activeTab === 'guest' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center text-center h-full pt-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quick & Easy</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">Proceed without creating an account. You can track your order using your email address later.</p>
                <button 
                  onClick={() => {
                    // Send analytics
                    if (window.fbq) window.fbq('trackCustom', 'GuestCheckoutSelected');
                    navigate('/checkout');
                  }}
                  className="w-full sm:w-auto bg-[#111] text-white px-10 py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all flex items-center justify-center gap-2"
                >
                  Continue as Guest <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500 ml-1">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="••••••••" />
                  </div>
                </div>
                <TurnstileWidget onVerify={setTurnstileToken} onError={() => toast.error('Security check failed')} />
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4">
                  {loading ? 'Logging in...' : 'Log In to Checkout'}
                </button>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500 ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-gray-500 ml-1">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium" placeholder="••••••••" />
                  </div>
                </div>
                <TurnstileWidget onVerify={setTurnstileToken} onError={() => toast.error('Security check failed')} />
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4">
                  {loading ? 'Creating...' : 'Create Account & Checkout'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side - Smart Benefits Detection */}
        <div className="w-full lg:w-2/5 bg-gray-50 p-8 md:p-12 lg:p-16 border-l border-[#eeeeee]">
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold text-[#111] mb-2">Why create an account?</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Join the Rivoré family and unlock a premium shopping experience with exclusive perks.</p>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.03)] border border-gray-100 transition-all hover:border-primary/20">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center text-xs text-gray-400">
            Secure processing via 256-bit encryption.
          </div>
        </div>

      </div>
    </div>
  );
}
