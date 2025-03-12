import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";
import ChatInterface from "./pages/ChatInterface";
import ChatHistory from "./pages/ChatHistory";
import VipMembership from "./pages/VipMembership";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/chat-interface" element={<ChatInterface />} />
                <Route path="/chat-history" element={<ChatHistory />} />
                <Route path="/vip-membership" element={<VipMembership />} />
                <Route path="/vip-register" element={<div>Registration page coming soon...</div>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
