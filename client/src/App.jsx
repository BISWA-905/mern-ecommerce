import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
          <Route path="/" element={<Placeholder title="Home" />} />
          <Route path="/products" element={<Placeholder title="Products" />} />
          <Route
            path="/products/:id"
            element={<Placeholder title="Product Details" />}
          />
          <Route path="/cart" element={<Placeholder title="Cart" />} />
          <Route path="/login" element={<Placeholder title="Login" />} />
          <Route path="/register" element={<Placeholder title="Register" />} />
          <Route path="/orders" element={<Placeholder title="My Orders" />} />
          <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;