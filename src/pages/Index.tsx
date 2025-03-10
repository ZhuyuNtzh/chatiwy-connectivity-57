
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '../components/Header';
import { ArrowRight, MessageSquare, Shield, Award, Clock, Flag, UserCheck } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/user-selection');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center max-w-3xl mx-auto staggered-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-accent">
              Connect One-on-One in Real Time
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Chatiwy is a premium chat platform that lets you connect with people from around the world in private, one-on-one conversations.
            </p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="rounded-full px-8 text-base h-12 bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/25"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Chatiwy?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our platform is designed with privacy, quality, and user experience in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 transition-all duration-300 hover:shadow-lg"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fade-in-up 0.5s ease-out forwards',
                  opacity: 0 
                }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="glass-card overflow-hidden">
            <div className="p-8 md:p-12 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
              <div className="max-w-3xl">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Chatting?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of users already connecting on Chatiwy. No registration required to get started.
                </p>
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="rounded-full px-8 text-base h-12"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted/50 py-12">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Chatiwy
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Chatiwy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Features data
const features = [
  {
    title: 'Private Conversations',
    description: 'Enjoy one-on-one chats in a secure, private environment.',
    icon: MessageSquare,
  },
  {
    title: 'VIP Benefits',
    description: 'Upgrade to VIP for extended history, voice messages, and more.',
    icon: Award,
  },
  {
    title: 'Admin Moderation',
    description: 'Our admin team ensures a safe, respectful environment for all users.',
    icon: Shield,
  },
  {
    title: 'Chat History',
    description: 'Access your recent conversations based on your membership level.',
    icon: Clock,
  },
  {
    title: 'Report System',
    description: 'Easy reporting tools to help maintain community standards.',
    icon: Flag,
  },
  {
    title: 'User Profiles',
    description: 'Create a profile with interests to connect with like-minded people.',
    icon: UserCheck,
  },
];

export default Index;
