# Google Gemini API Setup Guide

## 🚀 **Getting Started with Gemini AI**

To enable the sophisticated AI chatbot features, you need to set up Google Gemini API.

### **Step 1: Get Your API Key**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key (it starts with `AIza...`)

### **Step 2: Configure Environment Variables**

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your API key:

```bash
# .env file
VITE_GEMINI_API_KEY=your-actual-api-key-here
```

**Important**: Replace `your-actual-api-key-here` with your real API key from Step 1.

### **Step 3: Restart Development Server**

After adding the API key, restart your development server:

```bash
npm run dev
```

### **Step 4: Test the Chatbot**

1. Go to the **Chatbot** page in your app
2. Try asking questions like:
   - "How can I improve my focus?"
   - "Give me study tips for math"
   - "Help me create a study schedule"
   - "What's the best way to memorize?"
   - "How do I stay motivated?"

### **🔧 API Key Security**

- **Never commit your API key** to version control
- The `.env` file should be in your `.gitignore`
- Your API key is only used on the client side for this demo
- For production, consider using a backend proxy

### **💰 Pricing**

- Google Gemini API offers **free tier** with generous limits
- Check [Google AI Studio pricing](https://ai.google.dev/pricing) for current rates
- The free tier is usually sufficient for personal use

### **🛠️ Troubleshooting**

**If the chatbot gives generic responses:**
1. Check that your API key is correctly set in `.env`
2. Verify the API key is valid in Google AI Studio
3. Check browser console for any error messages
4. Restart the development server

**If you get API errors:**
1. Check your API key format (should start with `AIza`)
2. Verify you have sufficient quota in Google AI Studio
3. Check if the API is enabled for your project

### **🎯 Features Enabled**

With Gemini API configured, your chatbot will:
- ✅ Provide intelligent, contextual responses
- ✅ Give personalized study advice
- ✅ Answer subject-specific questions
- ✅ Offer motivation and encouragement
- ✅ Suggest effective learning techniques
- ✅ Help with time management
- ✅ Maintain conversation context

### **📱 Fallback Mode**

If the API is not configured or fails, the chatbot will:
- Use predefined responses for common questions
- Show helpful error messages
- Continue to work with quick reply buttons
- Provide basic study tips

---

**Need Help?** Check the browser console for detailed error messages or refer to the [Google AI documentation](https://ai.google.dev/docs). 