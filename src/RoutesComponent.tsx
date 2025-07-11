import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import {
  Home,
  Product,
  Products,
  AboutPage,
  ContactPage,
  Cart,
  Login,
  Register,
  Checkout,
  PageNotFound
} from "./pages";

import UpdatePassword from "./pages/UpdatePassword";
import OrderDetailsSheet from "./pages/OrderDetailsSheet";
import TermsandConditions from "./pages/TermsandConditions";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import CancelledOrderPage from "./pages/CancelledOrderPage";
import PaymentsPage from "./pages/PaymentsPage";
import ForgotPassword from "./pages/ForgotPassword";
import CronJob from "./pages/CronJob";
import NotificationPage from "./pages/NotificationPage";
import NotificationSettings from "./pages/NotificationSetting";


// Layouts
import GuestLayout from "./layouts/GuestLayout";
import AuthLayout from "./layouts/AuthLayout";

const RoutesComponent = () => (
  <Routes>
    {/* Public/Guest Layout */}
    <Route element={<GuestLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Products />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/order-details" element={<OrderDetailsSheet />} />
      <Route path="/terms" element={<TermsandConditions />} />
      <Route path="/cronjob" element={<CronJob />} />
      <Route path="*" element={<PageNotFound />} />
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
      <Route path="/notification-settings" element={<NotificationSettings />} />
    </Route>
  </Routes>
);

export default RoutesComponent;
