import React, { useState } from 'react';
import { Send, Bot, Trash2, Zap, Sparkles, Home, Building2, CheckCircle, Star, ArrowUp } from 'lucide-react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../../hooks/useChat';

function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, addMessage, clearMessages, messagesEndRef } = useChat();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await addMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleExampleClick = async (example) => {
    await addMessage(example);
  };

  const quickExamples = [
    {
      title: "2BHK in Pune under 80 Lakh",
      description: "Find affordable 2BHK apartments",
      icon: Home,
      query: "2BHK in Pune under 80 Lakh"
    },
    {
      title: "3BHK flats in Mumbai under 1.2 Cr", 
      description: "Premium 3BHK apartments",
      icon: Building2,
      query: "3BHK flats in Mumbai under 1.2 Cr"
    },
    {
      title: "Ready to move 1BHK in Pune",
      description: "Immediate possession properties",
      icon: CheckCircle,
      query: "Ready to move 1BHK in Pune"
    },
    {
      title: "Luxury apartments with pool & gym",
      description: "High-end properties with amenities",
      icon: Star,
      query: "Luxury apartments with pool and gym in Mumbai"
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-8">
              {/* Welcome Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                  <Bot className="w-9 h-9 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  PropBot AI
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Your intelligent property assistant for Pune and Mumbai
                </p>
              </div>
              
              {/* Quick Examples */}
              <div className="w-full max-w-2xl space-y-3 mb-8">
                {quickExamples.map((example, index) => {
                  const Icon = example.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example.query)}
                      className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-0.5">
                            {example.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {example.description}
                          </div>
                        </div>
                        <ArrowUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform -rotate-45 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Features */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Smart Search</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI Powered</span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Instant Results</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-6">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} className="h-24" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed Bottom */}
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/0 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/0 pt-6 pb-8">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSend} className="relative">
            <div className="relative flex items-end bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors overflow-hidden">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message PropBot AI..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-[15px] max-h-[200px] overflow-y-auto"
                style={{
                  minHeight: '56px',
                  scrollbarWidth: 'thin'
                }}
                disabled={isLoading}
              />
              
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="flex-shrink-0 m-2 p-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white dark:text-gray-900 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
            
            {/* Footer Text */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
              PropBot AI specializes in properties across Pune and Mumbai
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;