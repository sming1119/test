import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, X, User, Bot, Loader2 } from 'lucide-react';
import { ChatMessage, MenuItem } from '../types';
import { getMenuRecommendation } from '../services/geminiService';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onHighlightItems: (ids: string[]) => void;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, menuItems, onHighlightItems }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '您好！我是您的智慧點餐助手。今天想吃點什麼？我可以幫您推薦辣味菜餚、清淡湯品或是搭配的飲料喔！',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await getMenuRecommendation(userMsg.text, menuItems);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        recommendedItemIds: response.recommendedIds
      };

      setMessages(prev => [...prev, aiMsg]);
      
      if (response.recommendedIds.length > 0) {
        onHighlightItems(response.recommendedIds);
      }

    } catch (err) {
      console.error(err);
      // Minimal error handling for UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-30 border border-gray-100 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-full">
            <Sparkles size={18} className="text-gold-accent" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI 美食顧問</h3>
            <p className="text-[10px] text-gray-300">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-imperial-red text-white'}
            `}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`
              max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-gray-800 text-white rounded-tr-none' 
                : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-none'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-imperial-red text-white flex items-center justify-center">
               <Loader2 size={14} className="animate-spin" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="我想吃辣的，有什麼推薦？"
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-imperial-red focus:ring-0 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="bg-imperial-red hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors shadow-md shadow-red-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;