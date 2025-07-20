import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const FirebaseTest = () => {
  const { currentUser } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestoreWrite = async () => {
    if (!currentUser || !currentUser.uid) {
      setTestResult('❌ No user logged in');
      return;
    }

    setLoading(true);
    setTestResult('🔄 Testing...');

    try {
      // Test 1: Write to users collection
      console.log('=== FIREBASE TEST ===');
      console.log('Testing user document write...');
      
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        testField: 'test value',
        testTime: new Date(),
        email: currentUser.email
      }, { merge: true });
      
      console.log('✅ User document write successful');
      
      // Test 2: Read from users collection
      console.log('Testing user document read...');
      const userDoc = await getDoc(userDocRef);
      console.log('User document data:', userDoc.data());
      
      // Test 3: Write to tasks collection
      console.log('Testing tasks collection write...');
      const taskData = {
        title: 'Test Task',
        subject: 'Test Subject',
        priority: 'medium',
        dueDate: new Date(),
        description: 'Test description',
        userId: currentUser.uid,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const taskDocRef = await addDoc(collection(db, 'tasks'), taskData);
      console.log('✅ Task document write successful, ID:', taskDocRef.id);
      
      setTestResult('✅ All Firebase tests passed! Check console for details.');
      
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setTestResult(`❌ Test failed: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Firebase Test</h2>
        <p className="text-gray-600 mb-4">
          This component tests Firebase permissions and data writing capabilities.
        </p>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            <strong>Current User:</strong> {currentUser ? `${currentUser.email} (${currentUser.uid})` : 'Not logged in'}
          </p>
        </div>
        
        <button
          onClick={testFirestoreWrite}
          disabled={loading || !currentUser}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Testing...' : 'Run Firebase Test'}
        </button>
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-medium">{testResult}</p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Check the browser console for detailed test results.</p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest; 