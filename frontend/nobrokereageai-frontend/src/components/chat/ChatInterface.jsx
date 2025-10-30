import React, { useState } from 'react';
import { Send, Bot, Trash2 } from 'lucide-react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';

function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, addMessage, clearMessages, messagesEndRef } = useChat();
  const { currentUser } = useAuth();

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
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                PropBot AI
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Intelligent Property Assistant
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Welcome to PropBot AI
            </h2>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Ask me about properties in Pune and Mumbai
            </p>
            <div className="mt-6 space-y-3 max-w-md mx-auto">
              <button
                onClick={() => handleExampleClick("2BHK in Pune under 80 Lakh")}
                className="w-full text-sm text-gray-600 dark:text-gray-400 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left group"
              >
                <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  "2BHK in Pune under 80 Lakh"
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Find affordable 2BHK apartments in Pune
                </div>
              </button>
              
              <button
                onClick={() => handleExampleClick("3BHK flats in Mumbai under 1.2 Cr")}
                className="w-full text-sm text-gray-600 dark:text-gray-400 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left group"
              >
                <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  "3BHK flats in Mumbai under 1.2 Cr"
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Premium 3BHK apartments in Mumbai
                </div>
              </button>
              
              <button
                onClick={() => handleExampleClick("Ready to move 1BHK in Pune")}
                className="w-full text-sm text-gray-600 dark:text-gray-400 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 text-left group"
              >
                <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  "Ready to move 1BHK in Pune"
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Immediate possession 1BHK properties
                </div>
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSend} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about properties in Pune and Mumbai..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
              disabled={isLoading}
            />
            {inputMessage && (
              <button
                type="button"
                onClick={() => setInputMessage('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[60px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PropBot AI specializes in properties in Pune and Mumbai
          </p>
          {messages.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {messages.filter(m => m.type === 'user').length} messages
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;