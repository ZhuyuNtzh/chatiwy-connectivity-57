
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

const Feedback = () => {
  const { isDarkMode } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please rate your experience before submitting",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, you'd send this to your backend
    const feedbackData = {
      message: feedback,
      rating,
      timestamp: new Date().toISOString(),
      email: 'support@chatwii.com'
    };
    
    console.log('Sending feedback:', feedbackData);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Feedback sent",
        description: "Thank you for your feedback!"
      });
      
      // Reset form
      setFeedback('');
      setRating(null);
    }, 1000);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-1 container max-w-lg mx-auto px-4 pt-24 pb-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Feedback</CardTitle>
            <CardDescription className="text-center">
              Our friendly team would love to hear from you. We hope to see you very soon!
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>How would you rate your experience?</Label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating && rating >= star 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="feedback">Your message</Label>
                  <span className="text-xs text-muted-foreground">
                    {feedback.length}/140
                  </span>
                </div>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what you think..."
                  value={feedback}
                  onChange={(e) => {
                    if (e.target.value.length <= 140) {
                      setFeedback(e.target.value);
                    }
                  }}
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Submit Feedback"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Feedback;
