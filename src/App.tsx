import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Cards from './pages/Cards';
import Crypto from './pages/Crypto';
import Settings from './pages/Settings';
import Checkout from './pages/Checkout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Toaster } from 'sonner';
import Transactions from './pages/Transactions';
import Success from './pages/Success';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Tutorial from './pages/Tutorial';
import Messages from './pages/Messages';
import P2P from './pages/P2P';
import Wallets from './pages/Wallets';
import { ContentManager } from './pages/admin/ContentManager';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Users } from './pages/admin/Users';
import { Blogs as AdminBlogs } from './pages/admin/Blogs';
import { Settings as AdminSettings } from './pages/admin/Settings';
import { AdminMessages } from './pages/admin/AdminMessages';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing Page as Root */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <PageWrapper><Landing /></PageWrapper>
        } />

        {/* Public Auth Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <PageWrapper><Login /></PageWrapper>} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <PageWrapper><Register /></PageWrapper>} 
        />
        <Route 
          path="/forgot-password" 
          element={<PageWrapper><ForgotPassword /></PageWrapper>} 
        />
        <Route 
          path="/reset-password/:token" 
          element={<PageWrapper><ResetPassword /></PageWrapper>} 
        />

        {/* Protected Routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Dashboard /></PageWrapper></Layout>
          </ProtectedRoute>
        } />
        <Route path="/cards" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Cards /></PageWrapper></Layout>
          </ProtectedRoute>
        } />
        <Route path="/crypto" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Crypto /></PageWrapper></Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Settings /></PageWrapper></Layout>
          </ProtectedRoute>
        } />

          <Route path="/transactions" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Transactions /></PageWrapper></Layout>
          </ProtectedRoute>
        } />

        <Route path="/about" element={
          <ProtectedRoute>
            <Layout><PageWrapper><About /></PageWrapper></Layout>
          </ProtectedRoute>
        } />

        <Route path="/blogs" element={
          <Layout><PageWrapper><Blogs /></PageWrapper></Layout>
        } />
        <Route path="/blog/:slug" element={
          <Layout><PageWrapper><BlogDetail /></PageWrapper></Layout>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Messages /></PageWrapper></Layout>
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Elements stripe={stripePromise}>
              <PageWrapper><Checkout /></PageWrapper>
            </Elements>
          </ProtectedRoute>
        } />

        <Route path="/success" element={
          <ProtectedRoute>
            <PageWrapper><Success /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        } />
        <Route path="/admin/blogs" element={
          <AdminRoute>
            <AdminBlogs />
          </AdminRoute>
        } />
        <Route path="/admin/content" element={
          <AdminRoute>
            <ContentManager />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } />
        <Route path="/admin/messages" element={
          <AdminRoute>
            <AdminMessages />
          </AdminRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <Navigate to="/admin/dashboard" replace />
          </AdminRoute>
        } />
        
        {/* Tutorial Page */}
        <Route path="/tutorial" element={
          <PageWrapper><Tutorial /></PageWrapper>
        } />

        {/* P2P Trading */}
        <Route path="/p2p" element={
          <ProtectedRoute>
            <Layout><PageWrapper><P2P /></PageWrapper></Layout>
          </ProtectedRoute>
        } />

        {/* Wallets */}
        <Route path="/wallets" element={
          <ProtectedRoute>
            <Layout><PageWrapper><Wallets /></PageWrapper></Layout>
          </ProtectedRoute>
        } />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" theme="dark" closeButton />
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
