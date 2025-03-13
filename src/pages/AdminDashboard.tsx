
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Users, MessageSquare, Settings, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, userRole } = useUser();
  const navigate = useNavigate();
  
  // Check if the user is an admin
  useEffect(() => {
    if (!currentUser || userRole !== 'admin') {
      navigate('/');
    }
  }, [currentUser, userRole, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            System administration and management portal
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View, edit, suspend or verify user accounts. Manage user roles and permissions.
              </p>
              <Button className="w-full" variant="outline">
                Under Development
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Chat Moderation
              </CardTitle>
              <CardDescription>Monitor and moderate conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review reported messages, monitor suspicious activity, and enforce community guidelines.
              </p>
              <Button className="w-full" variant="outline">
                Under Development
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                System Settings
              </CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure system settings, manage global rules, and customize application behavior.
              </p>
              <Button className="w-full" variant="outline">
                Under Development
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-2 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Development Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The admin dashboard is currently under development. More features will be added soon.
              <br /><br />
              <strong>Admin Credentials:</strong><br />
              Username: admin or admin@chatwii.com<br />
              Password: admin123!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
