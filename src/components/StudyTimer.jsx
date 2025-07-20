import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSubjects } from '../hooks/useSubjects.js';
import { doc, updateDoc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const StudyTimer = () => {
  const { currentUser } = useAuth();
  const { subjects } = useSubjects();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessions, setSessions] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [subjectStudyTime, setSubjectStudyTime] = useState({});
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, short-break, long-break
  const [loading, setLoading] = useState(true);
  const selectedSubjectRef = useRef(selectedSubject);

  // Update ref when selectedSubject changes
  useEffect(() => {
    selectedSubjectRef.current = selectedSubject;
  }, [selectedSubject]);

  const timerSettings = useMemo(() => ({
    pomodoro: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  }), []);

  // Load user data from Firestore with real-time listener
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      console.log('No current user, skipping data load');
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const sessionsData = userData.sessions || 0;
        const studyTimeData = userData.studyTime || 0;
        const subjectStudyTimeData = userData.subjectStudyTime || {};
        
        // Only update state if timer is not running to prevent conflicts
        if (!isRunning) {
          setSessions(sessionsData);
          setTotalStudyTime(studyTimeData);
          setSubjectStudyTime(subjectStudyTimeData);
        }
        
        setLoading(false);
      } else {
        // Create user document if it doesn't exist
        const createDefaultUser = async () => {
          try {
            const defaultUserData = {
              displayName: currentUser.displayName || currentUser.email,
              email: currentUser.email,
              createdAt: new Date(),
              studyTime: 0,
              points: 0,
              streak: 0,
              longestStreak: 0,
              level: 1,
              sessions: 0,
              subjectStudyTime: {},
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
            
            await setDoc(userDocRef, defaultUserData);
            
            setSessions(0);
            setTotalStudyTime(0);
            setSubjectStudyTime({});
            setLoading(false);
          } catch (error) {
            console.error('Error creating default user:', error);
            setLoading(false);
          }
        };
        
        createDefaultUser();
      }
    }, (error) => {
      console.error('Error loading user data:', error);
      console.error('Error details:', error.code, error.message);
      console.error('Error stack:', error.stack);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, isRunning]);

  // Simple cleanup: clear selected subject if it's no longer available
  useEffect(() => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      setSelectedSubject('');
    }
  }, [selectedSubject, subjects]);

  // Save data when component unmounts
  useEffect(() => {
    return () => {
      if (currentUser && currentUser.uid && !loading) {
        const saveOnUnmount = async () => {
          try {
                    // Get current user data to preserve existing points
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = userDoc.exists() ? userDoc.data() : {};
        const existingPoints = currentUserData.points || 0;
        
        // Calculate NEW points based on current activity (don't overwrite existing)
        const studyHours = Math.floor(totalStudyTime / 3600);
        const studyPoints = studyHours * 10; // 10 points per hour
        const sessionPoints = sessions * 25; // 25 points per session
        const newPoints = studyPoints + sessionPoints;
        
        // Only update points if they've increased (to prevent overwriting)
        const finalPoints = Math.max(existingPoints, newPoints);

        await updateDoc(doc(db, 'users', currentUser.uid), {
          sessions: sessions,
          studyTime: totalStudyTime,
          subjectStudyTime: subjectStudyTime,
          points: finalPoints
        });
        // Check and award achievements
        const userDoc1 = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc1.exists()) {
          await checkAndAwardAchievements(currentUser.uid, userDoc1.data());
        }

          } catch (error) {
            console.error('Error saving data on unmount:', error);
            console.error('Error details:', error.code, error.message);
          }
        };
        saveOnUnmount();
      }
    };
  }, [currentUser, loading, sessions, totalStudyTime, subjectStudyTime]);

  // Save data to Firestore when timer stops or periodically during operation
  useEffect(() => {
    if (!currentUser || !currentUser.uid || loading) return;

    const saveUserData = async () => {
      try {
        // Get current user data to preserve existing points
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = userDoc.exists() ? userDoc.data() : {};
        const existingPoints = currentUserData.points || 0;
        
        // Calculate NEW points based on current activity (don't overwrite existing)
        const studyHours = Math.floor(totalStudyTime / 3600);
        const studyPoints = studyHours * 10; // 10 points per hour
        const sessionPoints = sessions * 25; // 25 points per session
        const newPoints = studyPoints + sessionPoints;
        
        // Only update points if they've increased (to prevent overwriting)
        const finalPoints = Math.max(existingPoints, newPoints);

        await updateDoc(doc(db, 'users', currentUser.uid), {
          sessions: sessions,
          studyTime: totalStudyTime,
          subjectStudyTime: subjectStudyTime,
          points: finalPoints
        });
        // Check and award achievements
        const userDoc2 = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc2.exists()) {
          await checkAndAwardAchievements(currentUser.uid, userDoc2.data());
        }
      } catch (error) {
        console.error('Error saving user data:', error);
        console.error('Error details:', error.code, error.message);
      }
    };

    // Save when timer stops
    if (!isRunning) {
      saveUserData();
    }
  }, [isRunning, currentUser, loading, sessions, totalStudyTime, subjectStudyTime]);

  // Periodic save during timer operation (every 60 seconds)
  useEffect(() => {
    if (!currentUser || !currentUser.uid || loading || !isRunning || timerMode !== 'pomodoro') return;

    const saveInterval = setInterval(async () => {
      try {
        // Get current user data to preserve existing points
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUserData = userDoc.exists() ? userDoc.data() : {};
        const existingPoints = currentUserData.points || 0;
        
        // Calculate NEW points based on current activity (don't overwrite existing)
        const studyHours = Math.floor(totalStudyTime / 3600);
        const studyPoints = studyHours * 10;
        const sessionPoints = sessions * 25;
        const newPoints = studyPoints + sessionPoints;
        
        // Only update points if they've increased (to prevent overwriting)
        const finalPoints = Math.max(existingPoints, newPoints);

        await updateDoc(doc(db, 'users', currentUser.uid), {
          sessions: sessions,
          studyTime: totalStudyTime,
          subjectStudyTime: subjectStudyTime,
          points: finalPoints
        });
        // Check and award achievements
        const userDoc3 = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc3.exists()) {
          await checkAndAwardAchievements(currentUser.uid, userDoc3.data());
        }
      } catch (error) {
        console.error('Error during periodic save:', error);
      }
    }, 60000); // Save every 60 seconds instead of 30

    return () => {
      clearInterval(saveInterval);
    };
  }, [currentUser, loading, isRunning, timerMode, sessions, totalStudyTime, subjectStudyTime]);

  // Timer logic with minimal flickering
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          // Add to study time if in pomodoro mode
          if (timerMode === 'pomodoro') {
            setTotalStudyTime(prevStudyTime => {
              const newStudyTime = prevStudyTime + 1;
              return newStudyTime;
            });
            
            // Add to subject study time if subject is selected
            if (selectedSubjectRef.current) {
              setSubjectStudyTime(prev => {
                const newSubjectTime = {
                  ...prev,
                  [selectedSubjectRef.current]: (prev[selectedSubjectRef.current] || 0) + 1
                };
                return newSubjectTime;
              });
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (timerMode === 'pomodoro') {
        setSessions(prev => {
          const newSessions = prev + 1;
          // Add to study history
          if (currentUser && currentUser.uid && selectedSubjectRef.current) {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            // 1 Pomodoro = 25 min = 0.42h
            addStudyHistoryEntry(
              currentUser.uid,
              dateStr,
              0.42,
              [selectedSubjectRef.current]
            );
          }
          // Auto-switch to break after 4 sessions
          if (newSessions % 4 === 0) {
            setTimerMode('long-break');
            setTimeLeft(timerSettings['long-break']);
          } else {
            setTimerMode('short-break');
            setTimeLeft(timerSettings['short-break']);
          }
          setIsBreak(true);
          return newSessions;
        });
      } else {
        // Break finished, switch back to pomodoro
        setTimerMode('pomodoro');
        setTimeLeft(timerSettings.pomodoro);
        setIsBreak(false);
      }
      // Play notification sound (if supported)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(isBreak ? 'Break time!' : 'Time to study!');
      }
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, timerMode, sessions, isBreak, timerSettings]);

  const startTimer = useCallback(() => {
    if (timerMode === 'pomodoro' && !selectedSubject) {
      alert('Please select a subject before starting a Pomodoro session!');
      return;
    }
    setIsRunning(true);
  }, [timerMode, selectedSubject]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(timerSettings[timerMode]);
  }, [timerMode, timerSettings]);

  const switchMode = useCallback((mode) => {
    setTimerMode(mode);
    setTimeLeft(timerSettings[mode]);
    setIsRunning(false);
    setIsBreak(mode !== 'pomodoro');
    if (mode !== 'pomodoro') {
      setSelectedSubject(''); // Clear subject selection for breaks
    }
  }, [timerSettings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const availableSubjects = subjects;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Timer</h1>
        <p className="text-gray-600">Stay focused with the Pomodoro Technique</p>
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="text-center">
          {/* Subject Selection */}
          {timerMode === 'pomodoro' && (
            <div className="mb-6">
              <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject to Study
              </label>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isRunning}
              >
                <option value="">Choose a subject...</option>
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              {selectedSubject && (
                <p className="text-sm text-green-600 mt-2">
                  Studying: <strong>{selectedSubject}</strong>
                </p>
              )}
            </div>
          )}

          {/* Timer Mode Selector */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timerMode === 'pomodoro'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🍅 Pomodoro
            </button>
            <button
              onClick={() => switchMode('short-break')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timerMode === 'short-break'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ☕ Short Break
            </button>
            <button
              onClick={() => switchMode('long-break')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timerMode === 'long-break'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🌴 Long Break
            </button>
          </div>

          {/* Timer Circle */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
            <div 
              className="absolute inset-0 rounded-full border-8 border-red-500 transition-all duration-1000"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
                transform: `rotate(${(timeLeft / timerSettings[timerMode]) * 360}deg)`
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-lg text-gray-600">
                  {timerMode === 'pomodoro' ? 'Focus Time' : 'Break Time'}
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center space-x-4">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                ▶️ Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                ⏸️ Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{sessions}</div>
          <div className="text-gray-600">Pomodoros Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatTotalTime(totalStudyTime)}
          </div>
          <div className="text-gray-600">Total Study Time</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.floor(totalStudyTime / 3600)}
          </div>
          <div className="text-gray-600">Hours Today</div>
        </div>
      </div>

      {/* Subject Study Time Breakdown */}
      {Object.keys(subjectStudyTime).length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Time by Subject</h3>
          <div className="space-y-3">
            {Object.entries(subjectStudyTime)
              .sort(([,a], [,b]) => b - a)
              .map(([subject, seconds]) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const percentage = totalStudyTime > 0 ? Math.round((seconds / totalStudyTime) * 100) : 0;
                
                return (
                  <div key={subject} className="flex items-center space-x-3">
                    <div className="w-32 text-sm font-medium text-gray-900 truncate">
                      {subject}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-right text-sm font-medium text-gray-900">
                      {hours > 0 ? `${hours}h ` : ''}{minutes}m
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      

      {/* Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Study Tips</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Work for 25 minutes, then take a 5-minute break</li>
          <li>• After 4 pomodoros, take a longer 15-minute break</li>
          <li>• Eliminate distractions during focus time</li>
          <li>• Use breaks to stretch and refresh your mind</li>
          <li>• Select a subject before starting to track study time accurately</li>
        </ul>
      </div>
    </div>
  );
};

// List of all possible achievements (should match Profile.jsx)
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

// Helper to check and award achievements
async function checkAndAwardAchievements(userId, userData) {
  const { sessions, studyTime, streak, subjectStudyTime, customSubjects, weeklyGoal, weeklyProgress } = userData;
  let achievementsList = userData.achievementsList || [];
  const now = new Date().toISOString().split('T')[0];

  // Helper to add achievement if not already present
  const addAchievement = (id) => {
    if (!achievementsList.some(a => a.id === id)) {
      const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
      if (ach) achievementsList = [...achievementsList, { ...ach, earned: true, date: now }];
    }
  };

  // First Steps: Complete your first study session
  if (sessions >= 1) addAchievement(1);
  // Week Warrior: Study for 7 consecutive days (streak)
  if (streak >= 7) addAchievement(2);
  // Century Club: Study for 100 total hours
  if ((studyTime / 3600) >= 100) addAchievement(6);
  // Streak Master: 30-day streak
  if (streak >= 30) addAchievement(8);
  // Subject Explorer: Study 5 different subjects
  if (customSubjects && customSubjects.length >= 5) addAchievement(9);
  // Focus Pro: 10 Pomodoro sessions in a week (not tracked here, but if sessions >= 10, award)
  if (sessions >= 10) addAchievement(10);
  // Marathoner: Study for 4 hours in a single day (not tracked here, but if weeklyProgress >= 4, award)
  if (weeklyProgress >= 4) addAchievement(17);
  // Consistency Champ: Study every day for a month (streak >= 30)
  if (streak >= 30) addAchievement(20);

  // Save if new achievements were added
  await updateDoc(doc(db, 'users', userId), { achievementsList });
}

// Helper to add a study history entry
async function addStudyHistoryEntry(userId, date, hours, subjects) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  let history = [];
  if (userDoc.exists()) {
    history = userDoc.data().studyHistory || [];
  }
  // If entry for this date exists, update it; else, add new
  const idx = history.findIndex(h => h.date === date);
  if (idx !== -1) {
    // Update hours and subjects
    history[idx].hours = (Number(history[idx].hours) + Number(hours));
    history[idx].subjects = Array.from(new Set([...(history[idx].subjects || []), ...subjects]));
  } else {
    history.push({ date, hours, subjects });
  }
  await updateDoc(userRef, { studyHistory: history });
}

export default StudyTimer; 