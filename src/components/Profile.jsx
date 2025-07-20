import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { 
  UserIcon, 
  AcademicCapIcon, 
  TrophyIcon, 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  FireIcon,
  StarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    achievements: true
  });
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  const [userStats] = useState({
    totalStudyTime: 156.5,
    completedTasks: 89,
    currentStreak: 12,
    totalPoints: 2840,
    level: 8,
    achievements: 15,
    subjects: ['Mathematics', 'Physics', 'English', 'Programming'],
    weeklyGoal: 20,
    weeklyProgress: 16.5
  });

  const [achievements] = useState([
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first study session',
      icon: '🎯',
      earned: true,
      date: '2024-01-15'
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      earned: true,
      date: '2024-01-20'
    },
    {
      id: 3,
      name: 'Task Master',
      description: 'Complete 50 tasks',
      icon: '✅',
      earned: true,
      date: '2024-01-18'
    },
    {
      id: 4,
      name: 'Math Whiz',
      description: 'Complete 20 math-related tasks',
      icon: '🧮',
      earned: false
    },
    {
      id: 5,
      name: 'Early Bird',
      description: 'Study before 8 AM for 5 days',
      icon: '🌅',
      earned: false
    },
    {
      id: 6,
      name: 'Century Club',
      description: 'Study for 100 total hours',
      icon: '💯',
      earned: false
    }
  ]);

  const [studyHistory] = useState([
    { date: '2024-01-24', hours: 4.5, subjects: ['Mathematics', 'Physics'] },
    { date: '2024-01-23', hours: 3.2, subjects: ['English', 'Programming'] },
    { date: '2024-01-22', hours: 5.1, subjects: ['Mathematics'] },
    { date: '2024-01-21', hours: 2.8, subjects: ['Physics', 'English'] },
    { date: '2024-01-20', hours: 4.0, subjects: ['Programming', 'Mathematics'] },
    { date: '2024-01-19', hours: 3.5, subjects: ['Physics'] },
    { date: '2024-01-18', hours: 4.2, subjects: ['English', 'Programming'] }
  ]);

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getLevelProgress = () => {
    const pointsForNextLevel = 3000;
    const currentLevelPoints = 2800;
    const progress = ((userStats.totalPoints - currentLevelPoints) / (pointsForNextLevel - currentLevelPoints)) * 100;
    return Math.min(progress, 100);
  };

  const getWeeklyProgress = () => {
    return (userStats.weeklyProgress / userStats.weeklyGoal) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and view your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-white" />
              </div>
              <div className="flex items-center justify-center space-x-2">
                {editingName ? (
                  <>
                    <input
                      type="text"
                      className="text-xl font-bold text-gray-900 border rounded px-2 py-1 w-40"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      disabled={nameLoading}
                    />
                    <button
                      className="text-primary-600 hover:underline text-sm"
                      onClick={async () => {
                        setNameLoading(true);
                        setNameError('');
                        setNameSuccess('');
                        try {
                          if (!newName.trim()) throw new Error('Name cannot be empty');
                          // Update Firebase Auth profile
                          await updateProfile(currentUser, { displayName: newName });
                          // Update Firestore user document
                          await updateDoc(doc(db, 'users', currentUser.uid), { displayName: newName });
                          setNameSuccess('Username updated!');
                          setEditingName(false);
                        } catch (err) {
                          setNameError(err.message || 'Failed to update username');
                        } finally {
                          setNameLoading(false);
                        }
                      }}
                      disabled={nameLoading}
                    >Save</button>
                    <button
                      className="text-gray-500 hover:underline text-sm"
                      onClick={() => { setEditingName(false); setNewName(currentUser?.displayName || ''); }}
                      disabled={nameLoading}
                    >Cancel</button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900">{currentUser?.displayName || 'Student'}</h2>
                    <button
                      className="ml-2 text-primary-600 hover:underline text-sm"
                      onClick={() => setEditingName(true)}
                    >Edit</button>
                  </>
                )}
              </div>
              {nameError && <div className="text-red-600 text-xs mt-1">{nameError}</div>}
              {nameSuccess && <div className="text-green-600 text-xs mt-1">{nameSuccess}</div>}
              <p className="text-gray-600">{currentUser?.email}</p>
            </div>

            {/* Level Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-900">Level {userStats.level}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getLevelProgress()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{userStats.totalPoints} / 3000 points</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{userStats.totalStudyTime}h</div>
                <div className="text-gray-600">Total Study Time</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{userStats.currentStreak}</div>
                <div className="text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: ChartBarIcon },
                { id: 'achievements', name: 'Achievements', icon: TrophyIcon },
                { id: 'history', name: 'Study History', icon: CalendarIcon },
                { id: 'settings', name: 'Settings', icon: CogIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Weekly Progress */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Study Goal: {userStats.weeklyGoal}h</span>
                    <span className="text-sm font-medium text-gray-700">{userStats.weeklyProgress}h / {userStats.weeklyGoal}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-success-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${getWeeklyProgress()}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{userStats.completedTasks}</div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-600">{userStats.achievements}</div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-600">{userStats.currentStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Subjects</h3>
                <div className="grid grid-cols-2 gap-3">
                  {userStats.subjects.map((subject, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <AcademicCapIcon className="h-5 w-5 text-primary-600" />
                      <span className="font-medium text-gray-900">{subject}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      achievement.earned
                        ? 'border-success-200 bg-success-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          achievement.earned ? 'text-success-800' : 'text-gray-600'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-success-700' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <p className="text-xs text-success-600 mt-1">
                            Earned on {achievement.date}
                          </p>
                        )}
                      </div>
                      {achievement.earned && (
                        <CheckCircleIcon className="h-5 w-5 text-success-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Study History</h3>
              <div className="space-y-3">
                {studyHistory.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{day.date}</p>
                        <p className="text-sm text-gray-600">{day.subjects.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{day.hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{key} Notifications</p>
                        <p className="text-sm text-gray-600">
                          {key === 'email' && 'Receive study reminders via email'}
                          {key === 'push' && 'Get push notifications on your device'}
                          {key === 'reminders' && 'Daily study session reminders'}
                          {key === 'achievements' && 'Notifications when you earn achievements'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          value ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{currentUser?.email}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Change
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Update
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Privacy</p>
                      <p className="text-sm text-gray-600">Manage your privacy settings</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 