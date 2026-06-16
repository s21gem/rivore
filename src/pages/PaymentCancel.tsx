import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
      <div className="bg-white p-10 md:p-14 rounded-3xl border border-border text-center max-w-xl mx-4 shadow-sm">
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">You have cancelled the payment process. Your order was not completed.</p>
        <Link to="/checkout" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold hover:bg-primary/90">
          Return to Checkout
        </Link>
      </div>
    </div>
  );
}
