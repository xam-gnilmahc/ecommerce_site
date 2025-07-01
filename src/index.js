import React from "react";
import ReactDOM from "react-dom/client";

import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/navigation";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import store from "./redux/index.ts";

import { Toaster } from "react-hot-toast";

import ScrollToTop from "./components/ScrollToTop";
import Popup from "./pages/Popup";

import { AuthProvider } from "./context/authContext";
import { PageHeaderProvider } from "./context/PageHeaderContext.tsx";


import RoutesComponent from "./RoutesComponent.tsx"; // Move all <Routes> into this separate file for clarity

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ScrollToTop>
      <Provider store={store}>
        <AuthProvider>
          <PageHeaderProvider>
            <Popup />
            <RoutesComponent />
            <Toaster />
          </PageHeaderProvider>
        </AuthProvider>
      </Provider>
    </ScrollToTop>
  </BrowserRouter>
);
