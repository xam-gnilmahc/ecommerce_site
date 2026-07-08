import React from 'react';
import ReactDOM from 'react-dom/client';

import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/css';
import 'swiper/css/navigation';
import './styles/theme.css';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './redux/index.ts';

import { Toaster } from 'react-hot-toast';

import ScrollToTop from './components/ui/ScrollToTop';
import Popup from './pages/popup/Popup';
import { CookiesProvider } from 'react-cookie';

import { AuthProvider } from './context/authContext';
import { PageHeaderProvider } from './context/PageHeaderContext.tsx';
import OAuthErrorCatcher from './components/ui/OAuthErrorCatcher';
import './index.css';

import RoutesComponent from './RoutesComponent.tsx'; // Move all <Routes> into this separate file for clarity

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <OAuthErrorCatcher />
    <CookiesProvider>
      <ScrollToTop>
        <Provider store={store}>
          <AuthProvider>
            <PageHeaderProvider>
              {/* <Popup /> */}
              <RoutesComponent />
              <Toaster
                position="top-right"
                gutter={12}
                containerStyle={{ margin: '16px', fontFamily: 'Inter, sans-serif' }}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#ffffff',
                    color: '#111827',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    maxWidth: '380px',
                    lineHeight: '1.5',
                  },
                  success: {
                    iconTheme: {
                      primary: '#059669',
                      secondary: '#ffffff',
                    },
                    style: {
                      border: '1px solid #d1fae5',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#dc2626',
                      secondary: '#ffffff',
                    },
                    style: {
                      border: '1px solid #fecaca',
                    },
                  },
                }}
              />
            </PageHeaderProvider>
          </AuthProvider>
        </Provider>
      </ScrollToTop>
    </CookiesProvider>
  </BrowserRouter>
);
