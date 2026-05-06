import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Banknote, ShoppingBag, Package, TrendingUp, AlertTriangle, CalendarDays, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'text-yellow-600 bg-yellow-500/10';
    case 'Called': return 'text-slate-600 bg-slate-500/10';
    case 'Confirmed': return 'text-green-600 bg-green-500/10';
    case 'Delivered': return 'text-blue-600 bg-blue-500/10';
    case 'Cancelled': return 'text-red-600 bg-red-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

export default function Dashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    productsCount: 0,
    todaySales: 0,
    todayOrders: 0,
  });
  const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number }[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<{ day: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/products?limit=1000'),
        ]);

        if (ordersRes.ok && productsRes.ok) {
          const orders = await ordersRes.json();
          const productsData = await productsRes.json();
          const products = productsData.products || productsData;

          const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

          // Today's stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayOrders = orders.filter((o: any) => new Date(o.createdAt) >= today);
          const todaySales = todayOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);

          // Status breakdown
          const breakdown: Record<string, number> = {};
          orders.forEach((o: any) => {
            breakdown[o.status] = (breakdown[o.status] || 0) + 1;
          });
          setStatusBreakdown(breakdown);

          // 7-day Revenue Trend
          const trend: { day: string; amount: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(d);
            nextDay.setDate(d.getDate() + 1);

            const daySales = orders
              .filter((o: any) => new Date(o.createdAt) >= d && new Date(o.createdAt) < nextDay)
              .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

            trend.push({
              day: d.toLocaleDateString('en-US', { weekday: 'short' }),
              amount: daySales
            });
          }
          setRevenueTrend(trend);

          // Top selling products (by quantity across all orders)
          const productCounts: Record<string, number> = {};
          orders.forEach((o: any) => {
            o.items?.forEach((item: any) => {
              const baseName = item.name?.replace(/\s*\(.*?\)\s*$/, '') || 'Unknown';
              productCounts[baseName] = (productCounts[baseName] || 0) + item.quantity;
            });
          });
          const sorted = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
          setTopProducts(sorted);

          setStats({
            totalSales,
            ordersCount: orders.length,
            productsCount: products.length,
            todaySales,
            todayOrders: todayOrders.length,
          });

          const sortedOrders = orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrders(sortedOrders.slice(0, 5));

          const lowStock = products.filter((p: any) => p.stock <= (p.lowStockThreshold || 5));
          setLowStockProducts(lowStock);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `৳${stats.totalSales.toFixed(0)}`, icon: Banknote },
    { title: 'Total Orders', value: stats.ordersCount, icon: ShoppingBag },
    { title: "Today's Revenue", value: `৳${stats.todaySales.toFixed(0)}`, icon: CalendarDays },
    { title: "Today's Orders", value: stats.todayOrders, icon: TrendingUp },
  ];

  const statusOrder = ['Pending', 'Called', 'Confirmed', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-muted-foreground mb-2">Overview</p>
          <h1 className="text-3xl font-serif font-light text-foreground">Dashboard</h1>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-serif font-medium text-yellow-800 dark:text-yellow-300 mb-2">Low Stock Alert</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">You have {lowStockProducts.length} product(s) that are running low on stock or out of stock.</p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map(p => (
                <Link key={p._id} to="/admin/products" className="bg-white/60 dark:bg-yellow-900/40 hover:bg-white dark:hover:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 text-xs font-medium px-3 py-1.5 rounded-md border border-yellow-300 dark:border-yellow-700/50 transition-colors">
                  {p.name} ({p.stock} left)
                </Link>
              ))}
              {lowStockProducts.length > 5 && (
                <Link to="/admin/products" className="bg-white/60 dark:bg-yellow-900/40 hover:bg-white dark:hover:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300 text-xs font-medium px-3 py-1.5 rounded-md border border-yellow-300 dark:border-yellow-700/50 transition-colors">
                  +{lowStockProducts.length - 5} more
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card p-8 border border-border rounded-xl lg:col-span-2">
           <h3 className="text-sm uppercase tracking-[0.2em] font-medium text-muted-foreground mb-6">7-Day Revenue Trend</h3>
           <div className="h-48 flex items-end justify-between gap-2 mt-4 pt-4">
             {revenueTrend.map((data, i) => {
                const maxAmount = Math.max(...revenueTrend.map(d => d.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center h-full items-end pb-2">
                       <div 
                         className="w-full max-w-[2.5rem] bg-indigo-100 rounded-t-sm group-hover:bg-indigo-300 transition-all duration-300 relative"
                         style={{ height: `${Math.max(5, heightPercent)}%` }}
                       >
                         <div className="absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-2 py-0.5 rounded pointer-events-none whitespace-nowrap">
                            ৳{data.amount}
                         </div>
                       </div>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">{data.day}</span>
                  </div>
                );
             })}
           </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card p-8 border border-border rounded-xl flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground">{stat.title}</p>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-3xl font-serif font-light text-foreground">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Status Breakdown + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground mb-6">Order Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statusOrder.map(status => (
              <div key={status} className="flex flex-col items-center p-4 rounded-xl bg-muted/30">
                <span className={`text-2xl font-serif font-light ${getStatusColor(status).split(' ')[0]}`}>
                  {statusBreakdown[status] || 0}
                </span>
                <span className={`text-[10px] uppercase tracking-[0.1em] font-medium mt-1 px-2 py-0.5 rounded ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground mb-6 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Top Selling Products
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, i) => {
                const maxCount = topProducts[0]?.count || 1;
                return (
                  <div key={product.name} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                        <span className="text-xs text-muted-foreground font-mono ml-2">{product.count} sold</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(product.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No sales data yet.</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border overflow-hidden rounded-xl">
        <div className="p-8 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-serif font-light text-foreground">Recent Orders</h2>
          <Link to="/admin/orders" className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground hover:text-primary transition-colors">View All</Link>
        </div>
        {recentOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <th className="p-6 font-medium">Order ID</th>
                    <th className="p-6 font-medium">Customer</th>
                    <th className="p-6 font-medium">Date</th>
                    <th className="p-6 font-medium">Total</th>
                    <th className="p-6 font-medium">Payment</th>
                    <th className="p-6 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border hover:bg-muted/30 transition-colors text-sm">
                      <td className="p-6 font-mono text-xs text-muted-foreground">#{order._id.slice(-6)}</td>
                      <td className="p-6 text-foreground">{order.customer.name}</td>
                      <td className="p-6 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-6 text-foreground font-medium">৳{order.totalAmount.toFixed(2)}</td>
                      <td className="p-6">
                        <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 p-4 md:hidden bg-muted/10">
              {recentOrders.map((order) => (
                 <div key={order._id} className="border border-border p-4 bg-card rounded-xl flex flex-col gap-3">
                   <div className="flex justify-between items-center pb-3 border-b border-border">
                     <span className="font-mono text-muted-foreground text-sm uppercase text-[10px] tracking-widest">#{order._id.slice(-6)}</span>
                     <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded ${getStatusColor(order.status)}`}>
                       {order.status}
                     </span>
                   </div>
                   <div>
                      <div className="font-medium text-foreground">{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                   </div>
                   <div className="pt-3 border-t border-border mt-1 flex justify-between items-center">
                     <div className="font-medium text-lg text-foreground">৳{order.totalAmount.toFixed(2)}</div>
                     <span className={`text-[10px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700'}`}>
                       {order.paymentStatus || 'Pending'}
                     </span>
                   </div>
                 </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-sm text-muted-foreground">
            <p>No recent orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
