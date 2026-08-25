// components/dashboard/WelcomeModal.tsx

'use client';

import Link from 'next/link';
import { X, Sparkles, ArrowRight, Calendar, Users, CheckCircle2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 flex-shrink-0">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Welcome to Nuruvent, {userName}! 🎉
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            You&apos;re now part of a community of trainers and professionals growing through professional development.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Account Created Successfully</p>
              <p className="text-xs text-muted-foreground">Your account is ready. Start exploring the platform.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/events/create" className="w-full">
              <Button variant="default" className="w-full gap-2 cursor-pointer">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
            <Link href="/events" className="w-full">
              <Button variant="outline" className="w-full gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                Browse Events
              </Button>
            </Link>
          </div>

          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              💡 <span className="font-medium text-foreground">Pro Tip:</span> Create your first event and start earning from your training today!
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="cursor-pointer"
          >
            Maybe Later
          </Button>
          <Button 
            asChild 
            className="cursor-pointer"
          >
            <Link href="/events/create">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}