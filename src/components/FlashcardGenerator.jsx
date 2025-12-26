import { useState, useRef } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

const FlashcardGenerator = ({ task, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [saved, setSaved] = useState(false);
  
  // Input States
  const [topic, setTopic] = useState(task ? `${task.title} - ${task.description}` : '');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setTopic(''); // Clear text topic if file is selected to avoid confusion
    }
  };

  const handleGenerate = async () => {
    if (!topic && !selectedFile) return;
    
    setLoading(true);
    try {
      // Pass both topic (text) and selectedFile (image/pdf)
      const result = await generateFlashcards(topic, selectedFile, 5);
      setCards(result);
    } catch (error) {
      console.error(error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeck = async () => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'flashcardDecks'), {
        userId: currentUser.uid,
        title: selectedFile ? `Notes on ${selectedFile.name}` : topic.slice(0, 30) + "...",
        createdAt: new Date(),
        cardCount: cards.length,
        sourceTask: task ? task.id : null,
        cards: cards
      });
      setSaved(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      alert("Error saving deck");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            ✨ AI Study Companion
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {!cards.length ? (
          <div className="space-y-6">
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                selectedFile ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              
              {selectedFile ? (
                <div className="text-purple-700">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="font-semibold">{selectedFile.name}</p>
                  <p className="text-sm opacity-75">Click to change file</p>
                </div>
              ) : (
                <div className="text-gray-500 cursor-pointer">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="font-medium">Upload Notes or Textbook Page</p>
                  <p className="text-sm mt-1">Supports Images & PDF</p>
                </div>
              )}
            </div>

            <div className="text-center text-gray-400 text-sm font-medium">- OR -</div>

            {/* Text Input Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Topic Manually</label>
              <textarea 
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows="3"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setSelectedFile(null); // Clear file if typing text
                }}
                placeholder="e.g., The French Revolution, Quantum Mechanics..."
                disabled={!!selectedFile}
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || (!topic && !selectedFile)}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analyzing Content...
                </span>
              ) : "✨ Generate Flashcards"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {cards.map((card, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Question</div>
                  <p className="font-medium text-gray-900 mb-4">{card.front}</p>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Answer</div>
                    <p className="text-gray-700">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => { setCards([]); setTopic(''); setSelectedFile(null); }}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
              <button 
                onClick={handleSaveDeck}
                disabled={saved}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-bold shadow-md transition-all ${
                  saved ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-900 hover:bg-black'
                }`}
              >
                {saved ? "Saved to Library! ✅" : "Save Deck 💾"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardGenerator;