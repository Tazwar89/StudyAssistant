import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    studyTime: 0,
    streak: 0,
    points: 0,
    upcomingDeadlines: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  // Load and calculate stats from localStorage
  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('studyAssistantTasks');
    let tasks = [];
    
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    } else {
      // Default tasks if no saved data
      tasks = [
        { id: 1, title: 'Complete Math Assignment', subject: 'Mathematics', priority: 'high', dueDate: '2024-01-25', status: 'pending', description: 'Finish calculus problems 1-20' },
        { id: 2, title: 'Physics Lab Report', subject: 'Physics', priority: 'high', dueDate: '2024-01-26', status: 'in-progress', description: 'Write lab report for pendulum experiment' },
        { id: 3, title: 'Literature Essay', subject: 'English', priority: 'medium', dueDate: '2024-01-28', status: 'pending', description: 'Essay on Shakespeare\'s Hamlet' },
        { id: 4, title: 'Programming Project', subject: 'Computer Science', priority: 'low', dueDate: '2024-01-30', status: 'completed', description: 'Build a simple calculator app' }
      ];
    }

    // Calculate stats
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

    // Load study time from localStorage
    const savedStudyTime = localStorage.getItem('studyAssistantStudyTime');
    const studyTimeSeconds = savedStudyTime ? parseInt(savedStudyTime) : 0;
    const studyTimeHours = (studyTimeSeconds / 3600).toFixed(1);

    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('studyAssistantSessions');
    const sessions = savedSessions ? parseInt(savedSessions) : 0;

    // Calculate Study Streak
    const calculateStudyStreak = () => {
      const savedStreakData = localStorage.getItem('studyAssistantStreak');
      if (!savedStreakData) {
        // Initialize streak data
        const streakData = {
          currentStreak: 0,
          lastStudyDate: null,
          longestStreak: 0
        };
        localStorage.setItem('studyAssistantStreak', JSON.stringify(streakData));
        return 0;
      }

      const streakData = JSON.parse(savedStreakData);
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
          
          localStorage.setItem('studyAssistantStreak', JSON.stringify(streakData));
        }
      }
      
      return streakData.currentStreak;
    };

    // Calculate Points Earned
    const calculatePoints = () => {
      const savedPoints = localStorage.getItem('studyAssistantPoints');
      let currentPoints = savedPoints ? parseInt(savedPoints) : 0;
      
      // Calculate points from today's activity
      let todayPoints = 0;
      
      // Points for completed tasks (50 points each)
      todayPoints += completedTasks * 50;
      
      // Points for study time (10 points per hour)
      todayPoints += Math.floor(studyTimeSeconds / 3600) * 10;
      
      // Points for Pomodoro sessions (25 points each)
      todayPoints += sessions * 25;
      
      // Points for in-progress tasks (10 points each)
      todayPoints += inProgressTasks * 10;
      
      // Check if we already counted today's points
      const savedLastPointsDate = localStorage.getItem('studyAssistantLastPointsDate');
      const today = new Date().toDateString();
      
      if (savedLastPointsDate !== today) {
        // Add today's points to total
        currentPoints += todayPoints;
        localStorage.setItem('studyAssistantPoints', currentPoints.toString());
        localStorage.setItem('studyAssistantLastPointsDate', today);
      }
      
      return currentPoints;
    };

    // Generate Weekly Study Data
    const generateWeeklyData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Simulate weekly data based on current study time
      const weeklyData = days.map((day, index) => {
        let hours = 0;
        
        // Today gets the actual study time
        if (index === (currentDay === 0 ? 6 : currentDay - 1)) {
          hours = parseFloat(studyTimeHours);
        } else {
          // Simulate other days with some variation
          const baseHours = parseFloat(studyTimeHours) * 0.3; // 30% of today's time
          hours = Math.max(0, baseHours + (Math.random() - 0.5) * 2); // Add some randomness
        }
        
        return {
          day,
          hours: Math.round(hours * 10) / 10, // Round to 1 decimal
          percentage: Math.min(100, (hours / 4) * 100) // Assume 4 hours is max
        };
      });
      
      return weeklyData;
    };

    // Generate Subject Study Data
    const generateSubjectData = () => {
      // Load real subject study time from localStorage
      const savedSubjectTime = localStorage.getItem('studyAssistantSubjectTime');
      const subjectStudyTime = savedSubjectTime ? JSON.parse(savedSubjectTime) : {};
      
      // Get current subjects from tasks
      const currentSubjects = [...new Set(tasks.map(task => task.subject))];
      
      // Clean up subject study time for subjects that no longer have tasks
      const cleanedSubjectTime = {};
      Object.entries(subjectStudyTime).forEach(([subject, seconds]) => {
        if (currentSubjects.includes(subject)) {
          cleanedSubjectTime[subject] = seconds;
        }
      });
      
      // Save cleaned data back to localStorage if changes were made
      if (Object.keys(cleanedSubjectTime).length !== Object.keys(subjectStudyTime).length) {
        localStorage.setItem('studyAssistantSubjectTime', JSON.stringify(cleanedSubjectTime));
      }
      
      if (Object.keys(cleanedSubjectTime).length === 0) {
        // Fallback to simulated data if no real data exists
        const subjectMap = {};
        
        // Count tasks by subject
        tasks.forEach(task => {
          if (!subjectMap[task.subject]) {
            subjectMap[task.subject] = {
              subject: task.subject,
              tasks: 0,
              completed: 0,
              studyTime: 0
            };
          }
          subjectMap[task.subject].tasks += 1;
          if (task.status === 'completed') {
            subjectMap[task.subject].completed += 1;
          }
        });
        
        // Distribute study time across subjects (simulate based on task count)
        const totalStudyTime = parseFloat(studyTimeHours);
        const subjects = Object.values(subjectMap);
        const totalTasks = subjects.reduce((sum, subj) => sum + subj.tasks, 0);
        
        subjects.forEach(subject => {
          const proportion = totalTasks > 0 ? subject.tasks / totalTasks : 1 / subjects.length;
          subject.studyTime = Math.round(totalStudyTime * proportion * 10) / 10;
          subject.percentage = Math.min(100, (subject.studyTime / Math.max(1, totalStudyTime)) * 100);
        });
        
        return subjects.sort((a, b) => b.studyTime - a.studyTime);
      }
      
      // Use real subject study time data
      const subjects = Object.entries(cleanedSubjectTime).map(([subject, seconds]) => {
        const hours = seconds / 3600; // Convert seconds to hours
        const totalStudyTime = parseFloat(studyTimeHours);
        const percentage = totalStudyTime > 0 ? (hours / totalStudyTime) * 100 : 0;
        
        return {
          subject,
          studyTime: Math.round(hours * 10) / 10, // Round to 1 decimal
          percentage: Math.min(100, percentage),
          seconds: seconds
        };
      });
      
      return subjects.sort((a, b) => b.seconds - a.seconds);
    };

    const studyStreak = calculateStudyStreak();
    const totalPoints = calculatePoints();
    const weeklyStudyData = generateWeeklyData();
    const subjectStudyData = generateSubjectData();

    setStats({
      totalTasks,
      completedTasks,
      studyTime: parseFloat(studyTimeHours),
      streak: studyStreak,
      points: totalPoints,
      upcomingDeadlines
    });

    setWeeklyData(weeklyStudyData);
    setSubjectData(subjectStudyData);

    // Set upcoming tasks for display
    const upcomingTasksList = tasks
      .filter(task => task.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
    
    setUpcomingTasks(upcomingTasksList);

    // Generate real recent activity
    const generateRecentActivity = () => {
      const activities = [];
      const now = new Date();

      // Add completed tasks as activities
      const completedTasks = tasks.filter(task => task.status === 'completed');
      completedTasks.forEach((task, index) => {
        const timeAgo = new Date(now.getTime() - (index + 1) * 2 * 60 * 60 * 1000); // Simulate completion times
        activities.push({
          id: `task-${task.id}`,
          task: task.title,
          time: formatTimeAgo(timeAgo),
          type: 'completed',
          timestamp: timeAgo.getTime()
        });
      });

      // Add in-progress tasks as activities
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
      inProgressTasks.forEach((task, index) => {
        const timeAgo = new Date(now.getTime() - (index + 1) * 3 * 60 * 60 * 1000); // Simulate start times
        activities.push({
          id: `start-${task.id}`,
          task: `Started ${task.title}`,
          time: formatTimeAgo(timeAgo),
          type: 'started',
          timestamp: timeAgo.getTime()
        });
      });

      // Add study sessions as activities
      if (sessions > 0) {
        const sessionTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
        activities.push({
          id: 'study-session',
          task: `Completed ${sessions} Pomodoro session${sessions > 1 ? 's' : ''}`,
          time: formatTimeAgo(sessionTime),
          type: 'study',
          timestamp: sessionTime.getTime()
        });
      }

      // Add study time milestone
      if (studyTimeSeconds > 0) {
        const milestoneTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
        const hours = Math.floor(studyTimeSeconds / 3600);
        const minutes = Math.floor((studyTimeSeconds % 3600) / 60);
        if (hours > 0 || minutes > 0) {
          activities.push({
            id: 'study-time',
            task: `Studied for ${hours > 0 ? `${hours}h ` : ''}${minutes}m today`,
            time: formatTimeAgo(milestoneTime),
            type: 'study',
            timestamp: milestoneTime.getTime()
          });
        }
      }

      // Sort by timestamp (most recent first) and take top 4
      return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 4);
    };

    setRecentActivity(generateRecentActivity());
  }, []);

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

  const progressPercentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const userLevel = calculateLevel(stats.points);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Student! 👋</h1>
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
          <p className="text-xs text-gray-500 mt-2">Level {userLevel} Student</p>
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Points System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span>Completed Task: <strong>50 points</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">⏰</span>
            <span>Study Hour: <strong>10 points</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-purple-600">🍅</span>
            <span>Pomodoro Session: <strong>25 points</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-600">▶️</span>
            <span>Started Task: <strong>10 points</strong></span>
          </div>
        </div>
      </div>

      {/* Real Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Study Hours Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Hours This Week</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '200px' }}>
                  <div 
                    className="bg-blue-500 rounded-t-lg transition-all duration-500 ease-out"
                    style={{ 
                      height: `${day.percentage}%`,
                      minHeight: day.hours > 0 ? '4px' : '0px'
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-gray-900">{day.hours}h</p>
                  <p className="text-xs text-gray-500">{day.day}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total: {weeklyData.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h this week
            </p>
          </div>
        </div>

        {/* Study Time by Subject Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Time by Subject</h3>
          <div className="h-64 space-y-3">
            {subjectData.length > 0 ? (
              subjectData.map((subject) => (
                <div key={subject.subject} className="flex items-center space-x-3">
                  <div className="w-24 text-sm font-medium text-gray-900 truncate">
                    {subject.subject}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${subject.percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium text-gray-900">
                    {subject.studyTime}h
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No subject data available</p>
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {subjectData.length} subjects • {subjectData.reduce((sum, subject) => sum + subject.studyTime, 0).toFixed(1)}h total
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
            <span className="text-gray-400 text-xl">📅</span>
          </div>
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{task.dueDate}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <span className="text-gray-400 text-xl">🎓</span>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'completed' ? 'bg-green-100' : 
                    activity.type === 'study' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    <span className={`text-sm ${
                      activity.type === 'completed' ? 'text-green-600' : 
                      activity.type === 'study' ? 'text-purple-600' : 'text-blue-600'
                    }`}>
                      {activity.type === 'completed' ? '✓' : 
                       activity.type === 'study' ? '⏰' : '▶️'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.task}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">Complete tasks or start studying to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 