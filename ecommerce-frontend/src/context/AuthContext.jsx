import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load auth from local storage on mount
    const storedToken = sessionStorage.getItem('token');
    const storedRole = sessionStorage.getItem('role');
    const storedName = sessionStorage.getItem('name');
    const storedUserId = sessionStorage.getItem('userId');

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      setUser({ name: storedName, id: storedUserId });
    }
  }, []);

  const login = (jwt, userRole, userName, userId) => {
    sessionStorage.setItem('token', jwt);
    sessionStorage.setItem('role', userRole);
    sessionStorage.setItem('name', userName);
    sessionStorage.setItem('userId', userId);

    setToken(jwt);
    setRole(userRole);
    setUser({ name: userName, id: userId });
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('userId');

    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
