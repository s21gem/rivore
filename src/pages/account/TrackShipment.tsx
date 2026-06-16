import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, Search, ArrowRight } from 'lucide-react';
import { customerApi } from '../../lib/customerApi';

export default function TrackShipment() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await customerApi.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const activeOrders = orders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    
    // Check if the order ID belongs to the user
    const order = orders.find(o => o._id === searchId.trim() || o._id.endsWith(searchId.trim()));
    if (order) {
      navigate(`/account/orders/${order._id}`);
    } else {
      // Still navigate to let the OrderTracking component show "Not Found" securely
      navigate(`/account/orders/${searchId.trim()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-light text-[#111111]">Track Shipment</h1>
        <p className="text-[#777777] mt-2">Follow your luxury fragrance journey.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-primary focus:border-primary font-mono text-sm"
            placeholder="Enter your Order ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 bg-[#111111] text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
          >
            Track <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-4">Active Deliveries</h3>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-100 rounded-2xl"></div>
            <div className="h-24 bg-gray-100 rounded-2xl"></div>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">You don't have any active deliveries right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div 
                key={order._id}
                onClick={() => navigate(`/account/orders/${order._id}`)}
                className="group bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-lg">
                    {order.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary ChevronRight import hack if missing
import { ChevronRight } from 'lucide-react';
