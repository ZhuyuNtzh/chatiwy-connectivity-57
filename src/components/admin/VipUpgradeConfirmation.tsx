
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Crown } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface VipUpgradeConfirmationProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: {
    id: number;
    username: string;
  };
  onConfirm: (userId: number, username: string, expiryDate: Date) => void;
}

const VipUpgradeConfirmation: React.FC<VipUpgradeConfirmationProps> = ({
  isOpen,
  onOpenChange,
  user,
  onConfirm,
}) => {
  const today = new Date();
  const [expiryDate, setExpiryDate] = useState<Date>(addMonths(today, 1));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleQuickSelection = (option: 'day' | 'week' | 'month' | '3months') => {
    let newDate: Date;
    
    switch (option) {
      case 'day':
        newDate = addDays(today, 1);
        break;
      case 'week':
        newDate = addWeeks(today, 1);
        break;
      case 'month':
        newDate = addMonths(today, 1);
        break;
      case '3months':
        newDate = addMonths(today, 3);
        break;
      default:
        newDate = addMonths(today, 1);
    }
    
    setExpiryDate(newDate);
    setIsCalendarOpen(false);
  };
  
  const handleConfirm = () => {
    onConfirm(user.id, user.username, expiryDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Confirm VIP Status Upgrade
          </DialogTitle>
          <DialogDescription>
            Set the expiration date for {user.username}'s VIP status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="expiry-date">VIP Status Expires On</Label>
              <div className="flex gap-1 flex-wrap justify-end">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => handleQuickSelection('day')}
                >
                  1 Day
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => handleQuickSelection('week')}
                >
                  1 Week
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => handleQuickSelection('month')}
                >
                  1 Month
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-amber-50"
                  onClick={() => handleQuickSelection('3months')}
                >
                  3 Months
                </Badge>
              </div>
            </div>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={(date) => {
                    if (date) {
                      setExpiryDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date < today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-sm">
            <p className="text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Crown className="h-4 w-4" />
              After confirmation, {user.username} will have VIP access until {format(expiryDate, "PPP")}.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={handleConfirm}
          >
            Confirm VIP Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VipUpgradeConfirmation;
