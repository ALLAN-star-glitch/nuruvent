/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
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
  Eye,
  Send,
  RefreshCw,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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

// ============= EVENT PREVIEW CARD =============
const EventPreviewCard = ({ data }: { data: EventFormData }) => {
  const getEventTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      workshop: '🔧',
      webinar: '💻',
      bootcamp: '🚀',
      meetup: '🤝',
    };
    return icons[type] || '📌';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      published: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date: string) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="event-preview-card">
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        {data.imagePreview ? (
          <div className="w-full h-48 bg-gray-100 overflow-hidden">
            <img 
              src={data.imagePreview} 
              alt={data.title || 'Event preview'} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">{getEventTypeIcon(data.type)}</div>
              <p className="text-sm text-gray-400">Event Image</p>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={cn("text-xs font-medium border", getStatusColor(data.status))}>
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </Badge>
            {data.cpdAccredited && (
              <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                <Award className="h-3 w-3 mr-1" />
                CPD
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {data.title || 'Untitled Event'}
          </h3>

          {/* Type */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{getEventTypeIcon(data.type)}</span>
            <span className="capitalize">{data.type}</span>
          </div>

          {/* Date & Time */}
          {(data.startDate || data.startTime) && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                {formatDate(data.startDate)}
                {data.startTime && ` at ${data.startTime}`}
                {data.endDate && ` - ${formatDate(data.endDate)}`}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {data.isVirtual ? (
              <Video className="h-4 w-4 flex-shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 flex-shrink-0" />
            )}
            <span>
              {data.isVirtual ? 'Virtual Event' : data.location || 'Location TBD'}
            </span>
          </div>

          {/* Host */}
          {data.hostName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>Hosted by {data.hostName}</span>
            </div>
          )}

          {/* Price & Capacity */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-500" />
              {data.price && Number(data.price) > 0 ? `${data.price} ${data.currency}` : 'Free'}
            </div>
            {data.capacity && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>{data.capacity} spots</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {data.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {data.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{data.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============= STEPPER =============
const Stepper = ({ currentStep, steps }: { currentStep: number; steps: string[] }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                  isActive && "bg-primary text-white ring-4 ring-primary/20",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-500 hover:bg-gray-300"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  isActive && "text-gray-900",
                  isCompleted && "text-gray-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-gray-200">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isCompleted ? "w-full bg-green-500" : "w-0 bg-primary"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const STEPS = ['Basic Info', 'Details', 'Host Info'];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        handleChange('imagePreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (publish: boolean = false) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsPublished(publish);
      setIsSaveDialogOpen(true);
    }, 1500);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Event Title & Type */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Event Title <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g., Advanced Data Science Workshop"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      A clear, descriptive title for your event.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Event Type <span className="text-red-500">*</span></Label>
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
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
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
                    <Label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      placeholder="Describe your event, what attendees will learn, and any prerequisites..."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="mt-1 min-h-[120px] cursor-text"
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
                    <Label className="text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Start Time <span className="text-red-500">*</span></Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">End Time</Label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Time Zone <span className="text-red-500">*</span></Label>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Pricing & Capacity */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Price <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      placeholder="0 for free"
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Currency <span className="text-red-500">*</span></Label>
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
                    <Label className="text-sm font-medium text-gray-700">Capacity <span className="text-red-500">*</span></Label>
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
                      <Label className="text-sm font-medium text-gray-700">Virtual Event</Label>
                      <p className="text-xs text-gray-400">Toggle if this is an online event</p>
                    </div>
                    <Switch
                      checked={formData.isVirtual}
                      onCheckedChange={(checked) => handleChange('isVirtual', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Platform <span className="text-red-500">*</span></Label>
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
                      <Label className="text-sm font-medium text-gray-700">Platform Link <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="https://zoom.us/meeting/..."
                        value={formData.platformLink}
                        onChange={(e) => handleChange('platformLink', e.target.value)}
                        className="mt-1 cursor-text"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        The link attendees will use to join the event.
                      </p>
                    </div>

                    {!formData.isVirtual && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Physical Location</Label>
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
                      <Label className="text-sm font-medium text-gray-700">CPD Accredited</Label>
                      <p className="text-xs text-gray-400">Enable for professional body accreditation</p>
                    </div>
                    <Switch
                      checked={formData.cpdAccredited}
                      onCheckedChange={(checked) => handleChange('cpdAccredited', checked)}
                    />
                  </div>

                  {formData.cpdAccredited && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">CPD Hours</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 4"
                          value={formData.cpdHours}
                          onChange={(e) => handleChange('cpdHours', e.target.value)}
                          className="mt-1 cursor-text"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Accrediting Body</Label>
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
                <Label className="text-sm font-medium text-gray-700">Tags</Label>
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
                <Label className="text-sm font-medium text-gray-700">Event Image</Label>
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
                          handleChange('imagePreview', '');
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Host Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g., John Doe"
                      value={formData.hostName}
                      onChange={(e) => handleChange('hostName', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Host Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      placeholder="host@example.com"
                      value={formData.hostEmail}
                      onChange={(e) => handleChange('hostEmail', e.target.value)}
                      className="mt-1 cursor-text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Host Bio</Label>
                    <Textarea
                      placeholder="Tell attendees about the host's experience and expertise..."
                      value={formData.hostBio}
                      onChange={(e) => handleChange('hostBio', e.target.value)}
                      className="mt-1 min-h-[100px] cursor-text"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
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
          {/* Mobile Preview Button */}
          {isMobile && (
            <Button 
              variant="outline" 
              className="cursor-pointer"
              onClick={() => {
                // Show preview in sheet
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button 
            className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publish Event
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="py-4">
        <Stepper currentStep={currentStep} steps={STEPS} />
      </div>

      {/* Main Content - Grid Layout */}
      <div className={cn(
        "grid gap-6",
        !isMobile ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Left Column - Editor */}
        <div className="min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Event Details'}
                {currentStep === 3 && 'Host Information'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Enter the basic details about your event.'}
                {currentStep === 2 && 'Configure pricing, platform, and CPD settings.'}
                {currentStep === 3 && 'Provide information about the event host.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 mt-6">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => handleSubmit(false)}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
                  onClick={() => handleSubmit(true)}
                  disabled={isSaving}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Desktop Preview */}
        {!isMobile && (
          <div className="sticky top-24 h-fit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                    <CardDescription>Real-time preview of your event</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EventPreviewCard data={formData} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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
                  <p className="font-medium text-gray-900">{formData.title || 'Untitled Event'}</p>
                  <p className="text-sm text-gray-500">
                    {formData.startDate || 'TBD'} • {formData.type}
                  </p>
                </div>
                <Badge variant="outline" className={cn(
                  isPublished ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-600 border-gray-200 bg-gray-50'
                )}>
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