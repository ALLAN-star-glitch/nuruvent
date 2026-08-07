'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  Camera,
  Award,
  Calendar,
  Clock,
  Users,
  Briefcase,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio: string;
  role: 'host' | 'attendee' | 'admin';
  organization: string;
  website: string;
  location: string;
  memberSince: string;
}

const mockProfile: ProfileData = {
  name: 'John Doe',
  email: 'john@nuruvent.com',
  phone: '+254 712 345 678',
  bio: 'Training event host and professional development coach with over 5 years of experience in tech education.',
  role: 'host',
  organization: 'Nuruvent Inc.',
  website: 'https://nuruvent.com',
  location: 'Nairobi, Kenya',
  memberSince: 'Jan 2024',
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    setIsSaveDialogOpen(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal information and public profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and public profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button 
                  className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors cursor-pointer"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.name}</p>
              <Badge variant="outline" className="mt-1">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">
                Member since {profile.memberSince}
              </p>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>
            <div>
              <Label>Organization</Label>
              <Input
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Bio</Label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!isEditing}
                className="w-full min-h-[100px] p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-text mt-1"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Updated</DialogTitle>
            <DialogDescription>
              Your profile information has been updated successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Changes Saved</p>
              <p className="text-sm text-gray-500">Your account has been updated.</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="bg-primary hover:bg-primary/90 cursor-pointer"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setIsEditing(false);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}