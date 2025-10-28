import { useState } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
  };
};