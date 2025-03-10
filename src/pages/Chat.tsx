
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import Header from '../components/Header';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';
import { useUser, UserProfile } from '../contexts/UserContext';
import { MessageSquare, Inbox, History, Ban, Globe, Hourglass } from 'lucide-react';

interface ChatMessageData {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isImage?: boolean;
  imageUrl?: string;
  isBlurred?: boolean;
  senderRole?: 'standard' | 'vip' | 'admin';
}

const Chat = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentUser, userRole } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState<UserProfile | null>(null);
  
  // Mock data for demonstration
  useEffect(() => {
    if (!username) return;
    
    // Simulate fetching chat partner data
    setChatPartner({
      username: username,
      age: 28,
      gender: 'Female',
      interests: ['Music', 'Art', 'Travel'],
      location: 'New York',
      isOnline: true,
      role: 'standard',
    });
    
    // Simulate loading chat history
    const mockMessages: ChatMessageData[] = [
      {
        id: '1',
        content: 'Hello there! How are you doing today?',
        sender: username,
        timestamp: new Date(Date.now() - 50000),
        status: 'read',
        senderRole: 'standard',
      },
      {
        id: '2',
        content: 'I\'m doing well, thanks for asking! How about you?',
        sender: currentUser?.username || 'You',
        timestamp: new Date(Date.now() - 40000),
        status: 'read',
        senderRole: userRole || 'standard',
      },
      {
        id: '3',
        content: 'I\'m great! Just exploring this new chat platform. The design is really nice and clean.',
        sender: username,
        timestamp: new Date(Date.now() - 30000),
        status: 'read',
        senderRole: 'standard',
      },
      {
        id: '4',
        content: 'Yes, it\'s very intuitive and elegant. I like the smooth animations too.',
        sender: currentUser?.username || 'You',
        timestamp: new Date(Date.now() - 20000),
        status: 'delivered',
        senderRole: userRole || 'standard',
      },
    ];
    
    setMessages(mockMessages);
  }, [username, currentUser, userRole]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (content: string) => {
    // Check for spam (this would typically be done on the server)
    if (content.length > (userRole === 'vip' ? 200 : 140)) {
      return; // Character limit exceeded
    }
    
    const newMessage: ChatMessageData = {
      id: Date.now().toString(),
      content,
      sender: currentUser?.username || 'You',
      timestamp: new Date(),
      status: 'sent',
      senderRole: userRole || 'standard',
    };
    
    setMessages([...messages, newMessage]);
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const responseMessage: ChatMessageData = {
        id: (Date.now() + 1).toString(),
        content: getRandomResponse(),
        sender: username || 'User',
        timestamp: new Date(),
        status: 'sent',
        senderRole: 'standard',
      };
      
      setMessages(prevMessages => [...prevMessages, responseMessage]);
      
      // Simulate message status updates
      setTimeout(() => {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
          )
        );
        
        setTimeout(() => {
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
            )
          );
        }, 1000);
      }, 1000);
    }, 2000);
  };
  
  const handleSendImage = (file: File) => {
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(file);
    
    const newMessage: ChatMessageData = {
      id: Date.now().toString(),
      content: 'Sent an image',
      sender: currentUser?.username || 'You',
      timestamp: new Date(),
      status: 'sent',
      isImage: true,
      imageUrl,
      isBlurred: true,
      senderRole: userRole || 'standard',
    };
    
    setMessages([...messages, newMessage]);
  };
  
  const getRandomResponse = () => {
    const responses = [
      "That's interesting! Tell me more.",
      "I see what you mean. Have you considered the alternatives?",
      "Good point! I hadn't thought of it that way.",
      "I agree completely.",
      "That's a unique perspective! I appreciate you sharing that.",
      "I'm not sure I follow. Could you elaborate?",
      "That makes a lot of sense.",
      "I've had similar experiences as well.",
      "What made you come to that conclusion?",
      "I find that fascinating!",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-20 pb-0 flex flex-col h-[calc(100vh-80px)]">
        {chatPartner && (
          <div className="glass-card flex items-center p-3 mx-4 sm:mx-0 mb-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold mr-3">
              {chatPartner.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="text-lg font-medium truncate">{chatPartner.username}</h3>
                {chatPartner.isOnline && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                )}
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground space-x-2">
                {chatPartner.age && <span>{chatPartner.age}</span>}
                {chatPartner.gender && <span>• {chatPartner.gender}</span>}
                {chatPartner.location && (
                  <span className="flex items-center">
                    • <Globe className="h-3 w-3 mx-0.5" /> {chatPartner.location}
                  </span>
                )}
                <span className="flex items-center">
                  • <Hourglass className="h-3 w-3 mx-0.5" /> {userRole === 'admin' ? '24h' : userRole === 'vip' ? '10h' : '1h'} history
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-row h-full">
          <div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-0">
            <div className="flex-1 overflow-y-auto px-1 py-4 overflow-x-hidden">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    sender={message.sender}
                    timestamp={message.timestamp}
                    isMine={message.sender === currentUser?.username || message.sender === 'You'}
                    status={message.status}
                    isImage={message.isImage}
                    imageUrl={message.imageUrl}
                    isBlurred={message.isBlurred}
                    senderRole={message.senderRole}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 glass-card mt-4 mb-4">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                onSendImage={handleSendImage}
                onRecordVoice={userRole === 'vip' ? () => console.log('Record voice message') : undefined}
              />
            </div>
          </div>
        </div>
      </main>
      
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full shadow-lg bg-primary text-white hover:bg-primary/90"
            >
              <Inbox className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <div className="p-4">
                <h3 className="text-lg font-medium">Inbox</h3>
                <p className="text-sm text-muted-foreground">Your recent messages</p>
              </div>
              <div className="p-4">
                <div className="text-center text-muted-foreground py-8">
                  No new messages
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-primary/90 text-white hover:bg-primary/80"
          onClick={() => setIsSidebarOpen(true)}
        >
          <History className="h-5 w-5" />
        </Button>
        
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-primary/80 text-white hover:bg-primary/70"
        >
          <Ban className="h-5 w-5" />
        </Button>
      </div>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};

export default Chat;
