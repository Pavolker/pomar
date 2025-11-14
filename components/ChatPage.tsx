
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { BackIcon, SendIcon } from './icons';

interface ChatPageProps {
  onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Olá! Sou o Jardineiro Sábio. Como posso ajudar com seu pomar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { sendMessageToGardener } = await import('../services/geminiService');
      const modelResponse = await sendMessageToGardener(input);
      setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Desculpe, estou com um pouco de dificuldade para pensar agora. Tente novamente mais tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-green-50/80" style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-leaves.png')`}}>
      <header className="flex items-center p-4 bg-white shadow-md z-10 border-b border-green-200">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
          aria-label="Voltar"
        >
          <BackIcon className="w-6 h-6" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-semibold text-emerald-800">Jardineiro Sábio</h1>
          <p className="text-sm text-green-600 flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online
          </p>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-3 rounded-2xl shadow ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="max-w-lg px-4 py-3 rounded-2xl shadow bg-white text-gray-800 rounded-bl-none border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white p-4 border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta..."
            className="flex-1 bg-gray-100 border-2 border-transparent rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="ml-3 p-3 bg-emerald-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
            aria-label="Enviar mensagem"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
