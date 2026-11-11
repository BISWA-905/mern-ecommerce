import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `block py-2 md:py-0 hover:text-indigo-600 ${
      isActive ? 'text-indigo-600 font-semibold' : 'text-gray-700'
    }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          ShopEase
        </Link>

        {/* Menu button, shown on phones only */}
        <button
          className="md:hidden text-gray-700 text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <ul
          className={`${
            open ? 'block' : 'hidden'
          } absolute left-0 top-full w-full bg-white px-4 pb-4 shadow-md md:shadow-none md:static md:flex md:w-auto md:items-center md:gap-6 md:p-0`}
        >
          <li>
            <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={linkClass} onClick={() => setOpen(false)}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)}>
              Cart
            </NavLink>
          </li>

          {user ? (
            <>
              <li>
                <NavLink to="/orders" className={linkClass} onClick={() => setOpen(false)}>
                  My Orders
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                    Admin
                  </NavLink>
                </li>
              )}
              <li className="py-2 md:py-0 text-gray-500">Hi, {user.name}</li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  Login
                </NavLink>
              </li>
              <li>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;