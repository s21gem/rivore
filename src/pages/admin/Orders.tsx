import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Eye, X, Phone, MessageCircle, CheckCircle, XCircle, Package, Download, FileText, Receipt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateA4Invoice, generatePOSInvoice } from '../../utils/generateInvoice';

export default function Orders() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [exporting, setExporting] = useState(false);
  const [sendingToCourier, setSendingToCourier] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [invoiceSettings, setInvoiceSettings] = useState<any>({});

  const handleGenerateInvoice = async (mode: 'a4' | 'thermal') => {
    if (!selectedOrder) return;
    setGeneratingPdf(true);
    try {
      if (mode === 'a4') {
        await generateA4Invoice(selectedOrder, invoiceSettings);
      } else {
        await generatePOSInvoice(selectedOrder, invoiceSettings);
      }
      toast.success(`${mode === 'a4' ? 'A4 Invoice' : 'POS Receipt'} PDF downloaded`);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Fetch invoice settings
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : {})
      .then(data => setInvoiceSettings(data))
      .catch(() => {});
  }, [token]);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExporting(true);
    try {
      const res = await fetch(`/api/orders/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rivore-orders.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Orders exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
        toast.success(`Order marked as ${status}`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone and will restore product stock if applicable.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder(null);
        }
        toast.success('Order deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete order');
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendToCourier = async (id: string) => {
    setSendingToCourier(id);
    try {
      const res = await fetch(`/api/orders/${id}/send-to-courier`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Dispatched to Steadfast Courier successfully');
        setOrders(prev => prev.map(o => o._id === id ? data.order || o : o));
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder(data.order || { ...selectedOrder, delivery: { ...(data.order?.delivery || {}), status: 'sent' } });
        }
      } else {
        toast.error(data.message || 'Failed to send to courier');
        // Update local state to show failed status
        setOrders(prev => prev.map(o => o._id === id ? { ...o, delivery: { ...o.delivery, status: 'failed', error: data.message } } : o));
      }
    } catch (error) {
      console.error('Courier dispatch error:', error);
      toast.error('Failed to communicate with delivery service');
    } finally {
      setSendingToCourier(null);
    }
  };

  const handleCall = (order: any) => {
    window.open(`tel:${order.customer.phone}`);
    if (order.status === 'Pending') {
      handleStatusChange(order._id, 'Called');
    }
  };

  const handleWhatsApp = (order: any) => {
    const message = `Hello ${order.customer.name}, your Rivore order has been received. Please confirm your order.`;
    let phone = order.customer.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '88' + phone;
    } else if (!phone.startsWith('88')) {
      phone = '88' + phone;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    if (order.status === 'Pending' || order.status === 'Called') {
      handleStatusChange(order._id, 'Confirmed');
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-500/10 text-yellow-700';
      case 'Called': return 'bg-slate-500/10 text-slate-700';
      case 'Confirmed': return 'bg-green-500/10 text-green-700';
      case 'Delivered': return 'bg-blue-500/10 text-blue-700';
      case 'Cancelled': return 'bg-red-500/10 text-red-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const tabs = ['All', 'Pending', 'Called', 'Confirmed', 'Delivered', 'Cancelled'];

  return (
    <>
      <div className="space-y-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground mb-2">Management</p>
          <h1 className="text-3xl font-serif font-light text-foreground">Orders Workflow</h1>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-3">
          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || orders.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting || orders.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
          </div>

          {/* State filters */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-colors ${
                  filterStatus === tab 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background border border-border overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead className="bg-muted">
              <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <th className="p-4 font-medium">Customer Details</th>
                <th className="p-4 font-medium">Order Summary</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Telecom Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground italic">No orders found in {filterStatus} state.</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-border hover:bg-muted/30 transition-colors text-sm">
                  <td className="p-4 align-top">
                    <p className="text-foreground font-semibold mb-1 truncate max-w-[200px]">{order.customer.name}</p>
                    <p className="text-muted-foreground text-xs font-mono">{order.customer.phone}</p>
                  </td>
                  <td className="p-4 align-top text-xs text-muted-foreground">
                    <div className="line-clamp-2 max-w-[250px]">
                      {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="p-4 align-top text-foreground font-medium">৳{order.totalAmount.toFixed(2)}</td>
                  <td className="p-4 align-top">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-medium rounded ${order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-medium rounded ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-col items-end gap-2">
                       <div className="flex gap-2">
                         <button onClick={() => handleCall(order)} className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg transition-colors flex items-center justify-center border border-gray-200" title="Call Customer">
                            <Phone className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleWhatsApp(order)} className="bg-green-50 hover:bg-green-100 text-green-600 p-2.5 rounded-lg transition-colors flex items-center justify-center border border-green-200" title="Confirm via WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                         </button>
                         <button onClick={() => setSelectedOrder(order)} className="bg-muted hover:bg-muted/80 text-foreground p-2.5 rounded-lg transition-colors flex items-center justify-center border border-transparent" title="Detailed View">
                            <Eye className="w-4 h-4" />
                         </button>
                       </div>
                       
                       <div className="flex gap-2 mt-1">
                         <button onClick={() => handleStatusChange(order._id, 'Confirmed')} className="text-green-600 hover:bg-green-50 p-1.5 rounded-md" title="Mark Confirmed"><CheckCircle className="w-4 h-4"/></button>
                         <button onClick={() => handleStatusChange(order._id, 'Delivered')} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-md" title="Mark Delivered"><Package className="w-4 h-4"/></button>
                         <button onClick={() => handleStatusChange(order._id, 'Cancelled')} className="text-red-600 hover:bg-red-50 p-1.5 rounded-md" title="Cancel Order"><XCircle className="w-4 h-4"/></button>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */ }
        <div className="flex flex-col gap-4 p-4 md:hidden bg-muted/10">
          {filteredOrders.length === 0 ? <p className="text-center p-4 text-muted-foreground">No orders found.</p> : filteredOrders.map((order) => (
             <div key={order._id} className="border border-border p-4 rounded-xl bg-card flex flex-col gap-3 shadow-sm">
               <div className="flex justify-between items-center pb-3 border-b border-border">
                 <span className="font-mono text-muted-foreground text-sm font-semibold">{order.customer.phone}</span>
                 <div className="flex gap-2 items-center">
                   <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded ${order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}`}>
                     {order.paymentStatus || 'Pending'}
                   </span>
                   <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded ${getStatusBadge(order.status)}`}>
                     {order.status}
                   </span>
                 </div>
               </div>
               
               <div>
                  <div className="font-medium text-foreground text-lg mb-0.5">{order.customer.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}</div>
               </div>

               <div className="flex justify-between items-center pt-3 mt-1 border-t border-border">
                 <div className="font-medium text-lg text-foreground tracking-tight">৳{order.totalAmount.toFixed(2)}</div>
                 <div className="flex gap-2">
                    <button onClick={() => handleCall(order)} className="bg-gray-100 text-gray-700 p-2 rounded-lg"><Phone className="w-4 h-4" /></button>
                    <button onClick={() => handleWhatsApp(order)} className="bg-green-100 text-green-700 p-2 rounded-lg"><MessageCircle className="w-4 h-4" /></button>
                    <button onClick={() => setSelectedOrder(order)} className="bg-gray-100 text-gray-700 p-2 rounded-lg"><Eye className="w-4 h-4" /></button>
                 </div>
               </div>
               
               <div className="flex justify-between items-center pt-3 gap-2 mt-1 border-t border-gray-100">
                  <button onClick={() => handleStatusChange(order._id, 'Confirmed')} className="flex-1 bg-green-50 text-green-700 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3"/> Confirm</button>
                  <button onClick={() => handleStatusChange(order._id, 'Cancelled')} className="flex-1 bg-red-50 text-red-700 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1"><XCircle className="w-3 h-3"/> Cancel</button>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Modal View for extended details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border rounded-2xl shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8 border-b border-border pb-6">
                <div>
                  <h2 className="text-2xl font-serif font-light text-foreground mb-1">Order Details</h2>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono">ID: {selectedOrder._id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground transition-colors p-2 bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-muted p-6 rounded-xl border border-border">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground mb-4">Customer Info</h3>
                  <p className="text-foreground font-semibold text-lg">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-foreground mb-1 font-mono">{selectedOrder.customer.phone}</p>
                  <p className="text-sm text-muted-foreground mb-4">{selectedOrder.customer.email}</p>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-foreground">{selectedOrder.customer.address}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer.city}, {selectedOrder.customer.zip}</p>
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-xl border border-border">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground mb-4">Workflow Actions</h3>
                  <div className="space-y-4">
                     <div className="flex gap-3">
                        <button onClick={() => handleCall(selectedOrder)} className="flex-1 bg-background border border-border text-foreground py-2.5 rounded-xl font-medium text-sm flex justify-center items-center gap-2 hover:bg-muted shadow-sm">
                          <Phone className="w-4 h-4"/> Call
                        </button>
                        <button onClick={() => handleWhatsApp(selectedOrder)} className="flex-1 bg-green-500 border border-green-600 text-white py-2.5 rounded-xl font-medium text-sm flex justify-center items-center gap-2 hover:bg-green-600 shadow-sm">
                          <MessageCircle className="w-4 h-4"/> WhatsApp
                        </button>
                     </div>
                     <div className="grid grid-cols-2 gap-3 mt-4">
                        <button onClick={() => handleGenerateInvoice('a4')} disabled={generatingPdf} className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 py-2 rounded-lg font-medium text-xs flex justify-center items-center gap-1.5 transition-colors disabled:opacity-50">
                          <FileText className="w-3.5 h-3.5"/> A4 Invoice PDF
                        </button>
                        <button onClick={() => handleGenerateInvoice('thermal')} disabled={generatingPdf} className="w-full bg-gray-800 border border-gray-900 text-white hover:bg-gray-700 py-2 rounded-lg font-medium text-xs flex justify-center items-center gap-1.5 transition-colors disabled:opacity-50">
                          <Receipt className="w-3.5 h-3.5"/> POS Receipt PDF
                        </button>
                     </div>
                     <div>
                       <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 mt-4">Manual Status Shift</label>
                       <select
                         value={selectedOrder.status}
                         onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                         className="w-full bg-background border border-border p-3 rounded-lg text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors font-medium cursor-pointer"
                       >
                         <option value="Pending">🟡 Pending</option>
                         <option value="Called">🌚 Called</option>
                         <option value="Confirmed">🟢 Confirmed</option>
                         <option value="Delivered">🔵 Delivered</option>
                         <option value="Cancelled">🔴 Cancelled</option>
                       </select>
                     </div>

                     <div className="pt-4 mt-2 border-t border-border">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 mt-1">Courier Fulfillment (Steadfast)</label>
                        
                        {selectedOrder.delivery?.status === 'sent' ? (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-emerald-700">✓ DISPATCHED</span>
                              <span className="text-[10px] font-mono text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100">{selectedOrder.delivery.consignmentId}</span>
                            </div>
                            <div>
                              <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-1 font-semibold">Tracking Code</p>
                              <p className="text-sm font-bold text-emerald-900 font-mono tracking-tight cursor-default">{selectedOrder.delivery.trackingCode}</p>
                            </div>
                            <button 
                              onClick={() => window.open(`https://www.steadfast.com.bd/tracking/${selectedOrder.delivery.trackingCode}`, '_blank')}
                              className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                            >
                              Track on Steadfast
                            </button>
                          </div>
                        ) : (
                          <div className={`p-4 rounded-xl border ${selectedOrder.delivery?.status === 'failed' ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <span className={`text-xs font-bold ${selectedOrder.delivery?.status === 'failed' ? 'text-red-700' : 'text-purple-700'}`}>
                                {selectedOrder.delivery?.status === 'failed' ? '⚠ DISPATCH FAILED' : 'READY FOR DISPATCH'}
                              </span>
                            </div>
                            {selectedOrder.delivery?.error && (
                               <p className="text-[10px] text-red-600 mb-3 bg-white/50 p-2 rounded italic">Error: {selectedOrder.delivery.error}</p>
                            )}
                            <button
                              onClick={() => handleSendToCourier(selectedOrder._id)}
                              disabled={sendingToCourier === selectedOrder._id}
                              className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                selectedOrder.delivery?.status === 'failed' 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {sendingToCourier === selectedOrder._id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Package className="w-4 h-4" />
                              )}
                              {sendingToCourier === selectedOrder._id ? 'Sending...' : selectedOrder.delivery?.status === 'failed' ? 'Retry Dispatch' : 'Send to Steadfast'}
                            </button>
                          </div>
                        )}
                      </div>
                     <div className="pt-4 mt-2 border-t border-border">
                       <button
                         onClick={() => handleDeleteOrder(selectedOrder._id)}
                         disabled={deletingId === selectedOrder._id}
                         className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-red-200 disabled:opacity-50"
                       >
                         {deletingId === selectedOrder._id ? (
                           <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                           <Trash2 className="w-4 h-4" />
                         )}
                         {deletingId === selectedOrder._id ? 'Deleting...' : 'Delete Order'}
                       </button>
                     </div>
                  </div>
                </div>
              </div>

              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground mb-4">Receipt</h3>
              <div className="bg-card border border-border rounded-xl overflow-x-auto mb-8 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead className="bg-muted text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <tr>
                      <th className="p-4 font-medium">Item</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium text-center">Qty</th>
                      <th className="p-4 font-medium text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-border last:border-0 text-sm">
                        <td className="p-4 font-medium text-foreground">{item.name}</td>
                        <td className="p-4 text-muted-foreground capitalize">{item.type}</td>
                        <td className="p-4 text-muted-foreground text-center bg-muted/50">{item.quantity}</td>
                        <td className="p-4 text-foreground font-semibold text-right">৳{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center p-6 bg-muted rounded-xl border border-border shadow-inner">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">Time Placed</p>
                  <p className="text-sm font-semibold">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">Total Expected</p>
                  <p className="text-4xl font-serif font-light text-[color:var(--color-brand-wine)]">৳{selectedOrder.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Payment: {selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
