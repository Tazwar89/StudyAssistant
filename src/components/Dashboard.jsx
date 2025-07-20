import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    studyTime: 0,
    streak: 0,
    points: 0,
    upcomingDeadlines: 0
  });
  const [pointsLoaded, setPointsLoaded] = useState(false);

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load and calculate stats from Firestore with real-time listeners
  useEffect(() => {
    if (!currentUser) return;



    // Set up real-time listener for user data changes
    const unsubscribeUser = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();


        // Get current sessions and study time from user data
        const currentSessions = userData?.sessions || 0;
        const currentStudyTime = userData?.studyTime || 0;
        const currentPoints = userData?.points || 0;

        // Get study time from user data
        const studyTimeSeconds = currentStudyTime;
        const studyTimeHours = (studyTimeSeconds / 3600).toFixed(1);

        // Get sessions from user data
        const sessions = currentSessions;

        // Calculate Study Streak
        const calculateStudyStreak = () => {
          // Use existing streak data or initialize
          const streakData = userData?.streakData || {
            currentStreak: 0,
            lastStudyDate: null,
            longestStreak: 0
          };
          
          const today = new Date().toDateString();
          
          // If user has studied today (has study time or sessions), update streak
          if (studyTimeSeconds > 0 || sessions > 0) {
            if (streakData.lastStudyDate !== today) {
              // Check if yesterday was studied (consecutive day)
              const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
              
              if (streakData.lastStudyDate === yesterday) {
                streakData.currentStreak += 1;
              } else {
                streakData.currentStreak = 1; // Reset streak if missed a day
              }
              streakData.lastStudyDate = today;
              
              // Update longest streak if current is longer
              if (streakData.currentStreak > streakData.longestStreak) {
                streakData.longestStreak = streakData.currentStreak;
              }
              
              // Update user document with new streak data
              updateDoc(doc(db, 'users', currentUser.uid), {
                streakData: streakData,
                streak: streakData.currentStreak,
                longestStreak: streakData.longestStreak
              }).catch(error => {
                console.error('Error updating streak data:', error);
              });
            }
          }
          
          return streakData.currentStreak;
        };

        // Calculate the current streak
        const currentStreak = calculateStudyStreak();



        // Generate Recent Activity
        const generateRecentActivity = () => {
          const activities = [];
          
          // Add study session activity
          if (sessions > 0) {
            activities.push({
              type: 'study',
              message: `Completed ${sessions} Pomodoro session${sessions > 1 ? 's' : ''}`,
              time: new Date(),
              icon: '📚'
            });
          }
          
          // Add study time activity (only if there's actual study time)
          if (studyTimeSeconds > 0) {
            const hours = parseFloat(studyTimeHours);
            if (hours > 0) {
              activities.push({
                type: 'time',
                message: `Studied for ${hours.toFixed(1)} hours`,
                time: new Date(),
                icon: '⏱️'
              });
            }
          }
          
          // Add task completion activities
          const completedTasks = tasks.filter(task => task.status === 'completed');
          completedTasks.forEach(task => {
            if (task.completedAt) {
              activities.push({
                type: 'task',
                message: `Completed task: ${task.title}`,
                time: task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt),
                icon: '✅'
              });
            }
          });
          
          // Sort by time (most recent first)
          activities.sort((a, b) => b.time - a.time);
          
          return activities.slice(0, 5);
        };

        // Update stats with real-time data
        setStats(prevStats => {
          const newStats = {
            totalTasks: prevStats.totalTasks, // Will be updated by tasks listener
            completedTasks: prevStats.completedTasks, // Will be updated by tasks listener
            studyTime: parseFloat(studyTimeHours),
            streak: currentStreak,
            points: currentPoints,
            upcomingDeadlines: prevStats.upcomingDeadlines // Will be updated by tasks listener
          };
          setPointsLoaded(true);
          return newStats;
        });

        // Set data

        // Note: Recent activity will be updated when tasks are loaded
        setLoading(false);
      }
    });

    // Set up real-time listener for tasks changes
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
    const unsubscribeTasks = onSnapshot(tasksQuery, (tasksSnapshot) => {
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Dashboard: Tasks updated:', tasks.length, 'tasks');
      
      // Calculate stats with updated tasks
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      
      // Get upcoming deadlines (tasks due within 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= nextWeek && task.status !== 'completed';
      }).length;
      
      // Update stats immediately - preserve points and other user data
      setStats(prevStats => {
        const newStats = {
          ...prevStats,
          totalTasks,
          completedTasks,
          upcomingDeadlines
        };
        // Ensure points are preserved once loaded
        if (pointsLoaded && prevStats.points > 0) {
          newStats.points = prevStats.points;
          console.log('Dashboard: Points preserved:', prevStats.points);
        } else {
          console.log('Dashboard: Points not preserved - pointsLoaded:', pointsLoaded, 'prevPoints:', prevStats.points);
        }
        console.log('Dashboard: Task stats updated:', newStats);
        return newStats;
      });
      
      // Update upcoming tasks - show pending tasks instead of just due dates
      const upcomingTasksData = tasks
        .filter(task => task.status === 'pending')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
      
      setUpcomingTasks(upcomingTasksData);
      console.log('Dashboard: Upcoming tasks:', upcomingTasksData.length, 'tasks');
      
      // Update recent activity with task completion data
      const generateRecentActivityWithTasks = () => {
        const activities = [];
        
        // Get current user data for study activities
        const userDoc = doc(db, 'users', currentUser.uid);
        getDoc(userDoc).then((userSnapshot) => {
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const currentSessions = userData?.sessions || 0;
            const currentStudyTime = userData?.studyTime || 0;
            const studyTimeHours = (currentStudyTime / 3600).toFixed(1);
            
            // Add study session activity
            if (currentSessions > 0) {
              activities.push({
                type: 'study',
                message: `Completed ${currentSessions} Pomodoro session${currentSessions > 1 ? 's' : ''}`,
                time: new Date(),
                icon: '📚'
              });
            }
            
            // Add study time activity (only if there's actual study time)
            if (currentStudyTime > 0) {
              const hours = parseFloat(studyTimeHours);
              if (hours > 0) {
                activities.push({
                  type: 'time',
                  message: `Studied for ${hours.toFixed(1)} hours`,
                  time: new Date(),
                  icon: '⏱️'
                });
              }
            }
          }
        });
        
        // Add task completion activities
        const completedTasks = tasks.filter(task => task.status === 'completed');
        completedTasks.forEach(task => {
          if (task.completedAt) {
            activities.push({
              type: 'task',
              message: `Completed task: ${task.title}`,
              time: task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt),
              icon: '✅'
            });
          }
        });
        
        // Sort by time (most recent first)
        activities.sort((a, b) => b.time - a.time);
        
        setRecentActivity(activities.slice(0, 5));
      };
      
      generateRecentActivityWithTasks();
      
      console.log('Dashboard: Stats updated -', { totalTasks, completedTasks, upcomingDeadlines });
    }, (error) => {
      console.error('Error loading tasks in Dashboard:', error);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTasks();
    };
  }, [currentUser]);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Calculate user level based on points
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

  // Calculate points needed to reach next level
  const getPointsToNextLevel = (points, currentLevel) => {
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    if (currentLevel >= 10) return 0;
    return levelThresholds[currentLevel] - points;
  };

  // Calculate level progress percentage
  const getLevelProgress = (points, currentLevel) => {
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
    if (currentLevel >= 10) return 100;
    
    const currentLevelThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextLevelThreshold = levelThresholds[currentLevel];
    const progressInLevel = points - currentLevelThreshold;
    const pointsNeededForLevel = nextLevelThreshold - currentLevelThreshold;
    
    return Math.min(100, (progressInLevel / pointsNeededForLevel) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const progressPercentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const userLevel = calculateLevel(stats.points);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {currentUser.displayName || 'Student'}! 👋</h1>
        <p className="text-gray-600">Here's your study progress for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}/{stats.totalTasks}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{progressPercentage}% complete</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.studyTime}h</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">This week</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.streak > 0 ? `Keep it up! 🔥` : `Start studying to build your streak!`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Points Earned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.points}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Level {userLevel}</p>
        </div>
      </div>



      {/* Points System */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Points System</h3>
            <p className="text-purple-100 mb-4">Track your progress and earn rewards</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{stats.points}</p>
                <p className="text-sm text-purple-100">Total Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Level {userLevel}</p>
                <p className="text-sm text-purple-100">Current Level</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm text-purple-100">
              {userLevel < 10 ? `${getPointsToNextLevel(stats.points, userLevel)} points to next level` : 'Max level reached!'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-purple-300 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${userLevel < 10 ? Math.min(100, getLevelProgress(stats.points, userLevel)) : 100}%` 
              }}
            ></div>
          </div>
          <p className="text-xs text-purple-100 mt-1">
            {userLevel < 10 ? `Progress to Level ${userLevel + 1}` : 'Maximum level achieved!'}
          </p>
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.subject} • Due {new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 