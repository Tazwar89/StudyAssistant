# StudyAI - AI-Powered Study Assistant

A comprehensive, AI-driven study assistant that helps students optimize their study sessions with intelligent task scheduling, interactive chatbots, and gamified productivity features.

## 🚀 Features

### 📊 Interactive Dashboard
- **Progress Tracking**: Visualize your study progress with charts and statistics
- **Task Overview**: See upcoming deadlines and recent activity at a glance
- **Study Analytics**: Track study hours, completed tasks, and productivity trends
- **Real-time Updates**: Live progress updates and achievement notifications

### 📝 Intelligent Task Management
- **Smart Scheduling**: AI-powered task scheduling based on deadlines and difficulty
- **Priority Management**: Organize tasks by priority, subject, and difficulty level
- **Progress Tracking**: Monitor task completion and time estimates
- **Filtering & Sorting**: Find tasks quickly with advanced filtering options

### ⏰ Study Timer (Pomodoro Technique)
- **Customizable Sessions**: Adjust work time, break duration, and session count
- **Visual Progress**: Beautiful circular progress indicator
- **Session Tracking**: Monitor completed sessions and streaks
- **Sound Notifications**: Audio alerts for session completion
- **Study Tips**: Built-in guidance for effective study sessions

### 🤖 AI-Powered Chatbot
- **Subject Explanations**: Get clear explanations of complex topics
- **Problem Solving**: Step-by-step solutions for math and science
- **Study Strategies**: Personalized learning techniques and tips
- **Quick Actions**: Pre-built responses for common study topics
- **Real-time Assistance**: Instant help with homework and concepts

### 🏆 Gamified Productivity
- **Achievement System**: Earn badges and rewards for completing goals
- **Level Progression**: Level up based on study time and task completion
- **Streak Tracking**: Maintain study streaks for motivation
- **Points System**: Earn points for various study activities

### 👤 User Profile & Analytics
- **Progress Overview**: Comprehensive view of study statistics
- **Achievement Gallery**: Track earned and available achievements
- **Study History**: Detailed logs of study sessions and subjects
- **Settings Management**: Customize notifications and preferences

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Vite.js** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Recharts** - Data visualization library

### Backend & AI Integration
- **Firebase** - Authentication, database, and hosting
- **Firestore** - Real-time database for user data
- **Vellum AI** - AI workflow integration (ready for implementation)
- **Google Gemini API** - Advanced AI capabilities (optional)

### Key Libraries
- **React Router** - Client-side routing
- **Lucide React** - Additional icon library
- **Headless UI** - Accessible UI components

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd study-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (Optional for full functionality)
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore
   - Update `src/config/firebase.js` with your Firebase config

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Getting Started
1. **Dashboard**: View your study progress and upcoming tasks
2. **Task Manager**: Create and organize your study tasks
3. **Study Timer**: Use the Pomodoro technique for focused study sessions
4. **AI Assistant**: Get help with subjects and study strategies
5. **Profile**: Track achievements and manage settings

### Key Features
- **Task Creation**: Add tasks with subject, priority, and difficulty
- **Timer Sessions**: Customize work/break intervals
- **AI Chat**: Ask questions about any subject
- **Progress Tracking**: Monitor your study habits and achievements

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update the configuration in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### AI Integration
The app is ready for AI integration with:
- **Vellum AI**: For chatbot functionality
- **Google Gemini**: For advanced AI features

## 📁 Project Structure

```
study-assistant/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── TaskManager.jsx  # Task management
│   │   ├── StudyTimer.jsx   # Pomodoro timer
│   │   ├── Chatbot.jsx      # AI assistant
│   │   ├── Profile.jsx      # User profile
│   │   └── Navigation.jsx   # Navigation bar
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication context
│   ├── config/              # Configuration files
│   │   └── firebase.js      # Firebase configuration
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
└── README.md               # This file
```

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Use Tailwind utility classes for component styling

### Features
- Add new subjects in `TaskManager.jsx`
- Customize timer settings in `StudyTimer.jsx`
- Extend AI responses in `Chatbot.jsx`

## 🚀 Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Other Platforms
- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions for deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the beautiful UI framework
- **Heroicons** for the icon library
- **Recharts** for data visualization
- **Firebase** for backend services

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ for students everywhere**
