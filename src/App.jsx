import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import StudyTimer from './components/StudyTimer';
import Chatbot from './components/Chatbot';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
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
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskManager />} />
            <Route path="/timer" element={<StudyTimer />} />
            <Route path="/flashcards" element={<FlashcardLibrary />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/profile" element={<Profile />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;