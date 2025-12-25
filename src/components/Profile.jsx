import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDoc, onSnapshot, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { 
  UserIcon, 
  AcademicCapIcon, 
  TrophyIcon, 
  CogIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { currentUser, firebaseUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  // Notifications removed
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');

  // New: State for loading and user stats from Firestore
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(0);
  const [goalLoading, setGoalLoading] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [goalSuccess, setGoalSuccess] = useState('');

  // Helper to update userStats locally
  const updateUserStatsField = (field, value) => {
    setUserStats(prev => prev ? { ...prev, [field]: value } : prev);
  };

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    setLoading(true);
    const fetchUserStats = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserStats({
            totalStudyTime: data.studyTime ? (data.studyTime / 3600).toFixed(1) : 0,
            completedTasks: data.completedTasks || 0,
            currentStreak: data.streak || 0,
            totalPoints: data.points || 0,
            level: data.level || 1,
            achievements: data.achievements || 0,
            subjects: data.customSubjects || ['Mathematics', 'Physics', 'English', 'Programming'],
            weeklyGoal: data.weeklyGoal || 20,
            weeklyProgress: data.weeklyProgress || 0
          });
        } else {
          setUserStats(null);
        }
      } catch (err) {
        setUserStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, [currentUser]);

  useEffect(() => {
    if (userStats && userStats.weeklyGoal) {
      setNewGoal(userStats.weeklyGoal);
    }
  }, [userStats]);

  const [achievements, setAchievements] = useState([]);

  // Real-time achievements listener
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAchievements(data.achievementsList || []);
      } else {
        setAchievements([]);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  const [studyHistory, setStudyHistory] = useState([]);

  // Fetch study history from Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const fetchHistory = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setStudyHistory(userDoc.data().studyHistory || []);
        } else {
          setStudyHistory([]);
        }
      } catch {
        setStudyHistory([]);
      }
    };
    fetchHistory();
  }, [currentUser]);

  const getLevelProgress = () => {
    if (!userStats) return 0;
    // Example: Level 8 = 2800, Level 9 = 3000
    const currentLevelPoints = (userStats.level - 1) * 400 + 100; // Simplified
    const pointsForNextLevel = userStats.level * 400 + 100;
    const progress = ((userStats.totalPoints - currentLevelPoints) / (pointsForNextLevel - currentLevelPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getWeeklyProgress = () => {
    if (!userStats) return 0;
    return (userStats.weeklyProgress / userStats.weeklyGoal) * 100;
  };

  // Level calculation (same as Dashboard)
  const calculateLevel = (points) => {
    if (points < 100) return 1;
    if (points < 300) return 2;
    if (points < 600) return 3;
    if (points < 1000) return 4;
    if (points < 1500) return 5;
    if (points < 2100) return 6;
    if (points < 2800) return 7;
    if (points < 3600) return 8;
    if (points < 4500) return 9;
    return 10;
  };

  // CORRECTED: List of all possible achievements matching StudyTimer.jsx
  const ALL_ACHIEVEMENTS = [
    { id: 1, name: 'First Steps', description: 'Complete your first study session', icon: '🎯' },
    { id: 2, name: 'Week Warrior', description: 'Study for 7 consecutive days', icon: '🔥' },
    { id: 3, name: 'Task Master', description: 'Complete 50 tasks', icon: '✅' },
    { id: 4, name: 'Math Whiz', description: 'Complete 20 math-related tasks', icon: '🧮' },
    { id: 5, name: 'Early Bird', description: 'Study before 8 AM for 5 days', icon: '🌅' },
    { id: 6, name: 'Century Club', description: 'Study for 100 total hours', icon: '💯' },
    { id: 8, name: 'Streak Master', description: 'Maintain a 30-day study streak', icon: '🏆' },
    { id: 9, name: 'Subject Explorer', description: 'Study 5 different subjects', icon: '📚' },
    { id: 10, name: 'Focus Pro', description: 'Complete 10 Pomodoro sessions in one week', icon: '⏳' },
    { id: 11, name: 'Task Streak', description: 'Complete at least one task every day for 14 days', icon: '📅' },
    { id: 12, name: 'Science Star', description: 'Complete 10 science-related tasks', icon: '🔬' },
    { id: 13, name: 'Literature Lover', description: 'Complete 10 literature-related tasks', icon: '📖' },
    { id: 14, name: 'History Buff', description: 'Complete 10 history-related tasks', icon: '🏺' },
    { id: 15, name: 'Comeback Kid', description: 'Resume a streak after breaking it for at least 3 days', icon: '🔄' },
    { id: 16, name: 'Goal Crusher', description: 'Achieve your weekly study goal 4 weeks in a row', icon: '🥇' },
    { id: 17, name: 'Marathoner', description: 'Study for 4 hours in a single day', icon: '🏃‍♂️' },
    { id: 18, name: 'Helper', description: 'Help a friend with their studies', icon: '🤝' },
    { id: 19, name: 'AI Enthusiast', description: 'Use the AI Chatbot 10 times', icon: '🤖' },
    { id: 20, name: 'Consistency Champ', description: 'Log in and study every day for a month', icon: '📆' },
  ];

  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState('');
  const [subjectSuccess, setSubjectSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [lastPasswordChange, setLastPasswordChange] = useState(null);

  // Fetch last password change date
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    const fetchLastChange = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setLastPasswordChange(userDoc.data().lastPasswordChange || null);
        }
      } catch {}
    };
    fetchLastChange();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

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
                <span className="text-lg font-semibold text-gray-900">Level {calculateLevel(Number(userStats?.totalPoints) || 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${getLevelProgress()}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{userStats?.totalPoints || 0} points</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{userStats?.totalStudyTime || 0}h</div>
                <div className="text-gray-600">Total Study Time</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{userStats?.currentStreak || 0}</div>
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
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      Study Goal: {editingGoal ? (
                        <>
                          <input
                            type="number"
                            min={1}
                            max={168}
                            className="border rounded px-2 py-1 w-16 text-sm"
                            value={newGoal}
                            onChange={e => setNewGoal(Number(e.target.value))}
                            disabled={goalLoading}
                          />
                          <button
                            className="text-primary-600 hover:underline text-xs ml-1"
                            onClick={async () => {
                              setGoalLoading(true);
                              setGoalError('');
                              setGoalSuccess('');
                              try {
                                if (!newGoal || newGoal < 1 || newGoal > 168) throw new Error('Goal must be between 1 and 168');
                                await updateDoc(doc(db, 'users', currentUser.uid), { weeklyGoal: newGoal });
                                updateUserStatsField('weeklyGoal', newGoal); // update local state instantly
                                setGoalSuccess('Weekly goal updated!');
                                setEditingGoal(false);
                              } catch (err) {
                                setGoalError(err.message || 'Failed to update goal');
                              } finally {
                                setGoalLoading(false);
                              }
                            }}
                            disabled={goalLoading}
                          >Save</button>
                          <button
                            className="text-gray-500 hover:underline text-xs ml-1"
                            onClick={() => { setEditingGoal(false); setNewGoal(userStats?.weeklyGoal || 0); }}
                            disabled={goalLoading}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          {userStats?.weeklyGoal || 0}h
                          <button
                            className="ml-2 text-primary-600 hover:underline text-xs"
                            onClick={() => setEditingGoal(true)}
                          >Edit</button>
                        </>
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{userStats?.weeklyProgress || 0}h / {userStats?.weeklyGoal || 0}h</span>
                  </div>
                  {goalError && <div className="text-red-600 text-xs mt-1">{goalError}</div>}
                  {goalSuccess && <div className="text-green-600 text-xs mt-1">{goalSuccess}</div>}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-success-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${getWeeklyProgress()}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">{userStats?.completedTasks || 0}</div>
                    <div className="text-sm text-gray-600">Tasks Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-600">{achievements.length}</div>
                    <div className="text-sm text-gray-600">Achievements</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-600">{userStats?.currentStreak || 0}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  Your Subjects
                  <button
                    className="text-primary-600 hover:underline text-xs"
                    onClick={() => setAddingSubject(v => !v)}
                  >
                    {addingSubject ? 'Cancel' : 'Add Subject'}
                  </button>
                </h3>
                {addingSubject && (
                  <div className="flex items-center mb-4 gap-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-sm"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Enter new subject"
                      disabled={subjectLoading}
                    />
                    <button
                      className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                      disabled={subjectLoading || !newSubject.trim()}
                      onClick={async () => {
                        setSubjectLoading(true);
                        setSubjectError('');
                        setSubjectSuccess('');
                        try {
                          const trimmed = newSubject.trim();
                          if (!trimmed) throw new Error('Subject cannot be empty');
                          if ((userStats?.subjects || []).includes(trimmed)) throw new Error('Subject already exists');
                          const updatedSubjects = [...(userStats?.subjects || []), trimmed];
                          await updateDoc(doc(db, 'users', currentUser.uid), { customSubjects: updatedSubjects });
                          setSubjectSuccess('Subject added!');
                          setNewSubject('');
                          setAddingSubject(false);
                          // Update local state instantly
                          updateUserStatsField('subjects', updatedSubjects);
                        } catch (err) {
                          setSubjectError(err.message || 'Failed to add subject');
                        } finally {
                          setSubjectLoading(false);
                        }
                      }}
                    >Add</button>
                  </div>
                )}
                {subjectError && <div className="text-red-600 text-xs mb-2">{subjectError}</div>}
                {subjectSuccess && <div className="text-green-600 text-xs mb-2">{subjectSuccess}</div>}
                <div className="grid grid-cols-2 gap-3">
                  {(userStats?.subjects || []).map((subject, index) => (
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
                {ALL_ACHIEVEMENTS.map((ach) => {
                  const earned = achievements.find(a => a.id === ach.id || a.name === ach.name);
                  return (
                    <div
                      key={ach.id || ach.name}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        earned
                          ? 'border-success-200 bg-success-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{ach.icon}</div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            earned ? 'text-success-800' : 'text-gray-600'
                          }`}>
                            {ach.name}
                          </h4>
                          <p className={`text-sm ${
                            earned ? 'text-success-700' : 'text-gray-500'
                          }`}>
                            {ach.description}
                          </p>
                          {earned && earned.date && (
                            <p className="text-xs text-success-600 mt-1">
                              Earned on {earned.date}
                            </p>
                          )}
                        </div>
                        {earned && (
                          <CheckCircleIcon className="h-5 w-5 text-success-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Study History</h3>
              {studyHistory && studyHistory.length > 0 ? (
                <div className="space-y-3">
                  {[...studyHistory].sort((a, b) => b.date.localeCompare(a.date)).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{day.date}</p>
                          <p className="text-sm text-gray-600">{(day.subjects || []).join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{Number(day.hours).toFixed(1)}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">No study history yet.</div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Notifications section removed */}

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
                      <p className="text-sm text-gray-600">
                        Last changed{' '}
                        {lastPasswordChange
                          ? new Date(lastPasswordChange).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>
                    <button
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      onClick={() => setShowPasswordForm(v => !v)}
                    >
                      Update
                    </button>
                  </div>
                  {showPasswordForm && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        disabled={passwordLoading}
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        disabled={passwordLoading}
                      />
                      <label className="block text-sm font-medium text-gray-700 mt-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={passwordLoading}
                      />
                      {passwordError && <div className="text-red-600 text-xs mt-1">{passwordError}</div>}
                      {passwordSuccess && <div className="text-green-600 text-xs mt-1">{passwordSuccess}</div>}
                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                          disabled={passwordLoading}
                          onClick={async () => {
                            setPasswordLoading(true);
                            setPasswordError('');
                            setPasswordSuccess('');
                            try {
                              if (!currentPassword || !newPassword || !confirmPassword) throw new Error('All fields are required');
                              if (newPassword !== confirmPassword) throw new Error('Passwords do not match');
                              if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');
                              // Re-authenticate
                              const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
                              await reauthenticateWithCredential(firebaseUser, credential);
                              await updatePassword(firebaseUser, newPassword);
                              // Update lastPasswordChange in Firestore
                              const now = new Date().toISOString();
                              await updateDoc(doc(db, 'users', currentUser.uid), { lastPasswordChange: now });
                              setLastPasswordChange(now);
                              setPasswordSuccess('Password updated successfully!');
                              setShowPasswordForm(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            } catch (err) {
                              setPasswordError(err.message || 'Failed to update password');
                            } finally {
                              setPasswordLoading(false);
                            }
                          }}
                        >Save</button>
                        <button
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded text-sm font-medium"
                          disabled={passwordLoading}
                          onClick={() => {
                            setShowPasswordForm(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordError('');
                            setPasswordSuccess('');
                          }}
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div>
                      <p className="font-medium text-red-600">Reset Progress</p>
                      <p className="text-xs text-gray-500">This will erase all your study progress, achievements, and stats. This action cannot be undone.</p>
                    </div>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                      disabled={resetLoading}
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) return;
                        setResetLoading(true);
                        setResetError('');
                        setResetSuccess('');
                        try {
                          console.log('Resetting user stats for', currentUser.uid);
                          // 1. Reset user stats
                          await updateDoc(doc(db, 'users', currentUser.uid), {
                            points: 0,
                            streak: 0,
                            longestStreak: 0,
                            studyTime: 0,
                            sessions: 0,
                            completedTasks: 0,
                            totalTasks: 0,
                            achievements: 0,
                            achievementsList: [],
                            weeklyGoal: 20,
                            weeklyProgress: 0,
                            subjectStudyTime: {},
                            streakData: {
                              currentStreak: 0,
                              lastStudyDate: null,
                              longestStreak: 0
                            }
                          });
                          console.log('User stats reset. Now querying tasks...');
                          // 2. Delete all tasks for this user
                          const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
                          const tasksSnapshot = await getDocs(tasksQuery);
                          console.log('Tasks found for deletion:', tasksSnapshot.docs.length);
                          if (tasksSnapshot.docs.length === 0) {
                            alert('No tasks found to delete. User stats have been reset.');
                          } else {
                            const deletePromises = tasksSnapshot.docs.map(docSnap => {
                              console.log('Deleting task:', docSnap.id, docSnap.data());
                              return deleteDoc(doc(db, 'tasks', docSnap.id));
                            });
                            await Promise.all(deletePromises);
                            alert('Progress and all tasks have been reset.');
                          }
                          setResetSuccess('Progress and all tasks have been reset.');
                        } catch (err) {
                          console.error('Reset progress error:', err);
                          setResetError('Failed to reset progress.');
                          alert('Failed to reset progress: ' + (err.message || err.code || err));
                        } finally {
                          setResetLoading(false);
                        }
                      }}
                    >
                      {resetLoading ? 'Resetting...' : 'Reset Progress'}
                    </button>
                  </div>
                  {resetError && <div className="text-red-600 text-xs mt-2">{resetError}</div>}
                  {resetSuccess && <div className="text-green-600 text-xs mt-2">{resetSuccess}</div>}
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