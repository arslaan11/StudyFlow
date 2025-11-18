import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { solveDoubt } from '../services/geminiService';
import { Send, Image as ImageIcon, X, Camera } from 'lucide-react';

const DoubtSolver: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'Hello! I am your AI tutor. Stuck on a problem? Send me text or an image of the question!', timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: inputText,
      imageUri: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setLoading(true);

    const responseText = await solveDoubt(userMsg.text, userMsg.imageUri);

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-lavender-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
            }`}>
              {msg.imageUri && (
                <img src={msg.imageUri} alt="User upload" className="w-full h-auto rounded-lg mb-2 border border-white/20" />
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        {selectedImage && (
            <div className="mb-2 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-lavender-200" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
            </div>
        )}
        
        <div className="flex items-center gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageSelect}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-lavender-600 bg-gray-50 rounded-full"
            >
                <Camera size={20} />
            </button>
            
            <input 
                type="text" 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender-300"
                placeholder="Ask a doubt..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            
            <button 
                onClick={handleSend}
                disabled={loading || (!inputText && !selectedImage)}
                className="p-2 bg-lavender-600 text-white rounded-full hover:bg-lavender-700 disabled:opacity-50 transition-colors"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolver;