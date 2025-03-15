
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, Flag } from 'lucide-react';
import ModerationPanel from './ModerationPanel';
import { useUser } from '@/contexts/UserContext';

const AdminModeration = () => {
  const navigate = useNavigate();
  const { userRole } = useUser();

  useEffect(() => {
    // Admin persistence check
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true' || userRole === 'admin';
    if (!isAdmin) {
      navigate('/secure-admin-access-8472');
    }
  }, [navigate, userRole]);

  const handleBackToAdmin = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToAdmin}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Flag className="h-5 w-5 mr-2 text-red-500" />
            Chat Moderation
          </h1>
        </div>

        <Card>
          <CardContent className="p-0">
            <ModerationPanel />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminModeration;
