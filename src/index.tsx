import React from 'react';
import ReactDOM from 'react-dom/client';

import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/css';
import 'swiper/css/navigation';
import './styles/theme.css';

import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from './tanstack/queryClient';

import { Toaster } from 'react-hot-toast';

import ScrollToTop from './components/common/ScrollToTop';
import { CookiesProvider } from 'react-cookie';

import { AuthProvider } from './context/authContext';
import { PageHeaderProvider } from './context/PageHeaderContext';
import OAuthErrorCatcher from './components/common/OAuthErrorCatcher';
import './index.css';

import RoutesComponent from './RoutesComponent';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <OAuthErrorCatcher />
      <CookiesProvider>
        <ScrollToTop>
          <AuthProvider>
            <PageHeaderProvider>
              <RoutesComponent />
              <Toaster />
            </PageHeaderProvider>
          </AuthProvider>
        </ScrollToTop>
      </CookiesProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
