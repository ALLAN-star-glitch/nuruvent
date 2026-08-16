// components/ui/LogoutDialog.tsx

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogOut } from 'lucide-react';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isLoading = false 
}: LogoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-50">
              <LogOut className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to sign out of your Nuruvent account? You&apos;ll need to sign in again to access your dashboard and events.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
          >
            {isLoading ? 'Logging out...' : 'Yes, Sign Out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}