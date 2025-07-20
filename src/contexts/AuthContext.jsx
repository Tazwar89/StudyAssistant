import { useState } from 'react';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    displayName: 'Student',
    email: 'student@example.com'
  });

  function signup(email, displayName) {
    return Promise.resolve({ user: { displayName, email } });
  }

  function login(email) {
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