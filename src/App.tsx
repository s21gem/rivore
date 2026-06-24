import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import Home from './pages/Home';
import MetaPixel from './components/MetaPixel';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';

// Lazy loaded public pages
const Shop = React.lazy(() => import('./pages/Shop'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const ComboPage = React.lazy(() => import('./pages/ComboPage'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const CheckoutAuth = React.lazy(() => import('./pages/CheckoutAuth'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const ReturnPolicy = React.lazy(() => import('./pages/ReturnPolicy'));
const TrackOrder = React.lazy(() => import('./pages/TrackOrder'));
const UserLogin = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

// Payment Result Pages
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = React.lazy(() => import('./pages/PaymentCancel'));

// Lazy loaded account pages
const AccountLayout = React.lazy(() => import('./pages/account/AccountLayout'));
const AccountDashboard = React.lazy(() => import('./pages/account/Dashboard'));
const Profile = React.lazy(() => import('./pages/account/Profile'));
const OrdersList = React.lazy(() => import('./pages/account/Orders'));
const OrderTracking = React.lazy(() => import('./pages/account/OrderTracking'));
const TrackShipment = React.lazy(() => import('./pages/account/TrackShipment'));
const Addresses = React.lazy(() => import('./pages/account/Addresses'));
const PaymentMethods = React.lazy(() => import('./pages/account/PaymentMethods'));
const Rewards = React.lazy(() => import('./pages/account/Rewards'));
const Membership = React.lazy(() => import('./pages/account/Membership'));
const Referrals = React.lazy(() => import('./pages/account/Referrals'));
const Wishlist = React.lazy(() => import('./pages/account/Wishlist'));
const CouponsList = React.lazy(() => import('./pages/account/Coupons'));
const AccountSettings = React.lazy(() => import('./pages/account/Settings'));

// Lazy loaded admin pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Products = React.lazy(() => import('./pages/admin/Products'));
const Combos = React.lazy(() => import('./pages/admin/Combos'));
const Orders = React.lazy(() => import('./pages/admin/Orders'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const AdminHeroMedia = React.lazy(() => import('./pages/admin/HeroMediaManager'));
const Testimonials = React.lazy(() => import('./pages/admin/Testimonials'));
const Coupons = React.lazy(() => import('./pages/admin/Coupons'));
const AdminLogin = React.lazy(() => import('./pages/admin/Login'));
const Customers = React.lazy(() => import('./pages/admin/Customers'));
const Security = React.lazy(() => import('./pages/admin/Security'));
const ActivityLogs = React.lazy(() => import('./pages/admin/ActivityLogs'));
const AdminPaymentMethods = React.lazy(() => import('./pages/admin/PaymentMethods'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <MetaPixel />
        <Toaster />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="combos" element={<ComboPage />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="checkout-auth" element={<CheckoutAuth />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="return-policy" element={<ReturnPolicy />} />
              <Route path="track" element={<TrackOrder />} />
              <Route path="login" element={<UserLogin />} />
              <Route path="register" element={<Register />} />
              <Route path="reset-password" element={<ResetPassword />} />

              <Route path="payment/uddoktapay/success" element={<PaymentSuccess />} />
              <Route path="payment/uddoktapay/cancel" element={<PaymentCancel />} />

              {/* Customer Account Routes */}
              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<AccountDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:orderId" element={<OrderTracking />} />
                <Route path="track" element={<TrackShipment />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="payments" element={<PaymentMethods />} />
                <Route path="rewards" element={<Rewards />} />
                <Route path="membership" element={<Membership />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="coupons" element={<CouponsList />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="products" element={<Products />} />
              <Route path="combos" element={<Combos />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="activity-logs" element={<ActivityLogs />} />
              <Route path="hero-media" element={<AdminHeroMedia />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="payment-methods" element={<AdminPaymentMethods />} />
              <Route path="security" element={<Security />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
