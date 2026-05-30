import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CanteenProvider } from './context/CanteenContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FoodDetails from './pages/FoodDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageOrders from './pages/admin/ManageOrders';
import AdminAlerts from './pages/admin/AdminAlerts';
import MobileNav from './components/MobileNav';
import { useAuth } from './context/AuthContext';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Home />;
};

function App() {
  return (
    <AuthProvider>
      <CanteenProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/food/:id" element={<FoodDetails />} />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/menu"
                    element={
                      <ProtectedRoute adminOnly>
                        <ManageMenu />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute adminOnly>
                        <ManageOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/alerts"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminAlerts />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
              <MobileNav />
              <Toaster position="top-right" />
            </div>
          </BrowserRouter>
        </CartProvider>
      </CanteenProvider>
    </AuthProvider>
  );
}

export default App;

