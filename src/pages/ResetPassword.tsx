import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { customerApi } from '../lib/customerApi';
import { TurnstileWidget } from '../components/TurnstileWidget';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerApi.requestPasswordReset({ email, turnstileToken });
      toast.success('If the email is registered, an OTP has been sent.');
      setStep(2);
      setTurnstileToken(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerApi.verifyPasswordReset({ email, otp, newPassword, turnstileToken });
      toast.success('Password reset successfully. You can now log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#f8f5ff] to-transparent -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] -z-10 animate-breathe"></div>
      
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(109,40,217,0.06)] border border-[#eeeeee] w-full max-w-md relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#111111] mb-2">Reset Password</h1>
          <p className="text-[#555555] text-sm md:text-base">
            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <TurnstileWidget 
              key={`ts-1-${step}`}
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => toast.error('Security verification failed.')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-[#111111] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(109,40,217,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">OTP Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-center tracking-[0.5em] text-lg"
                placeholder="123456"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <TurnstileWidget 
              key={`ts-2-${step}`}
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => toast.error('Security verification failed.')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-[#111111] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(109,40,217,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
           <p className="text-sm text-[#777777]">
             Remembered your password? <Link to="/login" className="font-bold text-[#111111] hover:text-primary transition-colors">Sign In</Link>
           </p>
        </div>

      </div>
    </div>
  );
}
