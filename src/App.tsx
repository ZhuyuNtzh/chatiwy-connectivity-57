
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import Index from './pages/Index';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import UserSelection from './pages/UserSelection';
import VipMembership from './pages/VipMembership';
import ChatInterface from './pages/ChatInterface';
import ChatHistory from './pages/ChatHistory';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VipRegister from './pages/VipRegister';
import Feedback from './pages/Feedback';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} /> {/* Redirecting to login instead */}
            <Route path="/vip-register" element={<VipRegister />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/user-selection" element={<UserSelection />} />
            <Route path="/vip-membership" element={<VipMembership />} />
            <Route path="/chat-interface" element={<ChatInterface />} />
            <Route path="/chat-history" element={<ChatHistory />} />
            <Route path="/feedback" element={<Feedback />} /> {/* New feedback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </QueryClientProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
