import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // User login logic will be implemented here later
    alert("User login functionality will be implemented in the future.");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#f8f5ff] to-transparent -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px] -z-10 animate-breathe"></div>
      
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(109,40,217,0.06)] border border-[#eeeeee] w-full max-w-md relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#111111] mb-2">Welcome Back</h1>
          <p className="text-[#555555] text-sm md:text-base">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
               <label className="text-xs uppercase font-bold tracking-widest text-[#555555]">Password</label>
               <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full group bg-[#111111] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(109,40,217,0.3)]"
          >
            Sign In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-sm text-[#777777]">
             Don't have an account? <a href="#" className="font-bold text-[#111111] hover:text-primary transition-colors">Sign Up</a>
           </p>
        </div>

      </div>
    </div>
  );
}
