import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import StudyTimer from './components/StudyTimer';
import Chatbot from './components/Chatbot';

import Login from './components/Login';

function App() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Study Assistant</h1>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="/tasks" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Tasks</a>
                <a href="/timer" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Timer</a>
                <a href="/chatbot" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Chatbot</a>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Welcome, {currentUser.displayName || currentUser.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/timer" element={<StudyTimer />} />
            <Route path="/chatbot" element={<Chatbot />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
