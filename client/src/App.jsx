import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';

// A temporary page, until we build the real ones
function Placeholder({ title }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="mt-2 text-gray-500">This page is coming soon.</p>
    </div>
  );
}

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
                <Placeholder title="Cart" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Placeholder title="My Orders" />
              </ProtectedRoute>
            }
          />

          {/* Only for the admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Placeholder title="Admin Dashboard" />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;