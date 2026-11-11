import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-white">ShopEase</h3>
          <p className="mt-2 text-sm text-gray-400">
            Your one-stop shop for gadgets and everyday essentials.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link to="/" className="hover:text-white">Home</Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-white">Products</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white">Cart</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-400">
            <li>Bhubaneswar, Odisha, India</li>
            <li>support@shopease.example</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ShopEase. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;