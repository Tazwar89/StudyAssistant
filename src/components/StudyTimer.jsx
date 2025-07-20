import { useState, useEffect, useCallback, useMemo } from 'react';

const StudyTimer = () => {
  // Load timer data from localStorage on component mount
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem('studyAssistantSessions');
    return savedSessions ? parseInt(savedSessions) : 0;
  });
  const [totalStudyTime, setTotalStudyTime] = useState(() => {
    const savedStudyTime = localStorage.getItem('studyAssistantStudyTime');
    return savedStudyTime ? parseInt(savedStudyTime) : 0;
  });
  const [subjectStudyTime, setSubjectStudyTime] = useState(() => {
    const savedSubjectTime = localStorage.getItem('studyAssistantSubjectTime');
    return savedSubjectTime ? JSON.parse(savedSubjectTime) : {};
  });
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, short-break, long-break

  const timerSettings = useMemo(() => ({
    pomodoro: 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60
  }), []);

  // Get available subjects from tasks
  const getAvailableSubjects = () => {
    const savedTasks = localStorage.getItem('studyAssistantTasks');
    if (!savedTasks) return ['Mathematics', 'Physics', 'English', 'Computer Science'];
    
    const tasks = JSON.parse(savedTasks);
    const subjects = [...new Set(tasks.map(task => task.subject))];
    return subjects.length > 0 ? subjects : ['Mathematics', 'Physics', 'English', 'Computer Science'];
  };

  // Clean up subject study time for subjects that no longer exist
  const cleanupSubjectStudyTime = useCallback(() => {
    const availableSubjects = getAvailableSubjects();
    const cleanedSubjectTime = {};
    
    Object.entries(subjectStudyTime).forEach(([subject, seconds]) => {
      if (availableSubjects.includes(subject)) {
        cleanedSubjectTime[subject] = seconds;
      }
    });
    
    // Update state if changes were made
    if (Object.keys(cleanedSubjectTime).length !== Object.keys(subjectStudyTime).length) {
      setSubjectStudyTime(cleanedSubjectTime);
    }
    
    // Clear selected subject if it's no longer available
    if (selectedSubject && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject('');
    }
  }, [subjectStudyTime, selectedSubject]);

  // Clean up subject data when component mounts or tasks change
  useEffect(() => {
    cleanupSubjectStudyTime();
  }, [cleanupSubjectStudyTime]);

  // Save sessions and study time to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('studyAssistantSessions', sessions.toString());
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('studyAssistantStudyTime', totalStudyTime.toString());
  }, [totalStudyTime]);

  useEffect(() => {
    localStorage.setItem('studyAssistantSubjectTime', JSON.stringify(subjectStudyTime));
  }, [subjectStudyTime]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          // Add to study time if in pomodoro mode
          if (timerMode === 'pomodoro') {
            setTotalStudyTime(prevStudyTime => prevStudyTime + 1);
            
            // Add to subject study time if subject is selected
            if (selectedSubject) {
              setSubjectStudyTime(prev => ({
                ...prev,
                [selectedSubject]: (prev[selectedSubject] || 0) + 1
              }));
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (timerMode === 'pomodoro') {
        setSessions(prev => prev + 1);
        // Auto-switch to break after 4 sessions
        if ((sessions + 1) % 4 === 0) {
          setTimerMode('long-break');
          setTimeLeft(timerSettings['long-break']);
        } else {
          setTimerMode('short-break');
          setTimeLeft(timerSettings['short-break']);
        }
        setIsBreak(true);
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
  }, [isRunning, timeLeft, timerMode, sessions, isBreak, timerSettings, selectedSubject]);

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

  const availableSubjects = getAvailableSubjects();

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
                const percentage = totalStudyTime > 0 ? (seconds / totalStudyTime) * 100 : 0;
                
                return (
                  <div key={subject} className="flex items-center space-x-3">
                    <div className="w-32 text-sm font-medium text-gray-900 truncate">
                      {subject}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
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

      {/* Debug Info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Debug: Timer running: {isRunning ? 'Yes' : 'No'} | Mode: {timerMode} | Subject: {selectedSubject || 'None'} | Study time: {totalStudyTime}s
      </div>

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

export default StudyTimer; 