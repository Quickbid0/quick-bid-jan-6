import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Smile, Paperclip, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'bid' | 'system';
  avatar?: string;
}

interface LiveChatProps {
  auctionId?: string;
  className?: string;
}

const LiveChat: React.FC<LiveChatProps> = ({ auctionId, className = '' }) => {
  const { session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(45);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Mock initial messages
    setMessages([
      {
        id: '1',
        user: 'John D.',
        message: 'Beautiful piece! What\'s the reserve price?',
        timestamp: new Date(Date.now() - 300000),
        type: 'message'
      },
      {
        id: '2',
        user: 'Sarah M.',
        message: 'Placed bid: ₹25,000',
        timestamp: new Date(Date.now() - 240000),
        type: 'bid'
      },
      {
        id: '3',
        user: 'System',
        message: 'New bidder joined the auction',
        timestamp: new Date(Date.now() - 180000),
        type: 'system'
      }
    ]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockMessage: ChatMessage = {
          id: Date.now().toString(),
          user: ['Mike R.', 'Lisa K.', 'Tom B.'][Math.floor(Math.random() * 3)],
          message: [
            'Great auction!',
            'When does this end?',
            'Bidding now!',
            'Amazing quality!',
            'Is shipping included?'
          ][Math.floor(Math.random() * 5)],
          timestamp: new Date(),
          type: 'message'
        };
        setMessages(prev => [...prev, mockMessage]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [auctionId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: session?.user?.user_metadata?.name || 'You',
      message: newMessage,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'bid':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'system':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold">Live Chat</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{onlineUsers} online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-3 rounded-lg border ${getMessageStyle(message.type)}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm">{message.user}</span>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{message.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;