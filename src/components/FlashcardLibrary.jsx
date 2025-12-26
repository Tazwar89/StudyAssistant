import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const FlashcardLibrary = () => {
  const { currentUser } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // Study Mode State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Load Decks
  useEffect(() => {
    if (!currentUser) return;

    const fetchDecks = async () => {
      try {
        const q = query(
          collection(db, 'flashcardDecks'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const decksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDecks(decksData);
      } catch (error) {
        console.error("Error fetching decks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [currentUser]);

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation(); // Prevent opening the deck when clicking delete
    if (!window.confirm('Delete this deck?')) return;
    try {
      await deleteDoc(doc(db, 'flashcardDecks', deckId));
      setDecks(decks.filter(d => d.id !== deckId));
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const openDeck = (deck) => {
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Study Navigation
  const nextCard = () => {
    if (currentCardIndex < selectedDeck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(curr => curr + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(curr => curr - 1), 150);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // STUDY MODE VIEW
  if (selectedDeck) {
    const currentCard = selectedDeck.cards[currentCardIndex];
    const progress = Math.round(((currentCardIndex + 1) / selectedDeck.cards.length) * 100);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => setSelectedDeck(null)}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center font-medium"
        >
          ← Back to Library
        </button>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{selectedDeck.title}</h2>
          <span className="text-sm font-medium text-gray-500">
            Card {currentCardIndex + 1} of {selectedDeck.cards.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* FLIP CARD AREA */}
        <div className="perspective-1000 w-full h-96 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* FRONT */}
            <div className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-100 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Question</span>
              <p className="text-2xl font-medium text-gray-800">{currentCard.front}</p>
              <p className="absolute bottom-6 text-gray-400 text-sm">Click to flip ↻</p>
            </div>

            {/* BACK */}
            <div className="absolute w-full h-full backface-hidden bg-purple-600 rounded-2xl shadow-xl rotate-y-180 flex flex-col items-center justify-center p-8 text-white">
              <span className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-4">Answer</span>
              <p className="text-2xl font-medium">{currentCard.back}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-8 px-4">
          <button 
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Previous
          </button>
          <button 
            onClick={nextCard}
            disabled={currentCardIndex === selectedDeck.cards.length - 1}
            className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white"
          >
            Next Card
          </button>
        </div>
      </div>
    );
  }

  // LIBRARY GRID VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcard Library</h1>
          <p className="text-gray-600">Review your AI-generated study decks</p>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-6xl mb-4 block">📇</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No decks yet</h3>
          <p className="text-gray-500 mb-6">Go to Task Manager and use the ✨ button to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div 
              key={deck.id} 
              onClick={() => openDeck(deck)}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 cursor-pointer transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <button 
                  onClick={(e) => handleDeleteDeck(deck.id, e)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{deck.title}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Created {deck.createdAt?.toDate ? deck.createdAt.toDate().toLocaleDateString() : 'Unknown date'}
              </p>
              <div className="flex items-center text-sm font-medium text-purple-600">
                {deck.cardCount || deck.cards?.length || 0} Cards
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→ Study Now</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* CSS for Flip Animation */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardLibrary;