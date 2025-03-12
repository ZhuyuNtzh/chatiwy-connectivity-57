
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Camera, Mic, History, LifeBuoy, User, Users, Ban, MessageCircle, Eye, Award, Activity } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const VipMembership = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const features = [
    { icon: <Camera className="h-5 w-5" />, text: 'Send unlimited photos' },
    { icon: <Mic className="h-5 w-5" />, text: 'Send voice messages' },
    { icon: <History className="h-5 w-5" />, text: 'Longer chat history' },
    { icon: <LifeBuoy className="h-5 w-5" />, text: 'Customer Support' },
    { icon: <User className="h-5 w-5" />, text: 'Unique avatar options' },
    { icon: <Users className="h-5 w-5" />, text: 'Appear at the top of the list' },
    { icon: <Ban className="h-5 w-5" />, text: 'Ad free' },
    { icon: <MessageCircle className="h-5 w-5" />, text: 'React, reply, edit, unsend messages' },
    { icon: <Eye className="h-5 w-5" />, text: 'View message status' },
    { icon: <Award className="h-5 w-5" />, text: 'Special Badges' },
    { icon: <Activity className="h-5 w-5" />, text: 'Control your online status' }
  ];
  
  const plans = [
    {
      id: 'monthly',
      price: '$4.99',
      period: 'Billed every month.',
      popular: false
    },
    {
      id: '6months',
      price: '$22.99',
      period: 'Billed every 6 month.',
      popular: true
    },
    {
      id: 'yearly',
      price: '$35.99',
      period: 'Billed annually.',
      popular: false
    }
  ];
  
  const handleGetStarted = (planId: string) => {
    navigate(`/vip-register?plan=${planId}`);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">VIP Membership Benefits</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Upgrade your experience with premium features designed to enhance your communication and enjoyment.</p>
        </div>
        
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-5">
            <Card className="h-full bg-gradient-to-br from-secondary/10 to-background border-secondary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 text-center">Premium Benefits</h2>
                <div className="grid grid-cols-1 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-secondary/20 transition-all hover:shadow-md hover:bg-background/80">
                      <div className="h-9 w-9 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <p className="font-medium">{feature.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        
          <div className="md:col-span-7">
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative bg-card rounded-xl p-6 shadow-md border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } flex flex-col ${plan.popular ? 'transform scale-105 z-10' : 'opacity-90'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                      Most popular!
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">{plan.price}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                  </div>
                  
                  <div className="flex-1 space-y-3 mb-6">
                    {features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-secondary" />
                        </div>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                    {plan.popular && (
                      <p className="text-xs text-secondary mt-2">+ All other VIP benefits</p>
                    )}
                  </div>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-secondary hover:bg-secondary/90' : 'bg-secondary/80 hover:bg-secondary/70'} text-white`}
                    onClick={() => handleGetStarted(plan.id)}
                  >
                    Get started
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="md:hidden w-full">
              <Carousel className="w-full" opts={{ align: "center", loop: true }}>
                <CarouselContent className="mx-auto">
                  {plans.map((plan) => (
                    <CarouselItem key={plan.id} className="basis-full sm:basis-full">
                      <div 
                        className={`relative bg-card rounded-xl p-6 shadow-md border ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        } flex flex-col mx-auto max-w-sm ${plan.popular ? 'mt-4 mb-4' : ''}`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 right-4 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                            Most popular!
                          </div>
                        )}
                        
                        <div className="text-center mb-6">
                          <h2 className="text-4xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">{plan.price}</h2>
                          <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                        </div>
                        
                        <div className="flex-1 space-y-3 mb-6">
                          {features.slice(0, 5).map((feature, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                                <Check className="w-3 h-3 text-secondary" />
                              </div>
                              <span className="text-sm">{feature.text}</span>
                            </div>
                          ))}
                          {plan.popular && (
                            <p className="text-xs text-secondary mt-2">+ All other VIP benefits</p>
                          )}
                        </div>
                        
                        <Button 
                          className={`w-full ${plan.popular ? 'bg-secondary hover:bg-secondary/90' : 'bg-secondary/80 hover:bg-secondary/70'} text-white`}
                          onClick={() => handleGetStarted(plan.id)}
                        >
                          Get started
                        </Button>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-4">
                  <CarouselPrevious className="static transform-none mx-1" />
                  <CarouselNext className="static transform-none mx-1" />
                </div>
              </Carousel>
            </div>
          </div>
        </div>
        
        <div className="mt-16 flex justify-center space-x-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Terms & Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact us</a>
          <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
      </main>
    </div>
  );
};

export default VipMembership;
