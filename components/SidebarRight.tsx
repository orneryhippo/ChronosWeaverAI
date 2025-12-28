
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, GameState } from '../types';
import { chatWithCompanion } from '../services/geminiService';

interface SidebarRightProps {
  gameState: GameState;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ gameState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const storyContext = `Story: ${gameState.storyText}. Quest: ${gameState.currentQuest}. Inventory: ${gameState.inventory.join(', ')}`;
      const reply = await chatWithCompanion(userMsg, messages, storyContext);
      setMessages(prev => [...prev, { role: 'assistant', content: reply || "I seem to have lost my train of thought..." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred in the magical ether." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full md:w-80 bg-slate-900/50 backdrop-blur-md border-l border-slate-800 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/80">
        <h2 className="text-sm font-cinzel text-slate-300 flex items-center gap-2">
          <span className="text-indigo-500">✦</span> The Chronicler
        </h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-slate-600 text-xs mt-4 italic">Ask me anything about your journey...</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-2 flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/80 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Whisper to the chronicler..."
            className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-indigo-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarRight;
