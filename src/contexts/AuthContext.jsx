import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(result.user, { displayName });
    
          // Create user document in Firestore
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
    
    return result;
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  }

  async function logout() {
    await signOut(auth);
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            // Keep the Firebase Auth user object separate from Firestore data
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              ...userDoc.data()
            });
          } else {
            // Create user document if it doesn't exist
            const userData = {
              displayName: user.displayName || user.email,
              email: user.email,
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
            };
            
            await setDoc(doc(db, 'users', user.uid), userData);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              ...userData
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
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 