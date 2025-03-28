
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { HelmetProvider } from 'react-helmet-async';
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
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminChatInterface from '@/components/admin/AdminChatInterface';
import AdminModeration from '@/components/admin/AdminModeration';
import AdminProvider from './contexts/AdminContext';

const queryClient = new QueryClient();

function App() {
  return (
    // Removed BrowserRouter since it's already in main.tsx
    <HelmetProvider>
      <UserProvider>
        <AdminProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login />} />
                <Route path="/vip-register" element={<VipRegister />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/user-selection" element={<UserSelection />} />
                <Route path="/vip-membership" element={<VipMembership />} />
                <Route path="/chat-interface" element={<ChatInterface />} />
                <Route path="/chat-history" element={<ChatHistory />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/settings" element={<Settings />} />
                
                <Route path="/secure-admin-access-8472" element={<AdminLogin />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-chat" element={<AdminChatInterface />} />
                <Route path="/admin-moderation" element={<AdminModeration />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </QueryClientProvider>
          </ThemeProvider>
        </AdminProvider>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App;
