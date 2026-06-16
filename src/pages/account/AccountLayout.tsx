import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, MapPin, Award, Users, Settings, LogOut, Menu, Crown, Truck, Heart, Ticket } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';

export default function AccountLayout() {
  const { user, token, logout } = useCustomerAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!token || !user || user.role !== 'customer') {
      navigate('/login');
    }
  }, [token, user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/account', exact: true, icon: LayoutDashboard },
    { name: 'Orders', path: '/account/orders', exact: false, icon: Package },
    { name: 'Track Shipment', path: '/account/track', exact: false, icon: Truck },
    { name: 'Addresses', path: '/account/addresses', exact: false, icon: MapPin },
    { name: 'Rewards', path: '/account/rewards', exact: false, icon: Award },
    { name: 'Membership', path: '/account/membership', exact: false, icon: Crown },
    { name: 'Referrals', path: '/account/referrals', exact: false, icon: Users },
    { name: 'Scent Collection', path: '/account/wishlist', exact: false, icon: Heart },
    { name: 'Coupons', path: '/account/coupons', exact: false, icon: Ticket },
    { name: 'Profile Settings', path: '/account/profile', exact: false, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#f8f5ff] to-transparent -z-10"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-[#eeeeee]">
          <h2 className="font-serif font-bold text-xl text-[#111111]">My Account</h2>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-50 rounded-xl">
            <Menu className="w-6 h-6 text-[#555555]" />
          </button>
        </div>

        {/* Sidebar */}
        <div className={`md:w-80 flex-shrink-0 flex flex-col gap-4 ${mobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(109,40,217,0.04)] border border-[#eeeeee]">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-serif">
                {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-serif font-bold text-xl text-[#111111]">{user.fullName || 'Valued Customer'}</h2>
              <p className="text-[#777777] text-sm mt-1">{user.email}</p>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact 
                  ? location.pathname === link.path 
                  : location.pathname.startsWith(link.path);
                  
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.exact}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-medium ${
                      isActive 
                        ? 'bg-[#111111] text-white shadow-md shadow-black/10' 
                        : 'text-[#555555] hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </NavLink>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-medium text-red-500 hover:bg-red-50 mt-4"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(109,40,217,0.04)] border border-[#eeeeee] p-6 md:p-10 min-h-[600px]">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}
