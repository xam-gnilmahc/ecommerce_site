import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/home/Home';
import Product from './pages/product/Product';
import Products from './pages/products/Products';
import AboutPage from './pages/static/AboutPage';
import ContactPage from './pages/static/ContactPage';
import Cart from './pages/cart/Cart';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Checkout from './pages/checkout/Checkout';
import PageNotFound from './pages/static/PageNotFound';

import UpdatePassword from './pages/auth/UpdatePassword';
import OrderDetailsSheet from './pages/orders/OrderDetailsSheet';
import TermsandConditions from './pages/static/TermsandConditions';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailsPage from './pages/orders/OrderDetails';
import Profile from './pages/profile/Profile';
import CancelledOrderPage from './pages/cancelled/CancelledOrderPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import NotificationPage from './pages/profile/NotificationPage';
import NotificationSettings from './pages/profile/SetttingPage';
import RafflePage from './pages/raffle/RafflePage';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';

// Layouts
import GuestLayout from './components/layout/layouts/GuestLayout';
import AuthLayout from './components/layout/layouts/AuthLayout';

const RoutesComponent = () => (
  <div className="flex flex-col min-h-screen overflow-x-hidden">
    <Navbar />

    <div className="h-16 shrink-0" />
    <div className="flex-1">
    <Routes>
      {/* Public/Guest Layout */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Products />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/order-details" element={<OrderDetailsSheet />} />
        <Route path="/terms" element={<TermsandConditions />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/raffles" element={<RafflePage />} />
      </Route>

      {/* Authenticated Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order" element={<OrdersPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/return-cancel" element={<CancelledOrderPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/settings" element={<NotificationSettings />} />
      </Route>
    </Routes>
    </div>

    <Footer />
  </div>
);

export default RoutesComponent;
