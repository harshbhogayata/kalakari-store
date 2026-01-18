import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AccessibilityWrapper from '../AccessibilityWrapper';
import BackToTop from '../BackToTop';
import Breadcrumb from '../Breadcrumb';

const Layout: React.FC = () => {
  return (
    <AccessibilityWrapper>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Breadcrumb />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </AccessibilityWrapper>
  );
};

export default Layout;

