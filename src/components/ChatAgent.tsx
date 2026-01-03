import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export const ChatAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert history to Gemini format (excluding the very last user message for now, or just send full history if endpoint handles it)
      // The backend uses `history` which Gemini `startChat` expects. 
      // Gemini expects history to be previous turns. 
      // We will send current history (excluding the new message) effectively, or let the backend start a new chat each time with full context?
      // Actually, my backend implementation uses `startChat({ history })`. 
      // So I should pass the *previous* messages as history.
      const history = messages; 

      const { response } = await api.post('/agent/chat', { 
        message: userMsg.parts[0].text,
        history 
      });

      const botMsg: Message = { role: 'model', parts: [{ text: response }] };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = { role: 'model', parts: [{ text: "I'm having trouble connecting right now. Please try again later." }] };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Redesigned Minimalist FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-2xl glass border border-zinc-800 shadow-2xl items-center justify-center z-40 transition-all hover:border-blue-500/50 group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="text-zinc-400 group-hover:text-blue-500 transition-colors" size={20} />
      </motion.button>

      {/* Compact Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
            className="fixed bottom-6 right-6 w-[320px] h-[480px] bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/30 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight">Finly AI</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-zinc-500 font-medium">Assistant</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-6">
                   <div className="p-3 rounded-2xl bg-zinc-900/50 text-zinc-600">
                     <Bot size={24} />
                   </div>
                   <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                     Ask me anything about your crypto portfolio or market trends.
                   </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`
                      max-w-[85%] px-3 py-2.5 rounded-2xl text-[12px] leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'}
                    `}
                  >
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-2xl rounded-tl-none">
                      <Loader2 size={12} className="animate-spin text-zinc-500" />
                    </div>
                 </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-zinc-950/50 border-t border-zinc-900">
              <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 focus-within:border-blue-500/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none text-[12px] focus:ring-0 text-white placeholder-zinc-600"
                  autoFocus
                />
                <button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  className="p-1.5 rounded-lg text-blue-500 hover:text-blue-400 disabled:text-zinc-700 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
