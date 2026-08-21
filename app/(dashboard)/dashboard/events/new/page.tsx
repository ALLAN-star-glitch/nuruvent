/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Award,
  Video,
  Shield,
  CheckCircle2,
  Loader2,
  Upload,
  Trash2,
  ChevronRight,
  Send,
  Eye,
  Lightbulb,
  AlertCircle,
  Check,
  XCircle,
  Star,
  Lock,
  Copy,
} from 'lucide-react';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Redux imports
import { useAppSelector } from '@/lib/store/hooks';
import { 
  useCreateDraftMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetEventTypesQuery, 
  useGetEventStatusesQuery, 
  usePublishEventMutation,
  useUploadEventImageMutation,
  useDeleteEventImageMutation,
} from '@/lib/store/api/eventsApi';
import { AnimatePresence, motion } from 'framer-motion';

// ============================================================
// TYPES
// ============================================================

interface EventFormData {
  name: string;
  description: string;
  event_type_id: string;
  date: string;
  time: string;
  duration: number | null;
  price: number | null;
  certificate_price: number | null;
  location: string;
  is_virtual: boolean;
  is_featured: boolean;
  is_private: boolean;
  slug?: string;
  zoom_link: string;
  meet_link: string;
  max_attendees: number | null;
  image?: File;
  imagePreview?: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  event_type_id?: string;
  date?: string;
  time?: string;
  duration?: string;
  price?: string;
  certificate_price?: string;
  location?: string;
  is_virtual?: string;
  slug?: string;
  zoom_link?: string;
  meet_link?: string;
  max_attendees?: string;
  image?: string;
  imagePreview?: string;
}

// ============================================================
// SAVE STATUS INDICATOR
// ============================================================

const SaveStatusIndicator = ({ 
  status 
}: { 
  status: 'idle' | 'saving' | 'saved' 
}) => {
  const [dots, setDots] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'saving') {
      intervalRef.current = setInterval(() => {
        setDots(prev => {
          if (prev === '') return '.';
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '';
        });
      }, 400);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDots('');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-2 text-sm min-w-[120px] transition-all duration-300">
      {status === 'saving' && (
        <span className="font-medium text-primary transition-opacity duration-300">
          Saving draft<span className="inline-block w-[24px] text-left">{dots}</span>
        </span>
      )}
      {status === 'saved' && (
        <div className="flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-4 w-4 text-tertiary-500" />
          <span className="font-medium text-tertiary-600">Draft saved</span>
        </div>
      )}
    </div>
  );
};

const defaultFormData: EventFormData = {
  name: '',
  description: '',
  event_type_id: '',
  date: '',
  time: '',
  duration: null,
  price: null,
  certificate_price: null,
  location: '',
  is_virtual: true,
  is_featured: false,
  is_private: false,
  zoom_link: '',
  meet_link: '',
  max_attendees: null,
  image: undefined,
  imagePreview: '',
};

// ============================================================
// COMPONENTS
// ============================================================

const EventPreviewCard = ({ data, eventType }: { data: EventFormData; eventType?: string }) => {
  const formatDate = (date: string) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="border border-neutral-light rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {data.imagePreview ? (
        <div className="w-full h-48 bg-neutral-light overflow-hidden">
          <img 
            src={data.imagePreview} 
            alt={data.name || 'Event preview'} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-10 w-10 text-primary-300 mx-auto" />
            <p className="text-sm text-neutral-gray mt-2">Event Image</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-neutral-dark line-clamp-2 flex-1">
            {data.name || 'Untitled Event'}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {data.is_featured && (
              <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {data.is_private && (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>

        {eventType && (
          <div className="flex items-center gap-2 text-sm text-neutral-gray">
            <span className="capitalize">{eventType}</span>
          </div>
        )}

        {(data.date || data.time) && (
          <div className="flex items-start gap-2 text-sm text-neutral-gray">
            <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              {formatDate(data.date)}
              {data.time && ` at ${data.time}`}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-neutral-gray">
          {data.is_virtual ? (
            <Video className="h-4 w-4 flex-shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 flex-shrink-0" />
          )}
          <span>
            {data.is_virtual ? 'Virtual Event' : data.location || 'Location TBD'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-light">
          <div className="flex items-center gap-1 text-sm font-semibold text-neutral-dark">
            <DollarSign className="h-4 w-4 text-neutral-gray" />
            {data.price && data.price > 0 ? `${data.price} KES` : 'Free'}
          </div>
          {data.max_attendees && data.max_attendees > 0 && (
            <div className="flex items-center gap-1 text-sm text-neutral-gray">
              <Users className="h-4 w-4" />
              <span>{data.max_attendees} spots</span>
            </div>
          )}
        </div>

        {data.duration && data.duration > 0 && (
          <div className="flex items-center gap-2 text-sm text-neutral-gray">
            <Clock className="h-4 w-4" />
            <span>{data.duration} minutes</span>
          </div>
        )}
      </div>
    </div>
  );
};

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
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isActive && "bg-primary text-white ring-4 ring-primary/20",
                  isCompleted && "bg-tertiary-500 text-white",
                  !isActive && !isCompleted && "bg-neutral-light text-neutral-gray"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:block",
                  isActive && "text-neutral-dark",
                  isCompleted && "text-neutral-gray",
                  !isActive && !isCompleted && "text-neutral-gray"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-neutral-light">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    isCompleted ? "w-full bg-tertiary-500" : "w-0 bg-primary"
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

const PreviewModal = ({ 
  open, 
  onOpenChange, 
  data, 
  eventType 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  data: EventFormData; 
  eventType?: string;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-neutral-dark">Event Preview</DialogTitle>
        <DialogDescription className="text-neutral-gray">
          Preview of your event as it will appear to attendees
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <EventPreviewCard data={data} eventType={eventType} />
      </div>
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          className="w-full cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
        >
          Close Preview
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CreateEventPage() {
  const router = useRouter();
  
  const { account, user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const accountId = useMemo(() => {
    const id = account?.id || user?.id || '';
    if (!id) {
      console.warn('⚠️ No account ID found in CreateEventPage');
    }
    return id;
  }, [account, user]);
  
  // ✅ RTK Query hooks
  const [createDraft, { isLoading: isCreatingDraft }] = useCreateDraftMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [publishEvent, { isLoading: isPublishing }] = usePublishEventMutation();
  const [uploadEventImage, { isLoading: isUploading }] = useUploadEventImageMutation();
  const [deleteEventImage] = useDeleteEventImageMutation();
  const { data: eventTypes = [] } = useGetEventTypesQuery();
  const { data: eventStatuses = [] } = useGetEventStatusesQuery();

  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // ✅ LocalStorage key for draft ID
  const STORAGE_KEY = 'nuruvent_draft_id';
  
  // ✅ Draft ID tracking - initialize from localStorage
  const [draftId, setDraftId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        console.log('📦 Restored draftId from localStorage:', saved);
        return saved;
      }
    }
    return null;
  });
  
  // ✅ Save draftId to localStorage whenever it changes
  useEffect(() => {
    if (draftId) {
      localStorage.setItem(STORAGE_KEY, draftId);
      console.log('💾 Saved draftId to localStorage:', draftId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Removed draftId from localStorage');
    }
  }, [draftId]);
  
  // Auto-save state
  const [lastSavedData, setLastSavedData] = useState<EventFormData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoSavingRef = useRef(false);
  
  // ✅ Add formDataRef to avoid stale closures
  const formDataRef = useRef(formData);
  
  // ✅ Update the ref whenever formData changes
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const STEPS = ['Basic Info', 'Details', 'Preview'];
  const isCreating = isCreatingDraft || isCreatingEvent || isUpdating;

  // ============================================================
  // CHECK IF PUBLISH IS READY
  // ============================================================

  const isPublishReady = useMemo(() => {
    const hasName = formData.name && formData.name.trim().length > 0;
    const hasEventType = !!formData.event_type_id;
    const hasDate = !!formData.date;
    const hasTime = !!formData.time;
    const hasDuration = formData.duration && formData.duration > 0;
    
    let hasLocationOrLink = true;
    if (formData.is_virtual) {
      hasLocationOrLink = !!(formData.zoom_link || formData.meet_link);
    } else {
      hasLocationOrLink = !!formData.location;
    }
    
    return hasName && hasEventType && hasDate && hasTime && hasDuration && hasLocationOrLink;
  }, [formData]);

  // ============================================================
  // DETECT CHANGES - FIXED (removed saveStatus from deps)
  // ============================================================

  useEffect(() => {
    if (!lastSavedData) {
      const hasAnyData = formData.name || formData.event_type_id || formData.date || formData.time;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasChanges(!!hasAnyData);
      if (hasAnyData && saveStatus !== 'saving') {
        setSaveStatus('saving');
      }
      return;
    }

    const currentData = {
      ...formData,
      imagePreview: formData.imagePreview || undefined,
      image: formData.image || undefined,
    };
    const savedData = {
      ...lastSavedData,
      imagePreview: lastSavedData.imagePreview || undefined,
      image: lastSavedData.image || undefined,
    };
    
    const hasChanged = JSON.stringify(currentData) !== JSON.stringify(savedData);
    setHasChanges(hasChanged);
    if (hasChanged && saveStatus !== 'saving') {
      setSaveStatus('saving');
    } else if (!hasChanged && !isAutoSaving) {
      setSaveStatus('saved');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, lastSavedData, isAutoSaving]); // ✅ Intentionally removed saveStatus

  // ============================================================
  // AUTO-SAVE LOGIC - FIXED with localStorage
  // ============================================================

  const performAutoSave = useCallback(async () => {
    // ✅ Prevent multiple concurrent saves
    if (isAutoSavingRef.current || isSaving || isCreating) {
      console.log('⏭️ Skipping auto-save: Already saving');
      return;
    }
    
    if (!accountId) {
      console.warn('⚠️ Cannot auto-save: No account ID found');
      return;
    }

    // ✅ Get the latest form data from the ref
    const currentFormData = formDataRef.current;

    const hasName = !!currentFormData.name?.trim();
    const hasEventType = !!currentFormData.event_type_id;
    const hasDate = !!currentFormData.date;

    // ✅ Don't save if there's no meaningful data yet
    if (!hasName && !hasEventType && !hasDate) {
      console.log('⏭️ Skipping auto-save: No data yet');
      return;
    }

    // ✅ CRITICAL: Get the latest draftId from localStorage FIRST
    const localStorageDraftId = localStorage.getItem(STORAGE_KEY);
    const stateDraftId = draftId;
    
    // Use localStorage value first, fallback to state
    const currentDraftId = localStorageDraftId || stateDraftId;
    
    console.log(`🔍 Auto-save - draftId from localStorage: ${localStorageDraftId || 'null'}`);
    console.log(`🔍 Auto-save - draftId from state: ${stateDraftId || 'null'}`);
    console.log(`🔍 Auto-save - FINAL draftId: ${currentDraftId || 'null'}`);
    
    // ✅ If we have a draftId in state but not in localStorage, save it
    if (stateDraftId && !localStorageDraftId) {
      localStorage.setItem(STORAGE_KEY, stateDraftId);
      console.log('💾 Synced draftId to localStorage:', stateDraftId);
    }

    isAutoSavingRef.current = true;
    setIsAutoSaving(true);

    try {
      let response;
      
      // ✅ Use the latest draftId - check localStorage first
      const finalDraftId = localStorage.getItem(STORAGE_KEY) || draftId;
      
      if (finalDraftId) {
        // ✅ UPDATE existing draft - PUT request
        console.log(`📤 Calling updateEvent (PUT) with ID: ${finalDraftId}`);
        response = await updateEvent({
          id: finalDraftId,
          data: {
            name: currentFormData.name?.trim() || 'Untitled Event',
            description: currentFormData.description || '',
            event_type_id: currentFormData.event_type_id || '',
            date: currentFormData.date || '',
            time: currentFormData.time || '',
            duration: currentFormData.duration || 60,
            price: currentFormData.price || 0,
            certificate_price: currentFormData.certificate_price || 0,
            location: currentFormData.location || '',
            is_virtual: currentFormData.is_virtual,
            is_featured: currentFormData.is_featured,
            is_private: currentFormData.is_private,
            zoom_link: currentFormData.zoom_link || '',
            meet_link: currentFormData.meet_link || '',
            max_attendees: currentFormData.max_attendees || 0,
          }
        }).unwrap();
        console.log(`✅ updateEvent successful for ID: ${finalDraftId}`);
        
        // ✅ If image was added, upload it separately
        if (imageFile) {
          console.log(`📤 Uploading image for draft: ${finalDraftId}`);
          await uploadEventImage({
            accountId,
            eventId: finalDraftId,
            image: imageFile,
          }).unwrap();
          setImageFile(null);
          setImagePreview(null);
        }
        
      } else {
        // ✅ CREATE new draft - POST request (only if no draftId exists)
        console.log('📤 Calling createDraft (POST)...');
        const formDataToSend = new FormData();
        formDataToSend.append('name', currentFormData.name?.trim() || 'Untitled Event');
        formDataToSend.append('description', currentFormData.description || '');
        formDataToSend.append('event_type_id', currentFormData.event_type_id || '');
        formDataToSend.append('date', currentFormData.date || '');
        formDataToSend.append('time', currentFormData.time || '');
        formDataToSend.append('duration', currentFormData.duration?.toString() || '60');
        formDataToSend.append('price', (currentFormData.price || 0).toString());
        formDataToSend.append('certificate_price', (currentFormData.certificate_price || 0).toString());
        formDataToSend.append('location', currentFormData.location || '');
        formDataToSend.append('is_virtual', currentFormData.is_virtual.toString());
        formDataToSend.append('is_featured', currentFormData.is_featured.toString());
        formDataToSend.append('is_private', currentFormData.is_private.toString());
        formDataToSend.append('zoom_link', currentFormData.zoom_link || '');
        formDataToSend.append('meet_link', currentFormData.meet_link || '');
        formDataToSend.append('max_attendees', (currentFormData.max_attendees || 0).toString());

        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }

        response = await createDraft({
          accountId,
          data: formDataToSend,
        }).unwrap();
        
        // ✅ Store the draftId in BOTH state AND localStorage
        const newDraftId = response.id || response.id;
        console.log(`✅ New draft created with ID: ${newDraftId}`);
        
        // ✅ CRITICAL: Update both immediately
        setDraftId(newDraftId);
        localStorage.setItem(STORAGE_KEY, newDraftId);
        setCreatedEventId(newDraftId);
        setImageFile(null);
        setImagePreview(null);
        
        console.log(`✅ Verified draftId in localStorage: ${localStorage.getItem(STORAGE_KEY)}`);
      }

      setLastSavedData({ ...currentFormData });
      setHasChanges(false);
      setSaveStatus('saved');
      
      console.log('✅ Auto-save completed successfully');
      
    } catch (err: any) {
      console.error('❌ Auto-save error:', err);
    } finally {
      isAutoSavingRef.current = false;
      setIsAutoSaving(false);
    }
  }, [
    accountId,
    imageFile,
    isSaving,
    isCreating,
    createDraft,
    updateEvent,
    uploadEventImage,
    draftId,
  ]);

  // ✅ Single auto-save effect
  useEffect(() => {
    if (!accountId) return;
    
    const currentFormData = formDataRef.current;
    const hasData = !!currentFormData.name?.trim() || !!currentFormData.event_type_id || !!currentFormData.date;
    if (!hasData) return;
    
    if (isSaving || isCreating || isAutoSaving) return;
    if (!hasChanges) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    autoSaveTimerRef.current = setTimeout(() => {
      console.log('⏰ Auto-save timer triggered');
      performAutoSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [
    accountId,
    hasChanges,
    isSaving,
    isCreating,
    isAutoSaving,
    performAutoSave,
  ]);

  // ✅ Save on unmount
  useEffect(() => {
    return () => {
      if (hasChanges) {
        console.log('💾 Saving on unmount with draftId:', localStorage.getItem(STORAGE_KEY));
        performAutoSave();
      }
    };
  }, [hasChanges, performAutoSave]);

  // ✅ Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // ============================================================
  // VALIDATION - MOVED UP BEFORE HANDLERS
  // ============================================================

  const isValidUrl = useCallback((string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }, []);

  const validateField = useCallback((field: keyof EventFormData, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (value && value.length > 100) return 'Event name must be less than 100 characters';
        return undefined;
      case 'date':
        if (value) {
          const selectedDate = new Date(value);
          if (isNaN(selectedDate.getTime())) return 'Invalid date format';
        }
        return undefined;
      case 'duration':
        if (value !== null && value !== undefined) {
          if (value < 0) return 'Duration cannot be negative';
          if (value > 1440) return 'Duration cannot exceed 1440 minutes (24 hours)';
        }
        return undefined;
      case 'price':
        if (value !== null && value < 0) return 'Price cannot be negative';
        return undefined;
      case 'certificate_price':
        if (value !== null && value < 0) return 'Certificate price cannot be negative';
        return undefined;
      case 'max_attendees':
        if (value !== null && value < 0) return 'Maximum attendees cannot be negative';
        return undefined;
      case 'zoom_link':
        if (value && !isValidUrl(value)) return 'Please enter a valid Zoom URL';
        return undefined;
      case 'meet_link':
        if (value && !isValidUrl(value)) return 'Please enter a valid Google Meet URL';
        return undefined;
      default:
        return undefined;
    }
  }, [isValidUrl]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSaveStatus('saving');
    
    const errorKey = field as keyof FormErrors;
    if (errors[errorKey]) {
      setErrors(prev => {
        const { [errorKey]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);

  const handleFieldBlurWithSave = useCallback((field: keyof EventFormData) => {
    // Validate field
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    const errorKey = field as keyof FormErrors;
    if (error) {
      setErrors(prev => ({ ...prev, [errorKey]: error }));
    } else {
      setErrors(prev => {
        const { [errorKey]: _, ...rest } = prev;
        return rest;
      });
    }
    
    // ✅ Only save if there are changes and not already saving
    if (hasChanges && !isAutoSaving && !isSaving && !isCreating) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      setTimeout(() => {
        performAutoSave();
      }, 100);
    }
  }, [
    hasChanges,
    isAutoSaving,
    isSaving,
    isCreating,
    performAutoSave,
    formData,
    validateField,
  ]);

  const handleSelectChange = useCallback((field: keyof EventFormData, value: any) => {
    handleChange(field, value);
    
    if (hasChanges && !isAutoSaving && !isSaving && !isCreating) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      setTimeout(() => {
        performAutoSave();
      }, 200);
    }
  }, [hasChanges, isAutoSaving, isSaving, isCreating, performAutoSave, handleChange]);

  // ============================================================
  // VALIDATION FUNCTIONS
  // ============================================================

  const validateForDraft = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Event name must be less than 100 characters';
      isValid = false;
    }

    if (formData.date) {
      const selectedDate = new Date(formData.date);
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Invalid date format';
        isValid = false;
      }
    }

    if (formData.duration !== null && formData.duration !== undefined) {
      if (formData.duration < 0) {
        newErrors.duration = 'Duration cannot be negative';
        isValid = false;
      }
      if (formData.duration > 1440) {
        newErrors.duration = 'Duration cannot exceed 1440 minutes (24 hours)';
        isValid = false;
      }
    }

    if (formData.price !== null && formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
      isValid = false;
    }

    if (formData.certificate_price !== null && formData.certificate_price < 0) {
      newErrors.certificate_price = 'Certificate price cannot be negative';
      isValid = false;
    }

    if (formData.max_attendees !== null && formData.max_attendees < 0) {
      newErrors.max_attendees = 'Maximum attendees cannot be negative';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateForPublish = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Event name is required';
      isValid = false;
    } else if (formData.name.length > 100) {
      newErrors.name = 'Event name must be less than 100 characters';
      isValid = false;
    }

    if (!formData.event_type_id) {
      newErrors.event_type_id = 'Event type is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
      isValid = false;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
        isValid = false;
      }
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required';
      isValid = false;
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
      isValid = false;
    } else if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
      isValid = false;
    } else if (formData.duration > 1440) {
      newErrors.duration = 'Duration cannot exceed 1440 minutes (24 hours)';
      isValid = false;
    }

    if (!formData.is_virtual && !formData.location) {
      newErrors.location = 'Location is required for in-person events';
      isValid = false;
    }

    if (formData.is_virtual) {
      if (!formData.zoom_link && !formData.meet_link) {
        newErrors.zoom_link = 'At least one meeting link is required for virtual events';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Only JPG, PNG, and WEBP images are supported' }));
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        handleChange('imagePreview', reader.result as string);
        setErrors(prev => {
          const { image, ...rest } = prev;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSave = () => {
    if (hasChanges) {
      performAutoSave();
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (statusSlug: 'draft' | 'published') => {
    setError(null);

    // ✅ Check authentication
    if (!accountId) {
      setError('Please log in to create events.');
      toast.error('Please log in to create events');
      return;
    }

    // ✅ Validate based on status
    let isValid = false;
    if (statusSlug === 'published') {
      isValid = validateForPublish();
    } else {
      isValid = validateForDraft();
    }

    if (!isValid) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(`field-${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      setError(statusSlug === 'published' 
        ? 'Please fix all errors before publishing.' 
        : 'Please fix validation errors before saving.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      let response;
      
      // ============================================================
      // PUBLISH FLOW
      // ============================================================
      if (statusSlug === 'published') {
        // ✅ Get the latest draftId from localStorage
        const currentDraftId = localStorage.getItem(STORAGE_KEY) || draftId;
        
        if (currentDraftId) {
          // ✅ 1. Upload image if exists (separate API)
          if (imageFile) {
            console.log('📤 Uploading image for draft:', currentDraftId);
            await uploadEventImage({
              accountId,
              eventId: currentDraftId,
              image: imageFile,
            }).unwrap();
            console.log('✅ Image uploaded successfully');
            setImageFile(null);
            setImagePreview(null);
          }
          
          // ✅ 2. Update draft with latest data (application/json)
          console.log('📤 Updating draft with latest data:', currentDraftId);
          await updateEvent({
            id: currentDraftId,
            data: {
              name: formData.name?.trim() || 'Untitled Event',
              description: formData.description || '',
              event_type_id: formData.event_type_id || '',
              date: formData.date || '',
              time: formData.time || '',
              duration: formData.duration || 60,
              price: formData.price || 0,
              certificate_price: formData.certificate_price || 0,
              location: formData.location || '',
              is_virtual: formData.is_virtual,
              is_featured: formData.is_featured,
              is_private: formData.is_private,
              zoom_link: formData.zoom_link || '',
              meet_link: formData.meet_link || '',
              max_attendees: formData.max_attendees || 0,
            }
          }).unwrap();
          console.log('✅ Draft updated successfully');
          
          // ✅ 3. Publish the draft
          console.log('📤 Publishing draft:', currentDraftId);
          await publishEvent(currentDraftId).unwrap();
          console.log('✅ Event published successfully');
          
          setCreatedEventId(currentDraftId);
          // ✅ Clear draft ID from state and localStorage
          setDraftId(null);
          localStorage.removeItem(STORAGE_KEY);
          
        } else {
          // ✅ No draft - create published event directly with image in FormData
          console.log('📤 Creating published event directly...');
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name?.trim() || 'Untitled Event');
          formDataToSend.append('description', formData.description || '');
          formDataToSend.append('event_type_id', formData.event_type_id || '');
          formDataToSend.append('date', formData.date || '');
          formDataToSend.append('time', formData.time || '');
          formDataToSend.append('duration', formData.duration?.toString() || '60');
          formDataToSend.append('price', (formData.price || 0).toString());
          formDataToSend.append('certificate_price', (formData.certificate_price || 0).toString());
          formDataToSend.append('location', formData.location || '');
          formDataToSend.append('is_virtual', formData.is_virtual.toString());
          formDataToSend.append('is_featured', formData.is_featured.toString());
          formDataToSend.append('is_private', formData.is_private.toString());
          formDataToSend.append('zoom_link', formData.zoom_link || '');
          formDataToSend.append('meet_link', formData.meet_link || '');
          formDataToSend.append('max_attendees', (formData.max_attendees || 0).toString());

          if (imageFile) {
            formDataToSend.append('image', imageFile);
          }

          response = await createEvent({
            accountId,
            data: formDataToSend,
          }).unwrap();
          
          const newEventId = response.id || response.id;
          setCreatedEventId(newEventId);
          setImageFile(null);
          setImagePreview(null);
        }
        
      // ============================================================
      // SAVE DRAFT FLOW
      // ============================================================
      } else {
        // ✅ Get the latest draftId from localStorage
        const currentDraftId = localStorage.getItem(STORAGE_KEY) || draftId;
        
        if (currentDraftId) {
          // ✅ Update existing draft
          if (imageFile) {
            console.log('📤 Uploading image for draft:', currentDraftId);
            await uploadEventImage({
              accountId,
              eventId: currentDraftId,
              image: imageFile,
            }).unwrap();
            setImageFile(null);
            setImagePreview(null);
          }
          
          response = await updateEvent({
            id: currentDraftId,
            data: {
              name: formData.name?.trim() || 'Untitled Event',
              description: formData.description || '',
              event_type_id: formData.event_type_id || '',
              date: formData.date || '',
              time: formData.time || '',
              duration: formData.duration || 60,
              price: formData.price || 0,
              certificate_price: formData.certificate_price || 0,
              location: formData.location || '',
              is_virtual: formData.is_virtual,
              is_featured: formData.is_featured,
              is_private: formData.is_private,
              zoom_link: formData.zoom_link || '',
              meet_link: formData.meet_link || '',
              max_attendees: formData.max_attendees || 0,
            }
          }).unwrap();
          setCreatedEventId(response.id || response.id);
          
        } else {
          // ✅ Create new draft with image in FormData
          console.log('📤 Creating new draft...');
          const formDataToSend = new FormData();
          formDataToSend.append('name', formData.name?.trim() || 'Untitled Event');
          formDataToSend.append('description', formData.description || '');
          formDataToSend.append('event_type_id', formData.event_type_id || '');
          formDataToSend.append('date', formData.date || '');
          formDataToSend.append('time', formData.time || '');
          formDataToSend.append('duration', formData.duration?.toString() || '60');
          formDataToSend.append('price', (formData.price || 0).toString());
          formDataToSend.append('certificate_price', (formData.certificate_price || 0).toString());
          formDataToSend.append('location', formData.location || '');
          formDataToSend.append('is_virtual', formData.is_virtual.toString());
          formDataToSend.append('is_featured', formData.is_featured.toString());
          formDataToSend.append('is_private', formData.is_private.toString());
          formDataToSend.append('zoom_link', formData.zoom_link || '');
          formDataToSend.append('meet_link', formData.meet_link || '');
          formDataToSend.append('max_attendees', (formData.max_attendees || 0).toString());

          if (imageFile) {
            formDataToSend.append('image', imageFile);
          }

          response = await createDraft({
            accountId,
            data: formDataToSend,
          }).unwrap();
          
          const newDraftId = response.id || response.id;
          setDraftId(newDraftId);
          localStorage.setItem(STORAGE_KEY, newDraftId);
          setCreatedEventId(newDraftId);
          setImageFile(null);
          setImagePreview(null);
        }
      }

      // ✅ Update state and show success
      setLastSavedData({ ...formData });
      setHasChanges(false);
      setSaveStatus('saved');
      
      setIsPublished(statusSlug === 'published');
      setIsSaveDialogOpen(true);
      
      if (statusSlug === 'draft') {
        setFormData(defaultFormData);
        setImagePreview(null);
        setImageFile(null);
        setErrors({});
        setTouched({});
        setDraftId(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      
    } catch (err: any) {
      console.error('Create event error:', err);
      setError(err?.data?.message || 'Failed to create event. Please try again.');
      toast.error(err?.data?.message || 'Failed to create event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      if (validateForDraft()) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ✅ Fix 1: Use lowercase fields for event types
  const selectedEventType = eventTypes.find((t: any) => t.id === formData.event_type_id);  
     

  // ============================================================
  // RENDER STEP CONTENT
  // ============================================================

 const renderStepContent = () => {
  switch (currentStep) {
    case 1:
      return (
        <div className="space-y-6">
          <Card className="border border-neutral-light">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                <div id="field-name" className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">
                    Event Name
                    <span className="text-error-500 ml-1">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Advanced Data Science Workshop"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleFieldBlurWithSave('name')}
                    className={cn(
                      "cursor-text focus:ring-primary-500 focus:border-primary-500",
                      touched.name && errors.name && "border-error-500 focus:ring-error-500 focus:border-error-500"
                    )}
                  />
                  {touched.name && errors.name && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-event_type_id" className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-dark">
                      Event Type
                      <span className="text-error-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={formData.event_type_id}
                      onValueChange={(value) => {
                        handleSelectChange('event_type_id', value);
                        setTouched(prev => ({ ...prev, event_type_id: true }));
                      }}
                    >
                      <SelectTrigger className={cn(
                        "cursor-pointer",
                        touched.event_type_id && errors.event_type_id && "border-error-500"
                      )}>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type: any) => (
                          <SelectItem key={type.id} value={type.id} className="cursor-pointer">
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.event_type_id && errors.event_type_id && (
                      <p className="text-sm text-error-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.event_type_id}
                      </p>
                    )}
                  </div>

                  <div id="field-duration" className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-dark">
                      Duration (minutes)
                      <span className="text-error-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 60"
                      value={formData.duration || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange('duration', val === '' ? null : parseInt(val) || 0);
                      }}
                      onBlur={() => handleFieldBlurWithSave('duration')}
                      className={cn(
                        "cursor-text focus:ring-primary-500 focus:border-primary-500",
                        touched.duration && errors.duration && "border-error-500 focus:ring-error-500 focus:border-error-500"
                      )}
                      min={1}
                    />
                    {touched.duration && errors.duration && (
                      <p className="text-sm text-error-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">Description</Label>
                  <Textarea
                    placeholder="Describe your event, what attendees will learn..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    onBlur={() => handleFieldBlurWithSave('description')}
                    className="min-h-[120px] cursor-text focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-neutral-light">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="field-date" className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">
                    Date
                    <span className="text-error-500 ml-1">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    onBlur={() => handleFieldBlurWithSave('date')}
                    className={cn(
                      "cursor-text focus:ring-primary-500 focus:border-primary-500",
                      touched.date && errors.date && "border-error-500 focus:ring-error-500 focus:border-error-500"
                    )}
                  />
                  {touched.date && errors.date && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.date}
                    </p>
                  )}
                </div>
                <div id="field-time" className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">
                    Time
                    <span className="text-error-500 ml-1">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    onBlur={() => handleFieldBlurWithSave('time')}
                    className={cn(
                      "cursor-text focus:ring-primary-500 focus:border-primary-500",
                      touched.time && errors.time && "border-error-500 focus:ring-error-500 focus:border-error-500"
                    )}
                  />
                  {touched.time && errors.time && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.time}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          {/* Pricing */}
          <Card className="border border-neutral-light">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div id="field-price" className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">Price (KES)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.price || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange('price', val === '' ? null : parseFloat(val) || 0);
                    }}
                    onBlur={() => handleFieldBlurWithSave('price')}
                    className={cn(
                      "cursor-text focus:ring-primary-500 focus:border-primary-500",
                      touched.price && errors.price && "border-error-500 focus:ring-error-500 focus:border-error-500"
                    )}
                    min={0}
                    step="0.01"
                  />
                  <p className="text-xs text-neutral-gray">Set to 0 for free events</p>
                  {touched.price && errors.price && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.price}
                    </p>
                  )}
                </div>
                <div id="field-certificate_price" className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">Certificate Price (KES)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.certificate_price || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange('certificate_price', val === '' ? null : parseFloat(val) || 0);
                    }}
                    onBlur={() => handleFieldBlurWithSave('certificate_price')}
                    className={cn(
                      "cursor-text focus:ring-primary-500 focus:border-primary-500",
                      touched.certificate_price && errors.certificate_price && "border-error-500 focus:ring-error-500 focus:border-error-500"
                    )}
                    min={0}
                    step="0.01"
                  />
                  {touched.certificate_price && errors.certificate_price && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.certificate_price}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Virtual */}
          <Card className="border border-neutral-light">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-neutral-dark">Virtual Event</Label>
                    <p className="text-xs text-neutral-gray">Toggle if this is an online event</p>
                  </div>
                  <Switch
                    checked={formData.is_virtual}
                    onCheckedChange={(checked) => {
                      handleSelectChange('is_virtual', checked);
                      if (!checked) {
                        handleChange('zoom_link', '');
                        handleChange('meet_link', '');
                      } else {
                        handleChange('location', '');
                      }
                    }}
                    className="cursor-pointer"
                  />
                </div>

                {formData.is_virtual ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div id="field-zoom_link" className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-dark">Zoom Link</Label>
                      <Input
                        placeholder="https://zoom.us/meeting/..."
                        value={formData.zoom_link}
                        onChange={(e) => handleChange('zoom_link', e.target.value)}
                        onBlur={() => handleFieldBlurWithSave('zoom_link')}
                        className={cn(
                          "cursor-text focus:ring-primary-500 focus:border-primary-500",
                          touched.zoom_link && errors.zoom_link && "border-error-500 focus:ring-error-500 focus:border-error-500"
                        )}
                      />
                      {touched.zoom_link && errors.zoom_link && (
                        <p className="text-sm text-error-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.zoom_link}
                        </p>
                      )}
                    </div>
                    <div id="field-meet_link" className="space-y-2">
                      <Label className="text-sm font-medium text-neutral-dark">Google Meet Link</Label>
                      <Input
                        placeholder="https://meet.google.com/..."
                        value={formData.meet_link}
                        onChange={(e) => handleChange('meet_link', e.target.value)}
                        onBlur={() => handleFieldBlurWithSave('meet_link')}
                        className={cn(
                          "cursor-text focus:ring-primary-500 focus:border-primary-500",
                          touched.meet_link && errors.meet_link && "border-error-500 focus:ring-error-500 focus:border-error-500"
                        )}
                      />
                      {touched.meet_link && errors.meet_link && (
                        <p className="text-sm text-error-500 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.meet_link}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div id="field-location" className="space-y-2">
                    <Label className="text-sm font-medium text-neutral-dark">
                      Location
                      <span className="text-error-500 ml-1">*</span>
                    </Label>
                    <Input
                      placeholder="e.g., Nairobi, Kenya"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      onBlur={() => handleFieldBlurWithSave('location')}
                      className={cn(
                        "cursor-text focus:ring-primary-500 focus:border-primary-500",
                        touched.location && errors.location && "border-error-500 focus:ring-error-500 focus:border-error-500"
                      )}
                    />
                    {touched.location && errors.location && (
                      <p className="text-sm text-error-500 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.location}
                      </p>
                    )}
                  </div>
                )}

                <div id="field-max_attendees" className="space-y-2">
                  <Label className="text-sm font-medium text-neutral-dark">Maximum Attendees</Label>
                  <Input
                    type="number"
                    placeholder="0 for unlimited"
                    value={formData.max_attendees || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange('max_attendees', val === '' ? null : parseInt(val) || 0);
                    }}
                    onBlur={() => handleFieldBlurWithSave('max_attendees')}
                    className={cn(
                      "cursor-text focus:ring-primary-500 focus:border-primary-500",
                      touched.max_attendees && errors.max_attendees && "border-error-500 focus:ring-error-500 focus:border-error-500"
                    )}
                    min={0}
                  />
                  {touched.max_attendees && errors.max_attendees && (
                    <p className="text-sm text-error-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.max_attendees}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured & Private Toggles */}
          <Card className="border border-neutral-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-neutral-dark">Event Visibility</CardTitle>
              <CardDescription className="text-xs text-neutral-gray">
                Control how your event appears to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-100">
                <div>
                  <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
                    <Star className="h-4 w-4 text-secondary-500" />
                    Featured Event
                  </Label>
                  <p className="text-xs text-neutral-gray">Featured events appear prominently on the homepage</p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => {
                    handleSelectChange('is_featured', checked);
                  }}
                  className="cursor-pointer data-[state=checked]:bg-secondary-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <Label className="text-sm font-medium text-neutral-dark flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    Private Event
                  </Label>
                  <p className="text-xs text-neutral-gray">Private events are hidden from public listings</p>
                </div>
                <Switch
                  checked={formData.is_private}
                  onCheckedChange={(checked) => {
                    handleSelectChange('is_private', checked);
                  }}
                  className="cursor-pointer data-[state=checked]:bg-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border border-neutral-light">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-neutral-dark">Event Image</Label>
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
                        setErrors(prev => {
                          const { image, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className="absolute top-2 right-2 p-1 bg-error-500 text-white rounded-full hover:bg-error-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className={cn(
                    "flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    errors.image ? "border-error-500 bg-error-50" : "border-neutral-light hover:border-primary-300 hover:bg-primary-50"
                  )}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={cn(
                        "h-10 w-10",
                        errors.image ? "text-error-500" : "text-neutral-gray"
                      )} />
                      <p className={cn(
                        "text-sm mt-2",
                        errors.image ? "text-error-500" : "text-neutral-gray"
                      )}>
                        {errors.image || 'Click to upload event image'}
                      </p>
                      <p className="text-xs text-neutral-gray">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                {errors.image && (
                  <p className="text-sm text-error-500 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.image}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <Card className="border border-neutral-light">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-neutral-gray">
                  <Shield className="h-4 w-4 text-primary-500" />
                  <span>Review your event details before publishing</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-gray">Event Name</p>
                    <p className="font-medium text-neutral-dark">{formData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray">Type</p>
                    <p className="font-medium text-neutral-dark">{selectedEventType?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray">Date</p>
                    <p className="font-medium text-neutral-dark">{formData.date || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray">Time</p>
                    <p className="font-medium text-neutral-dark">{formData.time || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray">Duration</p>
                    <p className="font-medium text-neutral-dark">{formData.duration || 0} minutes</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray">Price</p>
                    <p className="font-medium text-neutral-dark">
                      {formData.price && formData.price > 0 ? `${formData.price} KES` : 'Free'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-neutral-gray">Virtual</p>
                    <p className="font-medium text-neutral-dark">{formData.is_virtual ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-neutral-gray">Featured</p>
                    <p className="font-medium text-neutral-dark">{formData.is_featured ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-neutral-gray">Private</p>
                    <p className="font-medium text-neutral-dark">{formData.is_private ? 'Yes' : 'No'}</p>
                  </div>
                  {formData.is_virtual && formData.zoom_link && (
                    <div className="col-span-2">
                      <p className="text-neutral-gray">Zoom Link</p>
                      <p className="font-medium text-neutral-dark truncate">{formData.zoom_link}</p>
                    </div>
                  )}
                  {formData.is_virtual && formData.meet_link && (
                    <div className="col-span-2">
                      <p className="text-neutral-gray">Meet Link</p>
                      <p className="font-medium text-neutral-dark truncate">{formData.meet_link}</p>
                    </div>
                  )}
                  {!formData.is_virtual && formData.location && (
                    <div className="col-span-2">
                      <p className="text-neutral-gray">Location</p>
                      <p className="font-medium text-neutral-dark">{formData.location}</p>
                    </div>
                  )}
                  {formData.max_attendees && formData.max_attendees > 0 && (
                    <div className="col-span-2">
                      <p className="text-neutral-gray">Max Attendees</p>
                      <p className="font-medium text-neutral-dark">{formData.max_attendees}</p>
                    </div>
                  )}
                </div>

                {formData.description && (
                  <div className="pt-4 border-t border-neutral-light">
                    <p className="text-neutral-gray text-sm">Description</p>
                    <p className="text-sm text-neutral-dark mt-1">{formData.description}</p>
                  </div>
                )}

                {formData.imagePreview && (
                  <div className="pt-4 border-t border-neutral-light">
                    <p className="text-neutral-gray text-sm">Event Image</p>
                    <img
                      src={formData.imagePreview}
                      alt="Event preview"
                      className="mt-2 w-full max-w-xs h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <EventPreviewCard data={formData} eventType={selectedEventType?.name} />
        </div>
      );

    default:
      return null;
  }
};

  const isLoading = isSaving || isCreating || isAutoSaving || isPublishing || isUploading;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/events" 
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-gray" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-dark">Create Event</h1>
            <p className="text-sm text-neutral-gray mt-1">
              Create a new training event, workshop, or webinar.
            </p>
          </div>
        </div>
        
        {/* Action Buttons with Save Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SaveStatusIndicator status={saveStatus} />
          
          {isMobile && (
            <Button 
              variant="outline"
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex-1 sm:flex-none cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={handleManualSave}
            disabled={isLoading || !hasChanges}
            className="flex-1 sm:flex-none cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button 
            className="flex-1 sm:flex-none bg-primary hover:bg-primary-600 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleSubmit('published')}
            disabled={!isPublishReady || isLoading}
          >
            {isSaving || isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

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
          <Card className="border border-neutral-light">
            <CardHeader>
              <CardTitle className="text-neutral-dark">
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Event Details'}
                {currentStep === 3 && 'Review & Publish'}
              </CardTitle>
              <CardDescription className="text-neutral-gray">
                {currentStep === 1 && 'Enter the basic details about your event.'}
                {currentStep === 2 && 'Configure pricing, virtual/physical settings, and visibility.'}
                {currentStep === 3 && 'Review your event before publishing.'}
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
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                className="bg-primary hover:bg-primary-600 text-white cursor-pointer transition-colors"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary-600 text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSubmit('published')}
                  disabled={!isPublishReady || isLoading}
                >
                  {isSaving || isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Desktop Preview */}
        {!isMobile && currentStep !== 3 && (
          <div className="sticky top-24 h-fit space-y-4">
            <Card className="border border-neutral-light">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-neutral-dark">Live Preview</CardTitle>
                    <CardDescription className="text-neutral-gray">Real-time preview of your event</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EventPreviewCard data={formData} eventType={selectedEventType?.name} />
              </CardContent>
            </Card>

            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
              <Card className="border border-error-200 bg-error-50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-error-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Please fix the following errors:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-error-600">
                    {Object.values(errors).map((message, index) => (
                      <li key={index} className="flex items-center gap-1">
                        • {message}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Publish Readiness Indicator */}
            <Card className={cn(
              "border",
              isPublishReady ? "border-tertiary-200 bg-tertiary-50" : "border-neutral-light"
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-sm">
                  {isPublishReady ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-tertiary-500" />
                      <span className="text-tertiary-700">Ready to publish</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-700">Complete all required fields to publish</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border border-neutral-light">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-neutral-dark flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-secondary-500" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-gray">
                <p>• Use a clear, descriptive event name</p>
                <p>• Add a detailed description to attract attendees</p>
                <p>• Set realistic ticket prices</p>
                <p>• Include all relevant links and location details</p>
                <p>• Mark as <strong>Featured</strong> to highlight on homepage</p>
                <p>• Mark as <strong>Private</strong> to hide from public listings</p>
                <p>• Auto-save saves your work after 2 seconds of inactivity</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {isMobile && (
        <PreviewModal 
          open={isPreviewModalOpen}
          onOpenChange={setIsPreviewModalOpen}
          data={formData}
          eventType={selectedEventType?.name}
        />
      )}

      {/* Success Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neutral-dark">
              <CheckCircle2 className="h-6 w-6 text-tertiary-500" />
              {isPublished ? 'Event Published' : 'Draft Saved'}
            </DialogTitle>
            <DialogDescription className="text-neutral-gray">
              {isPublished 
                ? 'Your event has been published and is now visible to attendees.'
                : 'Your event has been saved as a draft. You can publish it anytime.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="w-full p-4 bg-neutral-light rounded-lg border border-neutral-light">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-neutral-dark">{formData.name || 'Untitled Event'}</p>
                  <p className="text-sm text-neutral-gray">
                    {formData.date || 'TBD'} • {selectedEventType?.name || 'No type'}
                  </p>
                </div>
                <Badge variant="outline" className={cn(
                  isPublished ? 'text-tertiary-600 border-tertiary-200 bg-tertiary-50' : 'text-neutral-gray border-neutral-light bg-neutral-light'
                )}>
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              {(formData.is_featured || formData.is_private) && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.is_featured && (
                    <Badge variant="default" className="bg-secondary-500 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {formData.is_private && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1 cursor-pointer hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
                onClick={() => {
                  setIsSaveDialogOpen(false);
                  router.push('/dashboard/events');
                }}
              >
                Go to Events
              </Button>
              {isPublished && createdEventId && (
                <Button 
                  className="flex-1 bg-primary hover:bg-primary-600 text-white cursor-pointer transition-colors"
                  onClick={() => {
                    setIsSaveDialogOpen(false);
                    router.push(`/dashboard/events/${createdEventId}`);
                  }}
                >
                  View Event
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              className="w-full cursor-pointer hover:bg-primary-50 hover:text-primary transition-colors"
              onClick={() => {
                setIsSaveDialogOpen(false);
                if (!isPublished) {
                  setFormData(defaultFormData);
                  setImagePreview(null);
                  setImageFile(null);
                  setErrors({});
                  setTouched({});
                  setDraftId(null);
                  localStorage.removeItem(STORAGE_KEY);
                  setCurrentStep(1);
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