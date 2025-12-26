import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSubjects } from '../hooks/useSubjects.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';
// IMPORT THE FLASHCARD COMPONENT
import FlashcardGenerator from './FlashcardGenerator';

// List of all possible achievements (should match Profile.jsx)
const ALL_ACHIEVEMENTS = [
  { id: 3, name: 'Task Master', description: 'Complete 50 tasks', icon: '✅' },
  { id: 4, name: 'Math Whiz', description: 'Complete 20 math-related tasks', icon: '🧮' },
  { id: 12, name: 'Science Star', description: 'Complete 10 science-related tasks', icon: '🔬' },
  { id: 13, name: 'Literature Lover', description: 'Complete 10 literature-related tasks', icon: '📖' },
  { id: 14, name: 'History Buff', description: 'Complete 10 history-related tasks', icon: '🏺' },
  { id: 11, name: 'Task Streak', description: 'Complete at least one task every day for 14 days', icon: '📅' },
];

// Helper to check and award task-based achievements
async function checkAndAwardTaskAchievements(userId, tasks) {
  let achievementsList = [];
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      achievementsList = userDoc.data().achievementsList || [];
    }
    const now = new Date().toISOString().split('T')[0];

    const addAchievement = (id) => {
      if (!achievementsList.some(a => a.id === id)) {
        const ach = ALL_ACHIEVEMENTS.find(a => a.id === id);
        if (ach) achievementsList = [...achievementsList, { ...ach, earned: true, date: now }];
      }
    };

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    if (completedTasks >= 50) addAchievement(3);
    
    const mathTasks = tasks.filter(t => t.status === 'completed' && t.subject && t.subject.toLowerCase().includes('math')).length;
    if (mathTasks >= 20) addAchievement(4);
    
    const scienceTasks = tasks.filter(t => t.status === 'completed' && t.subject && t.subject.toLowerCase().includes('science')).length;
    if (scienceTasks >= 10) addAchievement(12);
    
    const literatureTasks = tasks.filter(t => t.status === 'completed' && t.subject && t.subject.toLowerCase().includes('literature')).length;
    if (literatureTasks >= 10) addAchievement(13);
    
    const historyTasks = tasks.filter(t => t.status === 'completed' && t.subject && t.subject.toLowerCase().includes('history')).length;
    if (historyTasks >= 10) addAchievement(14);
    
    const completedDates = tasks.filter(t => t.status === 'completed' && t.completedAt).map(t => {
      const d = t.completedAt instanceof Date ? t.completedAt : new Date(t.completedAt.seconds * 1000); // Handle Firestore timestamp
      return d.toISOString().split('T')[0];
    });
    
    const uniqueDays = Array.from(new Set(completedDates));
    uniqueDays.sort();
    let streak = 1, maxStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    if (maxStreak >= 14) addAchievement(11);

    if (achievementsList.length > (userDoc.data().achievementsList || []).length) {
       await updateDoc(doc(db, 'users', userId), { achievementsList });
    }
  } catch (err) {
    console.error("Error checking achievements:", err);
  }
}

const TaskManager = () => {
  const { currentUser } = useAuth();
  const { subjects, addSubject } = useSubjects();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  // NEW: State for Flashcard Modal
  const [selectedTaskForCards, setSelectedTaskForCards] = useState(null);

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: '',
    description: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [listenerFailed, setListenerFailed] = useState(false);

  // Load tasks
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }

    const tasksQuery = query(
      collection(db, 'tasks'), 
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading tasks:', error);
      setListenerFailed(true);
      setLoading(false);
      
      if (error.code === 'failed-precondition') {
        const simpleQuery = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
        const simpleUnsubscribe = onSnapshot(simpleQuery, (simpleSnapshot) => {
          const simpleTasksData = simpleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
          setTasks(simpleTasksData);
          setLoading(false);
        });
        return () => simpleUnsubscribe();
      } else {
        loadTasksManually();
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = async () => {
    if (!currentUser || !currentUser.uid) {
      alert('Please log in to add tasks.');
      return;
    }
    
    if (!newTask.title || !newTask.subject || !newTask.dueDate) {
      alert('Please fill in all required fields (Title, Subject, and Due Date).');
      return;
    }
    
    try {
      const dueDate = new Date(newTask.dueDate);
      
      const taskData = {
        title: newTask.title.trim(),
        subject: newTask.subject,
        priority: newTask.priority,
        dueDate: dueDate,
        description: newTask.description.trim(),
        userId: currentUser.uid,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      
      setNewTask({ title: '', subject: '', priority: 'medium', dueDate: '', description: '' });
      setShowAddForm(false);
      
      if (currentUser && currentUser.uid) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        await updateDoc(doc(db, 'users', currentUser.uid), {
          totalTasks: (userData?.totalTasks || 0) + 1
        });
      }
      alert('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      alert(`Failed to add task: ${error.message}`);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { 
        status, 
        updatedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : null
      });
      
      if (currentUser && currentUser.uid) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        const currentPoints = userData?.points || 0;
        let pointsToAdd = 0;
        let completedTasks = userData?.completedTasks || 0;
        
        const task = tasks.find(t => t.id === id);
        const wasCompleted = task && task.status === 'completed';
        
        if (status === 'completed' && !wasCompleted) {
          completedTasks += 1;
          pointsToAdd = 50;
        } else if (wasCompleted && status !== 'completed') {
          completedTasks = Math.max(0, completedTasks - 1);
        } else if (status === 'in-progress' && !wasCompleted) {
          pointsToAdd = 10;
        }

        if (pointsToAdd > 0 || completedTasks !== (userData?.completedTasks || 0)) {
           await updateDoc(doc(db, 'users', currentUser.uid), {
             points: currentPoints + pointsToAdd,
             completedTasks: completedTasks
           });
        }
      }
      await checkAndAwardTaskAchievements(currentUser.uid, tasks.map(task => task.id === id ? { ...task, status } : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      await updateDoc(doc(db, 'users', currentUser.uid), {
        totalTasks: Math.max(0, (userData?.totalTasks || 1) - 1)
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const loadTasksManually = async () => {
    if (!currentUser) return;
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setTasks(tasksData);
      setLoading(false);
    } catch (error) {
      console.error('Manual load failed:', error);
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (newSubject.trim()) {
      const success = await addSubject(newSubject);
      if (success) {
        setNewSubject('');
        setShowAddSubject(false);
        alert(`Subject "${newSubject.trim()}" added successfully!`);
      } else {
        alert('Failed to add subject.');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    return task.status === activeFilter;
  });

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Manager</h1>
          <p className="text-gray-600">Organize and track your study tasks</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <div className="flex space-x-2">
                <select
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddSubject(!showAddSubject)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  +
                </button>
              </div>
              {showAddSubject && (
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter new subject name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  />
                  <button onClick={handleAddSubject} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">Add</button>
                  <button onClick={() => { setShowAddSubject(false); setNewSubject(''); }} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">Cancel</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter task description"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button onClick={addTask} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">Add Task</button>
          </div>
        </div>
      )}

      {/* Task Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          {['all', 'pending', 'in-progress', 'completed'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeFilter === filter ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {filter} ({filter === 'all' ? tasks.length : tasks.filter(t => t.status === filter).length})
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{task.subject}</p>
                {task.description && (
                  <p className="text-gray-700 mb-3">{task.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 Due: {(() => { try { return (task.dueDate && (task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate))).toLocaleDateString(); } catch { return 'Invalid date'; } })()}</span>
                  <span>📚 {task.subject}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {/* NEW: Flashcard Generator Button */}
                <button
                  onClick={() => setSelectedTaskForCards(task)}
                  className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full transition-colors"
                  title="Generate Flashcards"
                >
                  <span className="text-xl">✨</span>
                </button>

                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeFilter === 'all' ? 'No tasks yet' : `No ${activeFilter} tasks`}
          </h3>
          <p className="text-gray-600">
            {activeFilter === 'all' 
              ? 'Create your first task to get started!'
              : `No tasks are currently ${activeFilter}.`
            }
          </p>
          {listenerFailed && (
            <div className="mt-4">
              <button
                onClick={loadTasksManually}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Refresh Tasks
              </button>
            </div>
          )}
        </div>
      )}

      {/* NEW: Render Flashcard Modal */}
      {selectedTaskForCards && (
        <FlashcardGenerator 
          task={selectedTaskForCards} 
          onClose={() => setSelectedTaskForCards(null)} 
        />
      )}
    </div>
  );
};

export default TaskManager;