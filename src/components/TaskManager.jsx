import { useState, useEffect } from 'react';

const TaskManager = () => {
  // Load tasks from localStorage on component mount
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('studyAssistantTasks');
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    // Default tasks if no saved data
    return [
      { id: 1, title: 'Complete Math Assignment', subject: 'Mathematics', priority: 'high', dueDate: '2024-01-25', status: 'pending', description: 'Finish calculus problems 1-20' },
      { id: 2, title: 'Physics Lab Report', subject: 'Physics', priority: 'high', dueDate: '2024-01-26', status: 'in-progress', description: 'Write lab report for pendulum experiment' },
      { id: 3, title: 'Literature Essay', subject: 'English', priority: 'medium', dueDate: '2024-01-28', status: 'pending', description: 'Essay on Shakespeare\'s Hamlet' },
      { id: 4, title: 'Programming Project', subject: 'Computer Science', priority: 'low', dueDate: '2024-01-30', status: 'completed', description: 'Build a simple calculator app' }
    ];
  });

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: '',
    description: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('studyAssistantTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.title && newTask.subject && newTask.dueDate) {
      const task = {
        id: Date.now(),
        ...newTask,
        status: 'pending'
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', subject: '', priority: 'medium', dueDate: '', description: '' });
      setShowAddForm(false);
    }
  };

  const updateTaskStatus = (id, status) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
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

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    switch (activeFilter) {
      case 'all':
        return true;
      case 'pending':
        return task.status === 'pending';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

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
              <input
                type="text"
                value={newTask.subject}
                onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subject"
              />
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
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {/* Task Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button 
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'pending' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Pending ({tasks.filter(task => task.status === 'pending').length})
          </button>
          <button 
            onClick={() => setActiveFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'in-progress' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            In Progress ({tasks.filter(task => task.status === 'in-progress').length})
          </button>
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'completed' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Completed ({tasks.filter(task => task.status === 'completed').length})
          </button>
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
                  <span>📅 Due: {task.dueDate}</span>
                  <span>📚 {task.subject}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
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
                  className="text-red-600 hover:text-red-800 transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default TaskManager; 