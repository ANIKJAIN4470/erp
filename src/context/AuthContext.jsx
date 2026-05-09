import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const userData = await api.get('/auth/me/');
          const inferredUserType = userData?.role === 'employee' ? 'employee' : 'admin';
          setUser({
            ...userData,
            userType: inferredUserType,
            role: userData.role || (inferredUserType === 'employee' ? 'employee' : 'admin'),
            employee_login_id: userData.employee_login_id || null,
          });
        } catch (err) {
          console.error('Auth check failed', err);
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.user.role || 'admin');
    localStorage.setItem('username', response.user.username);
    setUser({
      ...response.user,
      userType: 'admin'
    });
    return response.user;
  };

  const employeeLogin = async (employeeLoginId, password) => {
    const data = await api.post('/auth/employee-login/', {
      employee_login_id: employeeLoginId,
      password,
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', 'employee');
    localStorage.setItem('employee_login_id', data.employee?.employee_login_id || employeeLoginId);

    const employeeUser = {
      ...(data.user || {}),
      ...(data.employee || {}),
      role: 'employee',
      userType: 'employee',
    };

    setUser(employeeUser);
    return employeeUser;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const role = user?.role || localStorage.getItem('role');

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      employeeLogin,
      logout, 
      loading, 
      role,
      userType: user?.userType || (localStorage.getItem('role') === 'employee' ? 'employee' : 'admin')
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
