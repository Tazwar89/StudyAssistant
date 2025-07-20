# Firebase Setup Guide - Fix Permission Denied Error

## 🚨 **Problem**
You're getting "Permission denied. Please check your Firebase rules." when trying to add tasks.

## 🔧 **Solution: Update Firebase Firestore Rules**

### **Step 1: Access Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hackthe6ix-ab103`
3. In the left sidebar, click **"Firestore Database"**
4. Click on the **"Rules"** tab

### **Step 2: Update the Rules**
Replace the current rules with one of these options:

#### **Option A: Secure Rules (Recommended for Production)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### **Option B: Development Rules (For Testing)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT RULES - ALLOW ALL AUTHENTICATED ACCESS
    // WARNING: These rules are for development/testing only!
    // DO NOT use in production!
    
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Step 3: Publish the Rules**
1. Click **"Publish"** to save the new rules
2. Wait for the rules to deploy (usually takes a few seconds)

## 🧪 **Test the Fix**

### **Step 1: Use the Test Page**
1. Go to your app: `http://localhost:5173`
2. Navigate to **"Test"** in the navigation
3. Click **"Run Firebase Test"**
4. Check the result - should show "✅ All Firebase tests passed!"

### **Step 2: Test Task Creation**
1. Go to **"Tasks"** page
2. Click **"Add Task"**
3. Fill in the form:
   - **Title**: "Test Task"
   - **Subject**: "Mathematics"
   - **Priority**: "Medium"
   - **Due Date**: Today's date
   - **Description**: "Test description"
4. Click **"Add Task"**
5. Should show "Task added successfully!"

## 🔍 **Troubleshooting**

### **If Still Getting Permission Denied:**
1. **Check Authentication**: Make sure you're logged in
2. **Wait for Rules**: Rules can take up to 1 minute to deploy
3. **Clear Browser Cache**: Try refreshing the page
4. **Check Console**: Look for specific error messages

### **Common Issues:**
- **Rules not published**: Make sure to click "Publish" in Firebase Console
- **Wrong project**: Ensure you're in the correct Firebase project
- **Authentication issues**: Try logging out and back in

## 📋 **What These Rules Do**

### **Secure Rules (Option A):**
- ✅ **Users can only access their own data**
- ✅ **Tasks are tied to user IDs**
- ✅ **Prevents unauthorized access**
- ✅ **Production-ready security**

### **Development Rules (Option B):**
- ✅ **Allows all authenticated users to read/write**
- ✅ **Easier for testing and development**
- ❌ **Not secure for production**
- ❌ **Should only be used for testing**

## 🚀 **Next Steps**

1. **Update the rules** in Firebase Console
2. **Test the application** using the Test page
3. **Try adding a task** to verify the fix
4. **Check timer data persistence** after the fix

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for detailed error messages
2. Verify you're in the correct Firebase project
3. Make sure the rules are published successfully
4. Try the development rules first for testing

---

**Note**: The files `firestore.rules` and `firestore.rules.development` in this project contain the rule templates. Copy the content from these files to your Firebase Console. 