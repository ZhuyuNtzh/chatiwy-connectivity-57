import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

const Feedback = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number>(3);
  const [email, setEmail] = useState("support@chatwii.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Mock sending feedback
    const feedback = {
      message,
      rating,
      timestamp: new Date().toISOString(),
      email,
    };
    
    console.info("Sending feedback:", feedback);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Thank you for your feedback",
        description: "We appreciate you taking the time to share your thoughts.",
      });
      
      // Automatically redirect to landing page after submission
      navigate('/');
    }, 1000);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-lg mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">We value your feedback</CardTitle>
            <CardDescription>
              Help us improve your Chatwii experience by sharing your thoughts.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Your email (optional)</Label>
                <Input 
                  id="email" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>How would you rate your experience?</Label>
                <RadioGroup 
                  defaultValue="3" 
                  className="flex space-x-1"
                  value={rating.toString()}
                  onValueChange={(value) => setRating(parseInt(value))}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center">
                      <RadioGroupItem 
                        value={value.toString()} 
                        id={`rating-${value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`rating-${value}`}
                        className="cursor-pointer rounded-full w-12 h-12 p-2 text-center flex items-center justify-center peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-secondary-foreground hover:bg-secondary/30"
                      >
                        {value}
                      </Label>
                      <span className="text-xs mt-1 text-gray-500">
                        {value === 1 ? 'Poor' : 
                          value === 2 ? 'Fair' : 
                          value === 3 ? 'Good' : 
                          value === 4 ? 'Great' : 'Excellent'}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Your message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us what you liked or how we can improve..." 
                  className="min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Feedback;
