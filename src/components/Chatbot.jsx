import { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini, initializeChat, isApiKeyConfigured } from '../services/geminiService';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI study assistant. I can help you with study tips, answer questions, and provide guidance. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatInstance, setChatInstance] = useState(null);
  

  const messagesEndRef = useRef(null);
  const expandedMessagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollExpandedToBottom = () => {
    expandedMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isExpanded) {
      scrollExpandedToBottom();
    }
  }, [messages, isExpanded]);

  // Initialize Gemini chat when component mounts
  useEffect(() => {
    const initChat = async () => {
      if (isApiKeyConfigured()) {
        try {
          const chat = await initializeChat();
          setChatInstance(chat);
        } catch (error) {
          console.error('Failed to initialize Gemini chat:', error);
          // Don't set chatInstance to null, let sendMessageToGemini handle it
        }
      }
    };

    initChat();
  }, []);

  const quickReplies = [
    "How can I improve my focus?",
    "Give me study tips for math",
    "Help me create a study schedule",
    "What's the best way to memorize?",
    "How do I stay motivated?"
  ];

  const botResponses = {
    "how can i improve my focus": "Here are some tips to improve your focus:\n\n1. 🎯 Use the Pomodoro Technique (25 min work, 5 min break)\n2. 📱 Eliminate distractions - put your phone away\n3. 🌿 Create a dedicated study environment\n4. 🧘 Practice mindfulness and deep breathing\n5. 💧 Stay hydrated and take regular breaks\n6. 🎵 Use background music (classical or lo-fi)\n7. 📝 Break tasks into smaller, manageable chunks",
    
    "give me study tips for math": "Here are effective math study tips:\n\n1. 📚 Practice regularly - math is a skill that improves with practice\n2. ✏️ Work through problems step by step\n3. 📖 Read the textbook before class\n4. 🎯 Focus on understanding concepts, not just memorizing\n5. 📝 Take detailed notes and create formula sheets\n6. 🤝 Form study groups to explain concepts to others\n7. 🔍 Review mistakes and understand why you made them\n8. ⏰ Use spaced repetition for formulas and concepts",
    
    "help me create a study schedule": "Here's how to create an effective study schedule:\n\n1. 📅 Start with your fixed commitments (classes, work)\n2. ⏰ Block out 2-3 hour study sessions\n3. 🎯 Schedule your most challenging subjects during peak energy times\n4. ☕ Include short breaks (5-10 minutes) every hour\n5. 🏃‍♂️ Plan longer breaks for meals and exercise\n6. 📚 Review and adjust your schedule weekly\n7. 🎯 Set specific goals for each study session\n8. 📱 Use apps or planners to track your progress",
    
    "what's the best way to memorize": "Here are proven memorization techniques:\n\n1. 🧠 Active Recall - test yourself instead of just re-reading\n2. 📝 Spaced Repetition - review material at increasing intervals\n3. 🎨 Visual Learning - create mind maps and diagrams\n4. 🎵 Mnemonics - use acronyms and rhymes\n5. 📖 Teach Others - explaining helps you understand better\n6. 🏃‍♂️ Physical Movement - walk while studying\n7. 🎯 Chunking - break information into smaller groups\n8. 💤 Get enough sleep - memory consolidation happens during sleep",
    
    "how do i stay motivated": "Here are ways to stay motivated while studying:\n\n1. 🎯 Set clear, achievable goals\n2. 📊 Track your progress and celebrate small wins\n3. 🏆 Use rewards - treat yourself after completing tasks\n4. 👥 Study with friends or join study groups\n5. 📱 Remove distractions and create a focused environment\n6. 🎵 Listen to motivating music or podcasts\n7. 📝 Visualize your success and future goals\n8. 💪 Remember your 'why' - why are you studying this?\n9. 🏃‍♂️ Take care of your physical health (sleep, exercise, nutrition)\n10. 🔄 Mix up your study methods to avoid boredom"
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let response;
      
      // Try to use Gemini API if available
      if (isApiKeyConfigured()) {
        const result = await sendMessageToGemini(text, chatInstance);
        
        if (result.success) {
          response = result.response;
          setChatInstance(result.chat); // Update chat instance
        } else {
          response = getFallbackResponse(text);
        }
      } else {
        response = getFallbackResponse(text);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again or use the quick reply buttons for instant help!",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Fallback response function
  const getFallbackResponse = (text) => {
    const lowerText = text.toLowerCase();
    let response = "I'm here to help with your studies! Try asking me about study tips, creating schedules, improving focus, or memorization techniques.";

    // Check for matching responses
    for (const [key, value] of Object.entries(botResponses)) {
      if (lowerText.includes(key)) {
        response = value;
        break;
      }
    }

    return response;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    return timestamp.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Chat Messages Component
  const ChatMessages = ({ isExpanded }) => (
    <div className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? 'h-96' : 'h-64'}`}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-line text-sm">{message.text}</div>
            <div className={`text-xs mt-2 ${
              message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {isExpanded ? formatDate(message.timestamp) : formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Study Assistant</h1>
        <p className="text-gray-600">Get personalized study help and guidance</p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-md flex flex-col">
        {/* Chat Header with Expand Button */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">Study Assistant</span>
            <span className="text-sm text-gray-500">• {messages.length} messages</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors flex items-center space-x-1"
          >
            <span>{isExpanded ? '📱' : '🖥️'}</span>
            <span>{isExpanded ? 'Compact' : 'Expand'}</span>
          </button>
        </div>

        {/* Messages Area */}
        <ChatMessages isExpanded={isExpanded} />

        {/* Quick Replies */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => sendMessage(reply)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              ➤
            </button>
          </form>
        </div>
      </div>

      {/* Expanded Chat Window */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
            {/* Expanded Header */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Study Assistant Chat</h2>
                  <p className="text-sm text-gray-500">Full conversation history</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Expanded Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 max-w-5xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl px-6 py-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-line text-base leading-relaxed">{message.text}</div>
                      <div className={`text-sm mt-3 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-6 py-4 rounded-2xl">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={expandedMessagesEndRef} />
              </div>
            </div>

            {/* Expanded Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap gap-3 mb-4">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(reply)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default Chatbot;