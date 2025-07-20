import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    displayName: 'Student',
    email: 'student@example.com'
  });
  const [loading, setLoading] = useState(false);

  function signup(email, password, displayName) {
    return Promise.resolve({ user: { displayName, email } });
  }

  function login(email, password) {
    return Promise.resolve({ user: { displayName: 'Student', email } });
  }

  function logout() {
    setCurrentUser(null);
    return Promise.resolve();
  }

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 