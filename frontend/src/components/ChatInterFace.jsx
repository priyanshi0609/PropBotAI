import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import PropertyCard from './PropertyCard';
import LoadingSpinner from './LoadingSpinner';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm PropBot AI, your intelligent property search assistant. I can help you find properties in Pune and Mumbai. Try asking me something like '3BHK flat in Pune under 1.2 Cr' or 'Ready to move properties in Mumbai'.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.summary,
        isUser: false,
        timestamp: new Date(),
        properties: data.properties || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm PropBot AI, your intelligent property search assistant. I can help you find properties in Pune and Mumbai. Try asking me something like '3BHK flat in Pune under 1.2 Cr' or 'Ready to move properties in Mumbai'.",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-medium">P</span>
          </div>
          <span className="text-sm font-medium text-gray-900">PropBot AI</span>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        >
          Clear chat
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 chat-container bg-gray-50">
        <div className="max-w-3xl mx-auto py-4">
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              <Message 
                text={message.text} 
                isUser={message.isUser} 
                timestamp={message.timestamp}
              />
              {message.properties && message.properties.length > 0 && (
                <div className="mt-4 ml-10">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Matching Properties</h3>
                    <p className="text-sm text-gray-600 mt-1">Found {message.properties.length} properties matching your criteria</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {message.properties.map((property, index) => (
                      <PropertyCard key={index} property={property} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && <LoadingSpinner />}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-3 bg-white rounded-lg border border-gray-300 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-colors">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message PropBot AI..."
              className="flex-1 px-3 py-2 resize-none border-0 focus:outline-none focus:ring-0 text-sm min-h-[40px] max-h-[120px]"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="mb-2 mr-2 bg-green-500 text-white p-1 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            PropBot AI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;