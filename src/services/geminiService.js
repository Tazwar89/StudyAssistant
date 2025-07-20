import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'your-api-key-here');

// Create a model instance
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// System prompt for the study assistant
const SYSTEM_PROMPT = `You are an intelligent study assistant designed to help students with their academic journey. Your role is to:

1. Provide personalized study tips and strategies
2. Help with subject-specific questions and explanations
3. Offer motivation and encouragement
4. Suggest effective learning techniques
5. Help with time management and study planning
6. Answer questions about various academic topics

Guidelines:
- Be encouraging and supportive
- Provide practical, actionable advice
- Use emojis to make responses more engaging
- Keep responses concise but informative
- If you don't know something, be honest about it
- Focus on study-related topics and academic support
- Use a friendly, conversational tone

Remember: You're here to help students succeed in their studies!`;

// Chat history management
let chatHistory = [];

// Initialize chat
export const initializeChat = async () => {
  try {
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    
    // Send the system prompt as the first message to set the context
    await chat.sendMessage(SYSTEM_PROMPT);
    
    return chat;
  } catch (error) {
    console.error('Error initializing Gemini chat:', error);
    throw error;
  }
};

// Send message to Gemini
export const sendMessageToGemini = async (message, chat = null) => {
  try {
    // If no chat instance provided, create a new one
    if (!chat) {
      chat = await initializeChat();
    }

    // Send the message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
      chat: chat
    };
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    
    // Fallback response if API fails
    const fallbackResponses = [
      "I'm having trouble connecting right now, but I'm here to help! Try asking me about study tips, time management, or any subject you're working on.",
      "Sorry, I'm experiencing some technical difficulties. In the meantime, here are some general study tips: take regular breaks, stay organized, and practice active recall!",
      "I'm temporarily unavailable, but don't worry! You can still use the quick reply buttons for instant study advice."
    ];
    
    return {
      success: false,
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      error: error.message
    };
  }
};

// Get study-specific suggestions
export const getStudySuggestions = async (topic) => {
  try {
    const prompt = `Provide 3-5 specific study tips for ${topic}. Make them practical and actionable. Use emojis and keep each tip concise.`;
    const result = await sendMessageToGemini(prompt);
    return result;
  } catch (error) {
    console.error('Error getting study suggestions:', error);
    return {
      success: false,
      response: "I'm having trouble providing specific tips right now, but I'm here to help with general study advice!"
    };
  }
};

// Check if API key is configured
export const isApiKeyConfigured = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return apiKey && 
         apiKey !== 'your-api-key-here' &&
         apiKey.length > 0;
};



 