import React from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";


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
  PageNotFound,
} from "./pages";

import UpdatePassword from "./pages/UpdatePassword";
import OrderDetailsSheet from "./pages/OrderDetailsSheet";
import TermsandConditions from "./pages/TermsandConditions";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ fixed import
import PublicRoute from "./components/PublicRoute";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import ForgotPassword
 from "./pages/ForgotPassword";
 import Popup from "./pages/Popup";
 import Payment from "./pages/Payment";
 import NotificationSettings from "./pages/NotificationSetting";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <>
  <Popup/>
  <BrowserRouter>
    <ScrollToTop>
      <Provider store={store}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Products />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/order-details" element={<OrderDetailsSheet />} />
            <Route path="/terms" element={<TermsandConditions/>} />
            <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/notification" element={<NotificationSettings />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
              <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<PublicRoute>
              <Login />
            </PublicRoute>} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/product/*" element={<PageNotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Provider>
    </ScrollToTop>
  </BrowserRouter>
  </>
);
