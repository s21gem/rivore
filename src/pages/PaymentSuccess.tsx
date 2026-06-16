import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/track`} className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-bold hover:bg-primary/90 flex-1">
            <Truck className="w-4 h-4" /> Track Order
          </Link>
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-4 rounded-full text-sm font-bold hover:bg-muted/80 flex-1">
            <ShoppingBag className="w-4 h-4" /> Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}
