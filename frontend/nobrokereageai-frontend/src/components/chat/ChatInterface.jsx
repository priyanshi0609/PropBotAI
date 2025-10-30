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
                  NoBrokerage AI
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Your intelligent property assistant for Pune and Mumbai
                </p>
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
      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/0 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/0 pt-6 pb-8 ">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSend} className="relative">
            <div className="relative flex items-end bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors overflow-hidden">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message NoBrokerage AI..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-[15px] max-h-[200px] overflow-y-auto cursor-pointer"
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
              NoBrokerage AI specializes in properties across Pune and Mumbai
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;