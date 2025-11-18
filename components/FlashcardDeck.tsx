import React, { useState } from 'react';
import { Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import { Sparkles, RotateCw, Check, X, Layers } from 'lucide-react';

const FlashcardDeck: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'create' | 'study'>('create');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    setLoading(true);
    const newCards = await generateFlashcards(topic);
    setCards(newCards);
    setLoading(false);
    if (newCards.length > 0) {
        setMode('study');
        setCurrentIndex(0);
        setIsFlipped(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex(c => c + 1), 150);
    } else {
        alert("Deck completed! Great job.");
        setMode('create');
        setTopic('');
    }
  };

  if (mode === 'create') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
              <div className="bg-lavender-100 p-4 rounded-full mb-6">
                  <Layers size={48} className="text-lavender-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Flashcards</h2>
              <p className="text-center text-gray-500 mb-8 text-sm">Enter a topic, and I'll generate cards to test your knowledge.</p>
              
              <form onSubmit={handleGenerate} className="w-full max-w-xs space-y-4">
                  <input 
                      type="text" 
                      placeholder="e.g. Photosynthesis, Calculus Limits..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-lavender-400 outline-none text-center"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                  />
                  <button 
                      type="submit" 
                      disabled={loading || !topic}
                      className="w-full bg-lavender-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-lavender-700 transition-colors"
                  >
                      {loading ? (
                          <span className="animate-pulse">Generating...</span>
                      ) : (
                          <>Generate <Sparkles size={18} /></>
                      )}
                  </button>
              </form>
          </div>
      );
  }

  // Study Mode
  return (
      <div className="flex flex-col items-center py-8 h-full">
          <div className="flex justify-between w-full items-center mb-6 px-2">
            <button onClick={() => setMode('create')} className="text-xs text-gray-400 hover:text-gray-600">← New Deck</button>
            <span className="text-xs font-bold text-lavender-600 uppercase tracking-widest">Card {currentIndex + 1}/{cards.length}</span>
            <div className="w-10"></div> {/* Spacer */}
          </div>

          <div 
            className="relative w-full max-w-sm aspect-[4/5] perspective-1000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
              <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-2 border-white flex flex-col items-center justify-center p-8 text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold">Question</p>
                      <h3 className="text-xl font-medium text-gray-800 leading-relaxed">{cards[currentIndex].front}</h3>
                      <p className="absolute bottom-6 text-xs text-gray-400 flex items-center gap-1">
                        <RotateCw size={12} /> Tap to flip
                      </p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-lavender-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white">
                      <p className="text-xs text-lavender-200 uppercase tracking-wider mb-4 font-semibold">Answer</p>
                      <h3 className="text-lg leading-relaxed">{cards[currentIndex].back}</h3>
                  </div>
              </div>
          </div>

          <div className="flex gap-4 mt-8">
              <button 
                onClick={nextCard} 
                className="w-14 h-14 rounded-full bg-white border border-red-100 text-red-400 flex items-center justify-center shadow-sm hover:bg-red-50"
                title="Needs review"
              >
                  <X size={24} />
              </button>
              <button 
                onClick={nextCard} 
                className="w-14 h-14 rounded-full bg-white border border-green-100 text-green-500 flex items-center justify-center shadow-sm hover:bg-green-50"
                title="Got it!"
              >
                  <Check size={24} />
              </button>
          </div>
          
          <style>{`
            .perspective-1000 { perspective: 1000px; }
            .transform-style-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
          `}</style>
      </div>
  );
};

export default FlashcardDeck;