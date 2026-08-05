'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Mail,
  Smartphone,
  Lock,
  Key,
  Palette,
  Languages,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Link,
  Users,
  FileText,
  Award,
  Calendar,
  Clock,
  DollarSign,
  HelpCircle,
  MessageSquare,
  Share2,
  Server,
  Database,
  Zap,
  RefreshCw,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
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
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailReminders: boolean;
  smsReminders: boolean;
  marketingEmails: boolean;
  paymentAlerts: boolean;
  certificateAlerts: boolean;
  eventUpdates: boolean;
  systemAnnouncements: boolean;
  weeklyDigest: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  deviceManagement: boolean;
}

interface PaymentSettings {
  defaultCurrency: string;
  paymentMethod: string;
  mpesaNumber: string;
  bankAccount: string;
  bankName: string;
  payoutFrequency: string;
  minPayoutAmount: number;
}

// Mock Data
const mockProfile: ProfileData = {
  name: 'John Doe',
  email: 'john@nuruvent.com',
  phone: '+254 712 345 678',
  bio: 'Training event host and professional development coach.',
  role: 'host',
  organization: 'Nuruvent Inc.',
  website: 'https://nuruvent.com',
  location: 'Nairobi, Kenya',
  timezone: 'Africa/Nairobi',
  language: 'English',
};

const mockNotifications: NotificationSettings = {
  emailReminders: true,
  smsReminders: true,
  marketingEmails: false,
  paymentAlerts: true,
  certificateAlerts: true,
  eventUpdates: true,
  systemAnnouncements: false,
  weeklyDigest: true,
};

const mockSecurity: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 30,
  loginAlerts: true,
  deviceManagement: true,
};

const mockPayment: PaymentSettings = {
  defaultCurrency: 'KES',
  paymentMethod: 'mpesa',
  mpesaNumber: '+254 712 345 678',
  bankAccount: '1234567890',
  bankName: 'Equity Bank',
  payoutFrequency: 'weekly',
  minPayoutAmount: 1000,
};

const timezones = [
  'Africa/Nairobi',
  'Africa/Lagos',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Casablanca',
  'Europe/London',
  'America/New_York',
  'Asia/Dubai',
];

const currencies = ['KES', 'USD', 'EUR', 'GBP', 'NGN', 'TZS', 'UGX'];

const languages = ['English', 'Swahili', 'French', 'Arabic', 'Portuguese'];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(mockProfile);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);
  const [security, setSecurity] = useState<SecuritySettings>(mockSecurity);
  const [payment, setPayment] = useState<PaymentSettings>(mockPayment);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileSave = () => {
    setIsSaveDialogOpen(true);
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSecurityToggle = (key: keyof SecuritySettings) => {
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePaymentChange = (key: keyof PaymentSettings, value: string | number) => {
    setPayment(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account preferences and platform settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                className="cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                onClick={handleProfileSave}
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
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="profile" className="cursor-pointer flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="cursor-pointer flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="cursor-pointer flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="cursor-pointer flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="cursor-pointer flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="danger" className="cursor-pointer flex items-center gap-2 text-red-600 hover:text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Danger</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="cursor-pointer" disabled={!isEditing}>
                    Change Avatar
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <Separator />

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
                  <Label>Role</Label>
                  <Select
                    value={profile.role}
                    onValueChange={(value: 'host' | 'attendee' | 'admin') => 
                      setProfile({ ...profile, role: value })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="host" className="cursor-pointer">Host</SelectItem>
                      <SelectItem value="attendee" className="cursor-pointer">Attendee</SelectItem>
                      <SelectItem value="admin" className="cursor-pointer">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div>
                  <Label>Time Zone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz} className="cursor-pointer">
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Reminders</Label>
                    <p className="text-xs text-gray-500">Receive email reminders for upcoming events</p>
                  </div>
                  <Switch
                    checked={notifications.emailReminders}
                    onCheckedChange={() => handleNotificationToggle('emailReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Reminders</Label>
                    <p className="text-xs text-gray-500">Receive SMS reminders for upcoming events</p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={() => handleNotificationToggle('smsReminders')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Marketing Emails</Label>
                    <p className="text-xs text-gray-500">Receive promotional emails and offers</p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Payment Alerts</Label>
                    <p className="text-xs text-gray-500">Receive alerts for payment transactions</p>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={() => handleNotificationToggle('paymentAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Certificate Alerts</Label>
                    <p className="text-xs text-gray-500">Receive alerts when certificates are issued</p>
                  </div>
                  <Switch
                    checked={notifications.certificateAlerts}
                    onCheckedChange={() => handleNotificationToggle('certificateAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Event Updates</Label>
                    <p className="text-xs text-gray-500">Receive updates about events you manage</p>
                  </div>
                  <Switch
                    checked={notifications.eventUpdates}
                    onCheckedChange={() => handleNotificationToggle('eventUpdates')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">System Announcements</Label>
                    <p className="text-xs text-gray-500">Receive important system announcements</p>
                  </div>
                  <Switch
                    checked={notifications.systemAnnouncements}
                    onCheckedChange={() => handleNotificationToggle('systemAnnouncements')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Weekly Digest</Label>
                    <p className="text-xs text-gray-500">Receive a weekly summary of your events</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={() => handleNotificationToggle('weeklyDigest')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Change Password</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New password"
                      className="cursor-text"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button variant="outline" className="cursor-pointer">Update Password</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="cursor-pointer">
                    {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Login Alerts</Label>
                    <p className="text-xs text-gray-500">Receive alerts for new device logins</p>
                  </div>
                  <Switch
                    checked={security.loginAlerts}
                    onCheckedChange={() => handleSecurityToggle('loginAlerts')}
                  />
                </div>

                <div>
                  <Label>Session Timeout</Label>
                  <Select
                    value={String(security.sessionTimeout)}
                    onValueChange={(value) => handleSecurityToggle('sessionTimeout')}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="cursor-pointer">15 minutes</SelectItem>
                      <SelectItem value="30" className="cursor-pointer">30 minutes</SelectItem>
                      <SelectItem value="60" className="cursor-pointer">1 hour</SelectItem>
                      <SelectItem value="120" className="cursor-pointer">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Device Management</Label>
                    <p className="text-xs text-gray-500">Manage devices that are logged into your account</p>
                  </div>
                  <Button variant="outline" className="cursor-pointer">Manage Devices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Manage your payment methods and payout preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Currency</Label>
                  <Select
                    value={payment.defaultCurrency}
                    onValueChange={(value) => handlePaymentChange('defaultCurrency', value)}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency} className="cursor-pointer">
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Default Payment Method</Label>
                  <Select
                    value={payment.paymentMethod}
                    onValueChange={(value) => handlePaymentChange('paymentMethod', value)}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa" className="cursor-pointer">M-Pesa</SelectItem>
                      <SelectItem value="card" className="cursor-pointer">Card</SelectItem>
                      <SelectItem value="bank" className="cursor-pointer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>M-Pesa Number</Label>
                  <Input
                    value={payment.mpesaNumber}
                    onChange={(e) => handlePaymentChange('mpesaNumber', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>

                <div>
                  <Label>Bank Account</Label>
                  <Input
                    value={payment.bankAccount}
                    onChange={(e) => handlePaymentChange('bankAccount', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>

                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={payment.bankName}
                    onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>

                <div>
                  <Label>Payout Frequency</Label>
                  <Select
                    value={payment.payoutFrequency}
                    onValueChange={(value) => handlePaymentChange('payoutFrequency', value)}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily" className="cursor-pointer">Daily</SelectItem>
                      <SelectItem value="weekly" className="cursor-pointer">Weekly</SelectItem>
                      <SelectItem value="biweekly" className="cursor-pointer">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly" className="cursor-pointer">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Minimum Payout Amount</Label>
                  <Input
                    type="number"
                    value={payment.minPayoutAmount}
                    onChange={(e) => handlePaymentChange('minPayoutAmount', Number(e.target.value))}
                    className="mt-1 cursor-text"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your platform experience and display settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Language</Label>
                <Select
                  value={profile.language}
                  onValueChange={(value) => setProfile({ ...profile, language: value })}
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang} className="cursor-pointer">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-xs text-gray-500">Switch between light and dark theme</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Compact View</Label>
                  <p className="text-xs text-gray-500">Display more content with compact spacing</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Tab */}
        <TabsContent value="danger">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription className="text-red-500">
                Irreversible actions that affect your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <LogOut className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Logout All Sessions</h4>
                    <p className="text-sm text-gray-500">Logout all active sessions across all devices</p>
                  </div>
                  <Button variant="destructive" className="cursor-pointer">
                    Logout All
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="cursor-pointer"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              Your settings have been updated successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Changes Saved</p>
              <p className="text-sm text-gray-500">Your profile settings have been updated.</p>
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. All your events, attendees, payments, 
              and certificates will be deleted forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Are you sure?</p>
                <p className="text-sm text-gray-500">This action cannot be reversed.</p>
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-xs text-gray-500">Type &quot;DELETE&quot; to confirm</Label>
              <Input 
                placeholder="Type DELETE to confirm"
                className="mt-1 cursor-text"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}