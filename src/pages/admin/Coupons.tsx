import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

export default function Coupons() {
  const { token } = useAuthStore();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('flat');
  const [discountAmount, setDiscountAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountAmount) return toast.error('Code and discount amount are required');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountAmount: Number(discountAmount)
        })
      });

      if (res.ok) {
        toast.success('Coupon created successfully');
        setCode('');
        setDiscountAmount('');
        fetchCoupons();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to create coupon');
      }
    } catch (err) {
      toast.error('Server error creating coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, codeStr: string) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${codeStr}?`)) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Coupon deleted');
        setCoupons(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (err) {
      toast.error('Server error deleting coupon');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-2">
            <Tag className="w-8 h-8 text-primary" />
            Coupons
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="lg:col-span-1 border border-border bg-card shadow-sm rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-serif font-semibold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            New Coupon
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER24"
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none text-foreground uppercase"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Discount Type</label>
              <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-xl border border-border">
                <label className="flex items-center gap-2 cursor-pointer flex-1 justify-center py-2">
                  <input type="radio" checked={discountType === 'flat'} onChange={() => setDiscountType('flat')} className="accent-primary" />
                  <span className="text-sm font-medium">Flat (৳)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer flex-1 justify-center py-2 border-l border-border/50">
                  <input type="radio" checked={discountType === 'percentage'} onChange={() => setDiscountType('percentage')} className="accent-primary" />
                  <span className="text-sm font-medium">Percentage (%)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Discount Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                placeholder={discountType === 'flat' ? 'e.g. 500' : 'e.g. 10'}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium tracking-wide hover:bg-primary/95 transition-all shadow-md disabled:opacity-70 mt-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* Coupon List */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="p-4 text-sm font-semibold text-muted-foreground w-1/3">Code</th>
                    <th className="p-4 text-sm font-semibold text-muted-foreground text-center">Discount</th>
                    <th className="p-4 text-sm font-semibold text-muted-foreground text-center">Used</th>
                    <th className="p-4 text-sm font-semibold text-muted-foreground text-center">Status</th>
                    <th className="p-4 text-sm font-semibold text-muted-foreground text-right w-16">Acc</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground italic bg-background/50">
                        No coupons found. Create your first coupon!
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="p-4">
                          <span className="font-bold tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
                            {c.code}
                          </span>
                        </td>
                        <td className="p-4 text-center font-medium">
                          {c.discountType === 'flat' ? `৳${c.discountAmount}` : `${c.discountAmount}%`}
                        </td>
                        <td className="p-4 text-center text-muted-foreground text-sm">
                          {c.usageCount} times
                        </td>
                        <td className="p-4 text-center">
                          {c.isActive ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">Active</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase tracking-wider">Inactive</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDelete(c._id, c.code)}
                            className="bg-transparent hover:bg-red-50 text-red-500 hover:text-red-700 p-2 rounded-xl transition-colors border border-transparent hover:border-red-100"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
