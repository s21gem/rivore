import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import ComboPage from './pages/ComboPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import ReturnPolicy from './pages/ReturnPolicy';
import TrackOrder from './pages/TrackOrder';
import UserLogin from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AccountLayout from './pages/account/AccountLayout';
import Profile from './pages/account/Profile';
import CustomerOrders from './pages/account/Orders';
import Addresses from './pages/account/Addresses';
import Rewards from './pages/account/Rewards';
import Referrals from './pages/account/Referrals';
import AccountSettings from './pages/account/Settings';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Combos from './pages/admin/Combos';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';
import Testimonials from './pages/admin/Testimonials';
import Coupons from './pages/admin/Coupons';
import Login from './pages/admin/Login';
import MetaPixel from './components/MetaPixel';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <MetaPixel />
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="combos" element={<ComboPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="return-policy" element={<ReturnPolicy />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="login" element={<UserLogin />} />
          <Route path="register" element={<Register />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Customer Account Routes */}
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="combos" element={<Combos />} />
          <Route path="orders" element={<Orders />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
