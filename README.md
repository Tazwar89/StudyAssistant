# StudyAssistant - AI-Powered Study Management Platform

A comprehensive web application designed to help students manage their study sessions, track progress, and get AI-powered assistance for effective learning.

## 🚀 Live Demo

[Add your live demo link here]

## ✨ Features

### 📊 **Dashboard & Analytics**
- **Real-time Statistics**: View tasks completed, total study time, and current streak
- **Study Streak Tracking**: Monitor consecutive study days and longest streak
- **Points System**: Earn points for completed tasks and study sessions
- **Progress Visualization**: Clean, modern interface showing your study progress
- **Recent Activity**: Track your latest study sessions and task completions

### ⏱️ **Study Timer**
- **Pomodoro Technique**: 25-minute focused study sessions with 5-minute breaks
- **Custom Timer**: Set custom study durations
- **Subject Tracking**: Organize study time by different subjects
- **Session Management**: Track individual study sessions and total time
- **Real-time Updates**: Live timer with pause/resume functionality
- **Study Time by Subject**: Visual breakdown of time spent on each subject

### 📝 **Task Management**
- **Create & Organize**: Add tasks with titles, descriptions, and due dates
- **Priority Levels**: Mark tasks as high, medium, or low priority
- **Status Tracking**: Mark tasks as pending, in progress, or completed
- **Points Rewards**: Earn points for completing tasks
- **Due Date Management**: Never miss important deadlines

### 🤖 **AI Study Assistant**
- **Intelligent Chatbot**: Powered by Google Gemini AI
- **Personalized Help**: Get study tips, subject explanations, and motivation
- **Quick Replies**: Pre-built responses for common study questions
- **Expandable Interface**: Full-screen chat mode for detailed conversations
- **Real-time Responses**: Instant AI assistance for your study needs

### 🔐 **User Authentication**
- **Secure Login**: Email/password authentication with Firebase
- **User Profiles**: Personalized experience with saved data
- **Data Persistence**: All progress saved to cloud database
- **Session Management**: Automatic login state management

## 🛠️ Tech Stack

### **Frontend**
- **React 18**: Modern UI framework with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Client-side routing and navigation

### **Backend & Database**
- **Firebase Authentication**: Secure user authentication
- **Firestore**: NoSQL cloud database for data persistence
- **Real-time Listeners**: Live data synchronization across devices

### **AI Integration**
- **Google Gemini AI**: Advanced AI model for study assistance
- **Custom Prompts**: Tailored responses for educational content
- **Error Handling**: Graceful fallbacks when AI is unavailable

### **Development Tools**
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization
- **Git**: Version control and collaboration

## 📱 User Interface

### **Modern Design**
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Minimalist design focused on productivity
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Intuitive Navigation**: Easy-to-use navigation between features

### **Interactive Elements**
- **Real-time Updates**: Live data without page refreshes
- **Smooth Animations**: Polished user experience
- **Loading States**: Clear feedback during operations
- **Error Handling**: User-friendly error messages

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project setup
- Google Gemini AI API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/StudyAssistant.git
   cd StudyAssistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Firebase Configuration**
   - Create a Firebase project
   - Enable Authentication with Email/Password
   - Create a Firestore database
   - Set up security rules for your use case
5. **Add your Firebase config to environment variables**

### **Gemini AI Setup**
1. Get API key from Google AI Studio
2. Add to environment variables
3. Configure service for optimal responses

## 📁 Project Structure

```
StudyAssistant/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── StudyTimer.jsx   # Timer functionality
│   │   ├── TaskManager.jsx  # Task management
│   │   ├── Chatbot.jsx      # AI assistant
│   │   ├── Navigation.jsx   # Navigation bar
│   │   └── Profile.jsx      # User profile
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication context
│   ├── config/              # Configuration files
│   │   └── firebase.js      # Firebase setup
│   ├── services/            # External services
│   │   └── geminiService.js # AI service integration
│   └── assets/              # Static assets
├── public/                  # Public assets
├── dist/                    # Build output
└── docs/                    # Documentation
```

## 🔧 Configuration

### **Firebase Setup**
1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Create a Firestore database
4. Set up security rules for your use case
5. Add your Firebase config to environment variables

### **Gemini AI Setup**
1. Get API key from Google AI Studio
2. Add to environment variables
3. Configure service for optimal responses

## 📊 Data Models

### **User Profile**
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  points: number,
  totalStudyTime: number,
  sessions: number,
  streakData: {
    currentStreak: number,
    longestStreak: number,
    lastStudyDate: string
  },
  subjectStudyTime: object,
  createdAt: timestamp
}
```

### **Tasks**
```javascript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  priority: 'high' | 'medium' | 'low',
  status: 'pending' | 'in-progress' | 'completed',
  dueDate: timestamp,
  points: number,
  createdAt: timestamp
}
```

## 🎯 Key Features Explained

### **Study Streak System**
- Tracks consecutive days of study activity
- Updates automatically when timer is used
- Persists across sessions and devices
- Shows both current and longest streaks

### **Points System**
- Earn points for completing tasks
- Points persist across sessions
- Visual feedback for achievements
- Motivates consistent study habits

### **AI Integration**
- Context-aware responses
- Study-specific guidance
- Fallback responses when AI is unavailable
- Quick reply system for common questions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent study assistance
- **Firebase** for robust backend services
- **React Team** for the amazing framework
- **Tailwind CSS** for beautiful styling utilities

## 📞 Support

For support, email support@studyassistant.com or create an issue in this repository.

---

**Built with ❤️ for students everywhere**
