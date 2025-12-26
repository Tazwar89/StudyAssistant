import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI Client
const genAI = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'your-api-key-here' 
});

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

// Initialize chat
export const initializeChat = async () => {
  try {
    // In the new SDK, we create a chat session directly from the client
    const chat = await genAI.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        systemInstruction: SYSTEM_PROMPT, // System prompt is now a config option
      },
    });
    
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

    // Send the message using the new SDK syntax
    // The method takes an object with a 'message' property
    const result = await chat.sendMessage({
      message: message
    });

    // In the new SDK, result.text is a getter for the text content
    const text = result.text;

    return {
      success: true,
      response: text,
      chat: chat
    };
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    
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

// Helper to convert file to Base64 for the API
export const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// MULTIMODAL Flashcard Generation
export const generateFlashcards = async (topicOrPrompt, file = null, count = 5) => {
  try {
    let contents = [
      { text: `You are a teacher. Create ${count} study flashcards based strictly on the provided content. 
        Return ONLY a raw JSON array of objects. 
        Each object must have exactly two fields: "front" (question) and "back" (answer).
        Example: [{"front": "Question?", "back": "Answer"}]` 
      }
    ];

    // If a file is provided (Image/PDF), add it to the request
    if (file) {
      const filePart = await fileToGenerativePart(file);
      contents.push(filePart);
      contents.push({ text: `Generate flashcards from this image/document. Focus on the key concepts shown.` });
    } 
    // Otherwise, generate from the text topic
    else {
      contents.push({ text: `Topic: "${topicOrPrompt}"` });
    }

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview", // Using the latest Preview model
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(result.text);

  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [];
  }
};

// Get study-specific suggestions
export const getStudySuggestions = async (topic) => {
  try {
    const prompt = `Provide 3-5 specific study tips for ${topic}. Make them practical and actionable. Use emojis and keep each tip concise.`;
    
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return {
      success: true,
      response: result.text
    };
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