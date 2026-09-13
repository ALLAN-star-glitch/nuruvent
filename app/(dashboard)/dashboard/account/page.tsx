// app/(dashboard)/account/page.tsx

'use client';

import { useState } from 'react';
import {
  User,
  Save,
  CheckCircle2,
  Camera,
  Award,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

// ============================================================
// TYPES
// ============================================================

interface ProfileData {
  id: string;
  name: string;
  display_name?: string;
  email: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  account_type: string;
  organization?: string;
  website?: string;
  location?: string;
  created_at: string;
  email_verified: boolean;
  identity_verified: boolean;
}

// ============================================================
// PLACEHOLDER DATA
// ============================================================
//
// Replace this with whatever hydrates the page once the real
// profile endpoint is wired in.

const PLACEHOLDER_PROFILE: ProfileData = {
  id: 'placeholder-id',
  name: 'Jane Doe',
  display_name: 'Jane',
  email: 'jane@example.com',
  phone: '+254 700 000 000',
  avatar_url: '',
  bio: '',
  account_type: 'account_type_personal',
  organization: '',
  website: '',
  location: '',
  created_at: new Date().toISOString(),
  email_verified: true,
  identity_verified: false,
};

// ============================================================
// PAGE
// ============================================================

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(PLACEHOLDER_PROFILE);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAccountTypeLabel = (type: string) => {
    if (!type) return 'User';
    const typeMap: Record<string, string> = {
      account_type_personal: 'Personal',
      account_type_institution: 'Institution',
      institution: 'Institution',
      personal: 'Personal',
    };
    return (
      typeMap[type] || type.replace('account_type_', '').replace('_', ' ')
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    // TODO: call the real update endpoint here.
    //   await updateProfile({ id: profile.id, data: profile }).unwrap();

    // Simulate the async round-trip so the spinner is visible.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsSaving(false);
    setIsSaveDialogOpen(true);
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    // TODO: reset from the source of truth once the profile is
    // loaded from an API.
    setProfile(PLACEHOLDER_PROFILE);
  };

  const isInstitution =
    profile.account_type?.includes('institution') || false;

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
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
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
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(profile.display_name || profile.name)}
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
              <p className="text-sm font-medium text-gray-900">
                {profile.display_name || profile.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="outline">
                  {getAccountTypeLabel(profile.account_type)}
                </Badge>
                {profile.email_verified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Member since{' '}
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG up to 5MB
                </p>
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
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>

            {isInstitution && (
              <div>
                <Label>Display Name (Public)</Label>
                <Input
                  value={profile.display_name || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, display_name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1 cursor-text"
                  placeholder="Public display name"
                />
              </div>
            )}

            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={profile.email}
                disabled={true}
                className="mt-1 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed. Contact support if you need to update
                it.
              </p>
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 cursor-text"
              />
            </div>

            {isInstitution && (
              <div>
                <Label>Organization</Label>
                <Input
                  value={profile.organization || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, organization: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1 cursor-text"
                  placeholder="Your organization name"
                />
              </div>
            )}

            <div>
              <Label>Website</Label>
              <Input
                value={profile.website || ''}
                onChange={(e) =>
                  setProfile({ ...profile, website: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 cursor-text"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={profile.location || ''}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                disabled={!isEditing}
                className="mt-1 cursor-text"
                placeholder="City, Country"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Bio</Label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                disabled={!isEditing}
                className="w-full min-h-[100px] p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-text mt-1"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email Status</p>
              <p className="font-medium text-gray-900">
                {profile.email_verified ? 'Verified' : 'Unverified'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Account Type</p>
              <p className="font-medium text-gray-900">
                {getAccountTypeLabel(profile.account_type)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium text-gray-900">Attendee</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <p className="text-sm text-gray-500">
                Your account has been updated.
              </p>
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