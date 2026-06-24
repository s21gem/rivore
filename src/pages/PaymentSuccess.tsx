import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { trackPurchase } from '../components/MetaPixel';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { user } = useCustomerAuthStore();
  
  const invoice_id = searchParams.get('invoice_id');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (!invoice_id) {
      setStatus('failed');
      setMessage('Invalid payment reference.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/payment/uddoktapay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice_id })
        });
        const data = await res.json();
        
        if (data.success && data.verifyData?.status === 'COMPLETED') {
          setStatus('success');
          clearCart();
          // Fire Browser Pixel if verification succeeds
          if (data.verifyData.amount) {
             trackPurchase(parseFloat(data.verifyData.amount), 'BDT');
          }
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed.');
        }
      } catch (error) {
        setStatus('failed');
        setMessage('Network error during verification. We will verify via IPN.');
      }
    };

    verifyPayment();
  }, [invoice_id, clearCart]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-serif">Verifying Payment...</h2>
          <p className="text-muted-foreground mt-2">Please do not close this window.</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
        <div className="bg-white p-10 md:p-14 rounded-3xl border border-border text-center max-w-xl mx-4 shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Payment Failed</h1>
          <p className="text-muted-foreground mb-8">{message}</p>
          <Link to="/checkout" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:bg-primary/90">
            Return to Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-20 flex items-center justify-center">
      <div className="bg-white p-10 md:p-14 rounded-3xl border border-border text-center max-w-xl mx-4 shadow-sm animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">Payment Successful 🎉</h1>
        <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl mb-8">
          <p className="text-lg font-medium text-primary">Your order has been confirmed.</p>
          <p className="text-sm text-muted-foreground mt-2">Invoice: {invoice_id}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link to={`/track`} className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-bold hover:bg-primary/90 flex-1">
            <Truck className="w-4 h-4" /> Track Order
          </Link>
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-4 rounded-full text-sm font-bold hover:bg-muted/80 flex-1">
            <ShoppingBag className="w-4 h-4" /> Shop More
          </Link>
        </div>
        
        {!user && invoice_id && (
           <div className="border-t border-border pt-8 mt-4">
             <h3 className="text-xl font-serif font-bold text-foreground mb-2">Save your details for next time?</h3>
             <p className="text-sm text-muted-foreground mb-6">Create a password to track this order and speed up future checkouts.</p>
             <form 
               onSubmit={async (e) => {
                 e.preventDefault();
                 const form = e.target as HTMLFormElement;
                 const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                 const pwd = (form.elements.namedItem('pwd') as HTMLInputElement).value;
                 try {
                   const res = await fetch('/api/auth/upgrade-guest', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ invoiceId: invoice_id, email: email, password: pwd })
                   });
                   if (res.ok) {
                     toast.success('Account created! Please log in next time you shop.');
                     window.location.href = '/account';
                   } else {
                     const data = await res.json();
                     toast.error(data.message || 'Failed to create account');
                   }
                 } catch (err) {
                   toast.error('Network error');
                 }
               }} 
               className="max-w-xs mx-auto flex flex-col gap-3"
             >
               <input type="email" name="email" placeholder="Enter your email address" required className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary w-full" />
               <input type="password" name="pwd" placeholder="Enter a password (min 6 chars)" minLength={6} required className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary w-full" />
               <button type="submit" className="w-full bg-[#111] text-white py-3 rounded-xl font-bold hover:bg-primary transition-colors">Create Account</button>
             </form>
           </div>
        )}
      </div>
    </div>
  );
}
