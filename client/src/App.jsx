import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Open to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />         
                    <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Only for logged-in users */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
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

          {/* Only for the admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard/>
              </ProtectedRoute>
            }
          />

      <Route 
        path="*" element={<NotFound />} />    
          </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;