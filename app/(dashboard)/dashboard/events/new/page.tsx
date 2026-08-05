/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Award,
  Video,
  Globe,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image,
  Link as LinkIcon,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  User,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface EventFormData {
  title: string;
  type: 'workshop' | 'webinar' | 'bootcamp' | 'meetup';
  description: string;
  status: 'draft' | 'published' | 'scheduled';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  price: string;
  currency: string;
  capacity: string;
  platform: 'zoom' | 'google-meet' | 'teams' | 'custom';
  platformLink: string;
  location: string;
  isVirtual: boolean;
  hostName: string;
  hostEmail: string;
  hostBio: string;
  cpdHours: string;
  cpdAccredited: boolean;
  cpdBody: string;
  tags: string[];
  image?: File;
  imagePreview?: string;
}

const defaultFormData: EventFormData = {
  title: '',
  type: 'workshop',
  description: '',
  status: 'draft',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  timezone: 'Africa/Nairobi',
  price: '',
  currency: 'KES',
  capacity: '',
  platform: 'zoom',
  platformLink: '',
  location: '',
  isVirtual: true,
  hostName: '',
  hostEmail: '',
  hostBio: '',
  cpdHours: '0',
  cpdAccredited: false,
  cpdBody: '',
  tags: [],
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

const eventTypes = [
  { value: 'workshop', label: 'Workshop', icon: '🔧' },
  { value: 'webinar', label: 'Webinar', icon: '💻' },
  { value: 'bootcamp', label: 'Bootcamp', icon: '🚀' },
  { value: 'meetup', label: 'Meetup', icon: '🤝' },
];

const platforms = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google-meet', label: 'Google Meet' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'custom', label: 'Custom Link' },
];

const cpdBodies = [
  'ICPAK',
  'LSK',
  'IHRM',
  'KIM',
  'NITA',
  'Other',
];

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (publish: boolean = false) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsPublished(publish);
      setIsSaveDialogOpen(true);
    }, 1500);
  };

  const getEventTypeIcon = (type: string) => {
    const found = eventTypes.find(t => t.value === type);
    return found ? found.icon : '📌';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/events" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Event</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new training event, workshop, or webinar.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={() => router.push('/dashboard/events')}
          >
            Cancel
          </Button>
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={() => handleSubmit(false)}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
          >
            {isSaving ? 'Publishing...' : 'Publish Event'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="basic" className="cursor-pointer flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="details" className="cursor-pointer flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="host" className="cursor-pointer flex items-center gap-2">
            <User className="h-4 w-4" />
            Host Info
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          {/* Event Title & Type */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Event Title *</Label>
                  <Input
                    placeholder="e.g., Advanced Data Science Workshop"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A clear, descriptive title for your event.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Event Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => handleChange('type', value)}
                    >
                      <SelectTrigger className="mt-1 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => handleChange('status', value)}
                    >
                      <SelectTrigger className="mt-1 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft" className="cursor-pointer">Draft</SelectItem>
                        <SelectItem value="scheduled" className="cursor-pointer">Scheduled</SelectItem>
                        <SelectItem value="published" className="cursor-pointer">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Description *</Label>
                  <Textarea
                    placeholder="Describe your event, what attendees will learn, and any prerequisites..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="mt-1 min-h-[120px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Start Time *</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Time Zone *</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => handleChange('timezone', value)}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Pricing & Capacity */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Price *</Label>
                  <Input
                    type="number"
                    placeholder="0 for free"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange('currency', value)}
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
                  <Label className="text-sm font-semibold">Capacity *</Label>
                  <Input
                    type="number"
                    placeholder="Max attendees"
                    value={formData.capacity}
                    onChange={(e) => handleChange('capacity', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform & Location */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Virtual Event</Label>
                    <p className="text-xs text-gray-500">Toggle if this is an online event</p>
                  </div>
                  <Switch
                    checked={formData.isVirtual}
                    onCheckedChange={(checked) => handleChange('isVirtual', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Platform *</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value: any) => handleChange('platform', value)}
                    >
                      <SelectTrigger className="mt-1 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value} className="cursor-pointer">
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Platform Link *</Label>
                    <Input
                      placeholder="https://zoom.us/meeting/..."
                      value={formData.platformLink}
                      onChange={(e) => handleChange('platformLink', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The link attendees will use to join the event.
                    </p>
                  </div>

                  {!formData.isVirtual && (
                    <div>
                      <Label className="text-sm font-semibold">Physical Location</Label>
                      <Input
                        placeholder="e.g., Nairobi, Kenya"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className="mt-1 cursor-text"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CPD Accreditation */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">CPD Accredited</Label>
                    <p className="text-xs text-gray-500">Enable for professional body accreditation</p>
                  </div>
                  <Switch
                    checked={formData.cpdAccredited}
                    onCheckedChange={(checked) => handleChange('cpdAccredited', checked)}
                  />
                </div>

                {formData.cpdAccredited && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">CPD Hours</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 4"
                        value={formData.cpdHours}
                        onChange={(e) => handleChange('cpdHours', e.target.value)}
                        className="mt-1 cursor-text"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Accrediting Body</Label>
                      <Select
                        value={formData.cpdBody}
                        onValueChange={(value) => handleChange('cpdBody', value)}
                      >
                        <SelectTrigger className="mt-1 cursor-pointer">
                          <SelectValue placeholder="Select accrediting body" />
                        </SelectTrigger>
                        <SelectContent>
                          {cpdBodies.map((body) => (
                            <SelectItem key={body} value={body} className="cursor-pointer">
                              {body}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardContent className="pt-6">
              <Label className="text-sm font-semibold">Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add tags (e.g., Data Science, AI)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd();
                    }
                  }}
                  className="cursor-text"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTagAdd}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.tags.length === 0 && (
                  <p className="text-xs text-gray-400">No tags added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Image */}
          <Card>
            <CardContent className="pt-6">
              <Label className="text-sm font-semibold">Event Image</Label>
              <div className="mt-1">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload event image</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Host Info Tab */}
        <TabsContent value="host" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Host Name *</Label>
                  <Input
                    placeholder="e.g., John Doe"
                    value={formData.hostName}
                    onChange={(e) => handleChange('hostName', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Host Email *</Label>
                  <Input
                    type="email"
                    placeholder="host@example.com"
                    value={formData.hostEmail}
                    onChange={(e) => handleChange('hostEmail', e.target.value)}
                    className="mt-1 cursor-text"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-semibold">Host Bio</Label>
                  <Textarea
                    placeholder="Tell attendees about the host's experience and expertise..."
                    value={formData.hostBio}
                    onChange={(e) => handleChange('hostBio', e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              {isPublished ? 'Event Published!' : 'Draft Saved!'}
            </DialogTitle>
            <DialogDescription>
              {isPublished 
                ? 'Your event has been published and is now visible to attendees.'
                : 'Your event has been saved as a draft. You can publish it anytime.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{formData.title}</p>
                  <p className="text-sm text-gray-500">
                    {formData.startDate} • {getEventTypeIcon(formData.type)} {formData.type}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setIsSaveDialogOpen(false);
                  router.push('/dashboard/events');
                }}
              >
                Go to Events
              </Button>
              {isPublished && (
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 cursor-pointer"
                  onClick={() => {
                    setIsSaveDialogOpen(false);
                    window.open(`/events/${Date.now()}`, '_blank');
                  }}
                >
                  View Public Page
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              className="w-full cursor-pointer"
              onClick={() => {
                setIsSaveDialogOpen(false);
                if (!isPublished) {
                  // Reset form for new event
                  setFormData(defaultFormData);
                  setImagePreview(null);
                  setImageFile(null);
                  setTagInput('');
                }
              }}
            >
              {isPublished ? 'Done' : 'Create Another'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
