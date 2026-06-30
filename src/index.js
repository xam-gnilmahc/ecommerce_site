import React from 'react';
import ReactDOM from 'react-dom/client';

<<<<<<< HEAD
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "swiper/css/navigation";
import "./styles/globals.css";
=======
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/css';
import 'swiper/css/navigation';
import './styles/theme.css';
>>>>>>> main

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './redux/index.ts';

import { Toaster } from 'react-hot-toast';

import ScrollToTop from './components/ui/ScrollToTop';
import Popup from './pages/popup/Popup';
import { CookiesProvider } from 'react-cookie';

import { AuthProvider } from './context/authContext';
import { PageHeaderProvider } from './context/PageHeaderContext.tsx';
import './index.css';

import RoutesComponent from './RoutesComponent.tsx'; // Move all <Routes> into this separate file for clarity

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <CookiesProvider>
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
    </CookiesProvider>
  </BrowserRouter>
);
