import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.js';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export function useSubjects() {
  const { currentUser } = useAuth();
  const [subjects, setSubjects] = useState([
    'Mathematics', 'Physics', 'English', 'Computer Science', 
    'Chemistry', 'Biology', 'History', 'Literature'
  ]);
  const [loading, setLoading] = useState(true);

  // Load user's custom subjects from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const loadSubjects = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        if (userData?.customSubjects) {
          setSubjects(userData.customSubjects);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading subjects:', error);
        setLoading(false);
      }
    };

    loadSubjects();
  }, [currentUser]);

  // Add a new subject
  const addSubject = async (newSubject) => {
    console.log('=== ADD SUBJECT DEBUG ===');
    console.log('Input subject:', newSubject);
    console.log('Current user:', currentUser);
    console.log('Current subjects:', subjects);
    
    if (!currentUser || !currentUser.uid) {
      console.error('No current user found or user has no UID');
      return false;
    }

    const trimmedSubject = newSubject.trim();
    if (!trimmedSubject) {
      console.error('Subject name is empty');
      return false;
    }

    if (subjects.some(s => s.toLowerCase() === trimmedSubject.toLowerCase())) {
      console.error('Subject already exists:', trimmedSubject);
      return false;
    }

    const updatedSubjects = [...subjects, trimmedSubject];
    console.log('Updated subjects list:', updatedSubjects);
    
    try {
      // First check if user document exists
      const userDocRef = doc(db, 'users', currentUser.uid);
      console.log('User document reference:', userDocRef.path);
      
      const userDoc = await getDoc(userDocRef);
      console.log('Document exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        // Update existing document
        console.log('Updating existing document...');
        await updateDoc(userDocRef, {
          customSubjects: updatedSubjects
        });
        console.log('Document updated successfully');
      } else {
        // Create new document
        console.log('Creating new document...');
        const userData = {
          displayName: currentUser.displayName || currentUser.email,
          email: currentUser.email,
          createdAt: new Date(),
          studyTime: 0,
          points: 0,
          streak: 0,
          longestStreak: 0,
          level: 1,
          sessions: 0,
          customSubjects: updatedSubjects
        };
        
        await setDoc(userDocRef, userData);
        console.log('Document created successfully');
      }
      
      // Only update local state after successful save
      setSubjects(updatedSubjects);
      console.log('Local state updated');
      console.log('=== ADD SUBJECT SUCCESS ===');
      return true;
    } catch (error) {
      console.error('=== ADD SUBJECT ERROR ===');
      console.error('Error adding subject:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check for specific Firebase errors
      if (error.code === 'permission-denied') {
        console.error('Firebase permission denied. Check Firestore rules.');
      } else if (error.code === 'unauthenticated') {
        console.error('User not authenticated.');
      } else if (error.code === 'not-found') {
        console.error('Document not found.');
      }
      
      return false;
    }
  };

  return {
    subjects,
    addSubject,
    loading
  };
}