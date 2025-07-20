import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAqwZxPlAVzALnnui6OVNtAf-eYRngFPhg",
  authDomain: "hackthe6ix-ab103.firebaseapp.com",
  projectId: "hackthe6ix-ab103",
  storageBucket: "hackthe6ix-ab103.firebasestorage.app",
  messagingSenderId: "95100643084",
  appId: "1:95100643084:web:3875e478721f017ecdcb29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 