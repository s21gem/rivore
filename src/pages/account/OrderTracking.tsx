import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerApi } from '../../lib/customerApi';
import { Loader2, ArrowLeft, Package, CheckCircle2, Truck, Box, ClipboardList, RefreshCw, ShoppingBag, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/customer/orders/${orderId}/track`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      toast.error('Could not load order tracking information.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleSync = () => {
    setSyncing(true);
    fetchOrder();
  };

  const handleBuyAgain = () => {
    if (!order || !order.items) return;
    
    // Add all items back to cart
    order.items.forEach((item: any) => {
      // Create a simplified product object for the cart
      const productForCart = {
        id: (item.product?._id || item.combo?._id || Math.random().toString()) + (item.size ? `-${item.size}` : ''),
        productId: item.product?._id,
        comboId: item.combo?._id,
        name: item.name,
        price: item.price,
        image: item.image,
        type: item.type as any,
        quantity: item.quantity,
        size: item.size
      };
      
      addItem(productForCart);
    });
    
    toast.success('Items added to cart');
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-serif text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We couldn't find the tracking information for this order.</p>
        <Link to="/account/orders" className="text-primary hover:underline font-medium">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  // Define the timeline steps
  const steps = [
    { id: 'Placed', label: 'Order Placed', icon: ClipboardList },
    { id: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
    { id: 'Processing', label: 'Processing', icon: Package },
    { id: 'Packed', label: 'Packed', icon: Box },
    { id: 'Courier Received', label: 'Courier Received', icon: Box },
    { id: 'In Transit', label: 'In Transit', icon: Truck },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  // Determine current step index based on order status
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Called': return 0;
      case 'Confirmed': return 1;
      case 'Processing': return 2;
      case 'Packed': return 3;
      case 'Courier Received': return 4;
      case 'Shipped': return 5; // fallback
      case 'In Transit': return 5;
      case 'Delivered': return 6;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/account/orders" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#111111]">Order Tracking</h1>
          <p className="text-sm text-gray-500 font-mono mt-1">ID: {order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - TIMELINE */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-semibold text-lg">Tracking Status</h2>
               {order.delivery?.consignmentId && order.status !== 'Delivered' && !isCancelled && (
                 <button onClick={handleSync} disabled={syncing} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors bg-primary/5 px-2 py-1 rounded">
                   <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                   Sync Status
                 </button>
               )}
            </div>
            
            {isCancelled ? (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="font-bold text-red-700">Order Cancelled</h3>
                <p className="text-sm text-red-600/80 mt-1">This order has been cancelled.</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-8 py-4">
                {/* Vertical Line */}
                <div className="absolute left-[1.65rem] top-8 bottom-8 w-[2px] bg-gray-100"></div>
                
                {/* Filled Line Progress */}
                <div 
                  className="absolute left-[1.65rem] top-8 w-[2px] bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ height: `${Math.min(100, Math.max(0, (currentStepIndex / (steps.length - 1)) * 100))}%` }}
                ></div>

                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Circle Indicator */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-500 ${
                        isCompleted ? 'border-emerald-500 text-emerald-500' :
                        isCurrent ? 'border-primary text-primary shadow-[0_0_0_4px_rgba(109,40,217,0.1)]' :
                        'border-gray-200 text-gray-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pt-1.5 flex-1 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                        <h4 className={`font-semibold text-sm ${isCurrent ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <p className="text-xs text-gray-500 mt-1 animate-in fade-in slide-in-from-top-1">In progress...</p>
                        )}
                        {step.id === 'In Transit' && (isCurrent || isCompleted) && order.delivery?.trackingCode && (
                          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono text-gray-600 break-all select-all shadow-inner">
                            {order.delivery.trackingCode}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {order.delivery?.trackingCode && (
              <a 
                href={`https://www.steadfast.com.bd/tracking/${order.delivery.trackingCode}`}
                target="_blank" 
                rel="noreferrer"
                className="mt-6 w-full bg-[#111111] hover:bg-primary text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Truck className="w-4 h-4" />
                Track Courier Shipment
              </a>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Order Date</p>
               <p className="text-sm font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Expected</p>
               <p className="text-sm font-bold text-emerald-600">৳{order.totalAmount.toFixed(2)}</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Payment</p>
               <p className="text-sm font-semibold text-gray-900">{order.paymentMethod}</p>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Status</p>
               <span className={`inline-block px-2 py-0.5 mt-0.5 text-xs font-bold uppercase tracking-wider rounded ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                  'bg-indigo-100 text-indigo-700'
               }`}>{order.status}</span>
             </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 border-b border-gray-50 pb-3">
               <Box className="w-5 h-5 text-gray-400" /> Delivery Information
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Recipient</p>
                  <p className="font-medium text-gray-900">{order.customer.name}</p>
                  <p className="text-sm text-gray-600 font-mono mt-1">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Shipping Address</p>
                  <p className="text-sm text-gray-700">{order.customer.address}</p>
                  <p className="text-sm text-gray-600 mt-1">{order.customer.city}{order.customer.zip ? `, ${order.customer.zip}` : ''}</p>
                </div>
             </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <h3 className="font-semibold text-lg p-6 pb-4 border-b border-gray-100 flex items-center gap-2">
               <ShoppingBag className="w-5 h-5 text-gray-400" /> Order Items
             </h3>
             <div className="divide-y divide-gray-100">
               {order.items.map((item: any, idx: number) => (
                 <div key={idx} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                     {item.image ? (
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                         <Package className="w-6 h-6" />
                       </div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                     <p className="text-sm text-gray-500 mt-1">
                       Qty: {item.quantity} {item.size && <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">{item.size}</span>}
                     </p>
                   </div>
                   <div className="text-right shrink-0">
                     <p className="font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</p>
                   </div>
                 </div>
               ))}
             </div>
             <div className="p-6 bg-gray-50/50 border-t border-gray-100">
               <div className="flex justify-between items-center text-sm mb-2">
                 <span className="text-gray-500">Subtotal</span>
                 <span className="font-medium">৳{order.totalAmount.toFixed(2)}</span>
               </div>
               {order.discountApplied > 0 && (
                 <div className="flex justify-between items-center text-sm mb-2 text-emerald-600">
                   <span>Discount Applied</span>
                   <span className="font-medium">- ৳{order.discountApplied.toFixed(2)}</span>
                 </div>
               )}
               <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                 <span className="font-bold text-gray-900">Total</span>
                 <span className="font-bold text-xl text-emerald-600">৳{order.totalAmount.toFixed(2)}</span>
               </div>
             </div>
          </div>

          {/* Buy Again Action */}
          <div className="pt-4">
             <button onClick={handleBuyAgain} className="w-full bg-white border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex justify-center items-center gap-2">
               <RefreshCw className="w-4 h-4" /> Reorder Items
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
