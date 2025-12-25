import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';
import { createContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(result.user, { displayName });
    
    // Create user document in Firestore - This is the SINGLE SOURCE of truth for creation
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email,
      createdAt: new Date(),
      studyTime: 0,
      points: 0,
      streak: 0,
      longestStreak: 0,
      level: 1,
      sessions: 0,
      streakData: {
        currentStreak: 0,
        lastStudyDate: null,
        longestStreak: 0
      },
      customSubjects: [
        'Mathematics', 'Physics', 'English', 'Computer Science', 
        'Chemistry', 'Biology', 'History', 'Literature'
      ]
    });
    
    // Manually update state to reflect the new data immediately
    setCurrentUser({
      uid: result.user.uid,
      email: email,
      displayName: displayName,
      // ... include initial stats if needed for immediate UI feedback
    });
    
    return result;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              ...userDoc.data()
            });
          } else {
            // DOC MISSING: Do NOT create it here. 
            // If it's a signup, the signup function handles it.
            // If it's a legacy error, we just use basic auth info.
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    firebaseUser,
    signup,
    login,
    logout,
    loading,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}