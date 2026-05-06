import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, ShoppingCart, Settings, LogOut, Menu, X, MessageSquare, Globe, Sun, Moon, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('rivore_admin_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('rivore_admin_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Combos', path: '/admin/combos', icon: Layers },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Settings & CMS', path: '/admin/settings', icon: Globe },
  ];

  return (
    <div className={`min-h-screen flex bg-background ${isDark ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center justify-between px-8 border-b border-border">
          <img src="https://res.cloudinary.com/dum9idrbx/image/upload/q_auto/f_auto/v1776089332/Rivor%C3%A9_fhepjw.png" alt="Rivore" className="h-8 w-auto" />
          <button 
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 text-xs uppercase tracking-[0.1em] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 w-full text-xs uppercase tracking-[0.1em] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-24 bg-card border-b border-border flex items-center px-4 md:px-10 justify-between sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-serif font-light text-foreground">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="hidden md:inline text-xs uppercase tracking-[0.1em] font-medium text-muted-foreground">{user.email}</span>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-foreground font-serif text-sm shrink-0">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
