import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Navigation = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md w-full py-3 flex items-center justify-between px-8">
      <div className="text-xl font-bold text-gray-900">Study Assistant</div>
      <div className="flex space-x-4">
        <Link to="/" className="px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-700">Dashboard</Link>
        <Link to="/tasks" className="px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-700">Tasks</Link>
        <Link to="/timer" className="px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-700">Timer</Link>
        <Link to="/flashcards" className="px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-700">Library</Link>
        <Link to="/chatbot" className="px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-700">Chatbot</Link>
        <Link to="/profile" className="px-4 py-2 rounded hover:bg-gray-100 font-medium text-gray-700">Profile</Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;