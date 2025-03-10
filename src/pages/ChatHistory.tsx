
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

// Mock chat history data
const mockChatHistory = [
  { id: 1, username: "Alice", lastMessage: "See you tomorrow!", timestamp: "2 hours ago", unread: 2 },
  { id: 2, username: "Bob", lastMessage: "Thanks for the advice", timestamp: "Yesterday", unread: 0 },
  { id: 3, username: "ChatBot_Alpha", lastMessage: "I can help with that!", timestamp: "2 days ago", unread: 0 },
  { id: 4, username: "Elena", lastMessage: "The concert was amazing", timestamp: "3 days ago", unread: 0 },
  { id: 5, username: "TravelGuide", lastMessage: "Here are some recommendations for Paris", timestamp: "Last week", unread: 0 },
];

const ChatHistory = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter chat history based on search term
  const filteredHistory = mockChatHistory.filter(chat => 
    chat.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Redirect if not logged in
  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f2f7f9]'}`}>
      <header className={`fixed top-0 left-0 right-0 h-16 z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm flex items-center px-4 md:px-6`}>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/chat-interface')}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chat History</h1>
      </header>
      
      <div className="pt-20 px-4 md:px-6 max-w-3xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden mb-6`}>
          <div className="p-4">
            <input
              type="text"
              placeholder="Search chats..."
              className={`w-full px-4 py-2 rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-200'} border`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="divide-y">
            {filteredHistory.length > 0 ? (
              filteredHistory.map(chat => (
                <div 
                  key={chat.id} 
                  className={`p-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition cursor-pointer`}
                  onClick={() => navigate('/chat-interface')}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
                        <User className="h-6 w-6 text-orange-600" />
                      </div>
                      {chat.unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{chat.username}</h3>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.timestamp}</span>
                      </div>
                      
                      <p className={`text-sm mt-1 ${chat.unread > 0 ? 'font-semibold' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No chat history found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
