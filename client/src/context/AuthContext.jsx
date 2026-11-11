import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Read the saved login from the browser (if there is one)
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  // Remember the user in the browser, so a page refresh does not log them out
  const saveUser = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    saveUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A shortcut any page can use: const { user, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);