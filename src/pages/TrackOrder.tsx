import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, Phone, CheckCircle, Clock, Truck, XCircle, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackedOrder {
  _id: string;
  customer: { name: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_STEPS = ['Pending', 'Called', 'Confirmed', 'Delivered'];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending': return <Clock className="w-5 h-5" />;
    case 'Called': return <PhoneCall className="w-5 h-5" />;
    case 'Confirmed': return <CheckCircle className="w-5 h-5" />;
    case 'Delivered': return <Truck className="w-5 h-5" />;
    case 'Cancelled': return <XCircle className="w-5 h-5" />;
    default: return <Package className="w-5 h-5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Called': return 'text-slate-600 bg-slate-50 border-slate-200';
    case 'Confirmed': return 'text-green-600 bg-green-50 border-green-200';
    case 'Delivered': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 11) {
      setError('Please enter a valid 11-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else if (res.status === 404) {
        setOrders([]);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if phone from URL
  React.useEffect(() => {
    if (initialPhone && initialPhone.length >= 11) {
      handleSearch();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-3">Track Your Order</h1>
          <p className="text-muted-foreground text-lg">Enter your phone number to see your order status</p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSearch}
          className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm mb-10"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(''); }}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none font-mono text-lg transition-all placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-70 flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Track</span>
                </>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3 ml-1">{error}</p>}
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-border text-center shadow-sm">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">No Orders Found</h3>
                  <p className="text-muted-foreground mb-6">We couldn't find any orders with this phone number.</p>
                  <Link to="/shop" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-all">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground text-center">
                    {orders.length} order{orders.length > 1 ? 's' : ''} found for <span className="font-mono font-medium text-foreground">{phone}</span>
                  </p>

                  {orders.map((order, idx) => {
                    const isCancelled = order.status === 'Cancelled';
                    const currentStepIndex = STATUS_STEPS.indexOf(order.status);

                    return (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
                      >
                        {/* Order Header */}
                        <div className="p-6 md:p-8 border-b border-border">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                            <div>
                              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Order #{order._id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </div>

                          {/* Status Timeline */}
                          {!isCancelled && (
                            <div className="flex items-center justify-between relative mt-6">
                              {/* Progress bar */}
                              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
                              <div
                                className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-700"
                                style={{ width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
                              />

                              {STATUS_STEPS.map((step, i) => {
                                const isCompleted = i <= currentStepIndex;
                                const isCurrent = i === currentStepIndex;
                                return (
                                  <div key={step} className="flex flex-col items-center relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                      isCompleted
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                                      {isCompleted ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : (
                                        <span className="text-xs font-bold">{i + 1}</span>
                                      )}
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-wider mt-2 font-medium ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {isCancelled && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 text-center">
                              <p className="text-red-700 font-medium">This order has been cancelled.</p>
                            </div>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="p-6 md:p-8">
                          <div className="space-y-3 mb-6">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <span className="bg-foreground text-background text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {item.quantity}
                                  </span>
                                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                                </div>
                                <span className="font-semibold text-sm">৳{(item.price * item.quantity).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                {order.paymentMethod}
                              </span>
                              <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                                order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.paymentStatus || 'Pending'}
                              </span>
                            </div>
                            <span className="text-2xl font-serif font-bold text-foreground">৳{order.totalAmount.toFixed(0)}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground">
            Need help? <Link to="/contact" className="text-primary font-medium hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
