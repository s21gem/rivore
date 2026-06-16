import React, { useState, useEffect } from 'react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { CreditCard, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentMethods() {
  const { user, token, updateUser } = useCustomerAuthStore();
  const [preferredMethod, setPreferredMethod] = useState<string>('COD');
  const [loading, setLoading] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    // Set initial preferred method
    if (user?.preferredPaymentMethod) {
      setPreferredMethod(user.preferredPaymentMethod);
    }

    // Fetch available methods
    fetch('/api/payment/methods')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          setAvailableMethods(data);
        } else {
          // Fallback if endpoint fails
          setAvailableMethods([
            { id: 'COD', name: 'Cash on Delivery' },
            { id: 'bKash', name: 'bKash' }
          ]);
        }
      })
      .catch(() => {
        setAvailableMethods([
          { id: 'COD', name: 'Cash on Delivery' },
          { id: 'bKash', name: 'bKash' }
        ]);
      });
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ preferredPaymentMethod: preferredMethod })
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        toast.success('Preferred payment method saved!');
      } else {
        throw new Error('Failed to update payment preference');
      }
    } catch (error: any) {
      toast.error(error.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#111111]">Payment Methods</h1>
        <p className="text-[#777777] mt-2">Manage your default payment preference for a faster checkout experience.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          Preferred Payment Method
        </h2>

        <div className="space-y-4">
          {availableMethods.map((method) => {
            const isSelected = preferredMethod === method.id;
            return (
              <div 
                key={method.id}
                onClick={() => setPreferredMethod(method.id)}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{method.name}</h3>
                    {isSelected && <p className="text-sm text-primary font-medium mt-1">Default</p>}
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-6 h-6 text-primary" />}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={loading || preferredMethod === user?.preferredPaymentMethod}
            className="w-full sm:w-auto bg-[#111111] text-white px-8 py-4 rounded-xl font-bold hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Preference'}
          </button>
        </div>
      </div>
    </div>
  );
}
