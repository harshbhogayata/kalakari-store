import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import './i18n';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import AsyncErrorBoundary from './components/ErrorBoundary/AsyncErrorBoundary';
import RouteErrorBoundary from './components/ErrorBoundary/RouteErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

const { Suspense } = React;

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Artisans = React.lazy(() => import('./pages/Artisans'));
const ArtisanDetail = React.lazy(() => import('./pages/ArtisanDetail'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ArtisanRegister = React.lazy(() => import('./pages/auth/ArtisanRegister'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/CheckoutNew'));
const Orders = React.lazy(() => import('./pages/OrdersNew'));
const OrderDetail = React.lazy(() => import('./pages/OrderDetailNew'));
const ArtisanDashboard = React.lazy(() => import('./pages/artisan/Dashboard'));
const ArtisanProducts = React.lazy(() => import('./pages/artisan/Products'));
const ArtisanOrders = React.lazy(() => import('./pages/artisan/Orders'));
const ArtisanProfile = React.lazy(() => import('./pages/artisan/Profile'));
const ProductForm = React.lazy(() => import('./pages/artisan/ProductForm'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminArtisans = React.lazy(() => import('./pages/admin/Artisans'));
const AdminProducts = React.lazy(() => import('./pages/admin/Products'));
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'));
const Journal = React.lazy(() => import('./pages/Journal'));
const JournalDetail = React.lazy(() => import('./pages/JournalDetail'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Shipping = React.lazy(() => import('./pages/Shipping'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Search = React.lazy(() => import('./pages/Search'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Addresses = React.lazy(() => import('./pages/Profile/Addresses'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const OrderFailed = React.lazy(() => import('./pages/OrderFailed'));
const FAQ = React.lazy(() => import('./pages/FAQ'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AsyncErrorBoundary>
              <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen" />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
                    <Route path="products" element={<RouteErrorBoundary><Products /></RouteErrorBoundary>} />
                    <Route path="products/:id" element={<RouteErrorBoundary><ProductDetail /></RouteErrorBoundary>} />
                    <Route path="artisans" element={<RouteErrorBoundary><Artisans /></RouteErrorBoundary>} />
                    <Route path="artisans/:id" element={<RouteErrorBoundary><ArtisanDetail /></RouteErrorBoundary>} />
                    <Route path="login" element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
                    <Route path="register" element={<RouteErrorBoundary><Register /></RouteErrorBoundary>} />
                    <Route path="artisan/register" element={<RouteErrorBoundary><ArtisanRegister /></RouteErrorBoundary>} />
                    <Route path="cart" element={<RouteErrorBoundary><Cart /></RouteErrorBoundary>} />
                    <Route path="journal" element={<RouteErrorBoundary><Journal /></RouteErrorBoundary>} />
                    <Route path="journal/:id" element={<RouteErrorBoundary><JournalDetail /></RouteErrorBoundary>} />
                    <Route path="terms" element={<RouteErrorBoundary><Terms /></RouteErrorBoundary>} />
                    <Route path="privacy" element={<RouteErrorBoundary><Privacy /></RouteErrorBoundary>} />
                    <Route path="contact" element={<RouteErrorBoundary><Contact /></RouteErrorBoundary>} />
                    <Route path="shipping" element={<RouteErrorBoundary><Shipping /></RouteErrorBoundary>} />
                    <Route path="faq" element={<RouteErrorBoundary><FAQ /></RouteErrorBoundary>} />
                    <Route path="search" element={<RouteErrorBoundary><Search /></RouteErrorBoundary>} />

                    {/* Protected Customer Routes */}
                    <Route path="dashboard" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><Dashboard /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="wishlist" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><Wishlist /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><Profile /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="profile/addresses" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><Addresses /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="checkout" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><Checkout /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="order/success" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><OrderSuccess /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="order/failed" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><OrderFailed /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="orders" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><Orders /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="orders/:id" element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <RouteErrorBoundary><OrderDetail /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />

                    {/* Protected Artisan Routes */}
                    <Route path="artisan/dashboard" element={
                      <ProtectedRoute allowedRoles={['artisan']}>
                        <RouteErrorBoundary><ArtisanDashboard /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="artisan/products" element={
                      <ProtectedRoute allowedRoles={['artisan']}>
                        <RouteErrorBoundary><ArtisanProducts /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="artisan/products/new" element={
                      <ProtectedRoute allowedRoles={['artisan']}>
                        <RouteErrorBoundary><ProductForm /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="artisan/products/:id/edit" element={
                      <ProtectedRoute allowedRoles={['artisan']}>
                        <RouteErrorBoundary><ProductForm /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="artisan/orders" element={
                      <ProtectedRoute allowedRoles={['artisan']}>
                        <RouteErrorBoundary><ArtisanOrders /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="artisan/profile" element={
                      <ProtectedRoute allowedRoles={['artisan']}>
                        <RouteErrorBoundary><ArtisanProfile /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />

                    {/* Protected Admin Routes */}
                    <Route path="admin/dashboard" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <RouteErrorBoundary><AdminDashboard /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="admin/artisans" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <RouteErrorBoundary><AdminArtisans /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="admin/products" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <RouteErrorBoundary><AdminProducts /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />
                    <Route path="admin/orders" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <RouteErrorBoundary><AdminOrders /></RouteErrorBoundary>
                      </ProtectedRoute>
                    } />

                    {/* 404 Route */}
                    <Route path="*" element={<RouteErrorBoundary><NotFound /></RouteErrorBoundary>} />
                  </Route>
                </Routes>
              </Suspense>
            </AsyncErrorBoundary>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
