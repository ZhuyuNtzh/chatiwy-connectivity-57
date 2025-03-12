
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
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
    'Send unlimited photos',
    'Send voice messages',
    'Longer chat history',
    'Customer Support',
    'Unique avatar options',
    'Appear at the top of the list',
    'Ad free',
    'React, reply, edit, unsend messages',
    'View message status',
    'Special Badges',
    'Control your online status'
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
          <h1 className="text-4xl font-bold mb-4">VIP Membership Pricing</h1>
        </div>
        
        <div className="hidden md:grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-card rounded-xl p-6 shadow-md border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-2 right-4 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                  Most popular!
                </div>
              )}
              
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold">{plan.price}</h2>
                <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
              </div>
              
              <div className="flex-1 space-y-3 mb-6">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
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
                    } flex flex-col mx-auto max-w-sm`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 right-4 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                        Most popular!
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h2 className="text-4xl font-bold">{plan.price}</h2>
                      <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                    </div>
                    
                    <div className="flex-1 space-y-3 mb-6">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90 text-white"
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
