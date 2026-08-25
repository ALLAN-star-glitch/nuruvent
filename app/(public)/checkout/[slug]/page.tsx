/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/checkout/[slug]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  CheckCircle,
  Loader2,
  AlertCircle,
  Shield,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Video,
  Globe,
  Phone,
  User,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useAppSelector } from '@/lib/store/hooks';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ✅ Helper to format price
const formatPrice = (price: number) => {
  if (price === 0) return 'Free';
  return `KSh ${price.toLocaleString()}`;
};

type PaymentMethod = 'mpesa' | 'card' | 'airtel_money' | null;

interface PaymentFormData {
  mpesaPhone?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
  airtelPhone?: string;
}

// ✅ Skeleton Loading Component
function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded-full" />
              <Skeleton className="h-4 w-24 sm:w-32 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-8 w-48 rounded" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { data: event, isLoading, error } = useGetEventBySlugQuery(slug, {
    skip: !slug,
  });

  const { user, account, isAuthenticated } = useAppSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({});

  // ✅ Pre-fill with user details
  useEffect(() => {
    if (isAuthenticated && account) {
      const phone = account.phone || user?.phone || '';
      const name = account.display_name || account.name || user?.name || '';
      
      setFormData((prev) => ({
        ...prev,
        mpesaPhone: phone || prev.mpesaPhone,
        airtelPhone: phone || prev.airtelPhone,
        cardName: name || prev.cardName,
      }));
    }
  }, [isAuthenticated, account, user]);

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [isAuthenticated, isLoading, router]);

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
    setPaymentError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPaymentError(null);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      setPaymentError('Please select a payment method');
      return;
    }

    // Validate based on payment method
    if (paymentMethod === 'mpesa' && !formData.mpesaPhone) {
      setPaymentError('Please enter your M-Pesa phone number');
      return;
    }
    if (paymentMethod === 'airtel_money' && !formData.airtelPhone) {
      setPaymentError('Please enter your Airtel Money phone number');
      return;
    }
    if (paymentMethod === 'card' && (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv || !formData.cardName)) {
      setPaymentError('Please fill in all card details');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // TODO: Replace with actual payment API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsProcessing(false);

      // ✅ Redirect directly to booking confirmation page
      router.push(`/booking-confirmation?event=${event?.slug}`);
      
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const totalPrice = event ? event.price + (event.certificate_price > 0 ? event.certificate_price : 0) : 0;

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Event Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">
            The event you&apos;re trying to checkout for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/')} className="cursor-pointer">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Payment Methods Configuration
  const paymentMethods = [
    {
      id: 'mpesa',
      label: 'M-Pesa',
      imageUrl: '/payment-logos/mpesa.jpeg',
      description: 'Mobile money',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      selectedBg: 'ring-2 ring-emerald-500 border-emerald-500',
    },
    {
      id: 'card',
      label: 'Card',
      imageUrl: '/payment-logos/card.png',
      description: 'Visa, Mastercard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      selectedBg: 'ring-2 ring-blue-500 border-blue-500',
    },
    {
      id: 'airtel_money',
      label: 'Airtel Money',
      imageUrl: '/payment-logos/airtel-money.png',
      description: 'Airtel money',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      selectedBg: 'ring-2 ring-red-500 border-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50/50">
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-neutral-500 hover:text-neutral-900 transition-all duration-200 group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium hidden sm:inline">Back to Event</span>
              <span className="font-medium sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs sm:text-sm text-green-600 font-medium hidden sm:inline">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                  Complete Your Payment
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Choose your preferred payment method to secure your spot
                </p>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Methods - Horizontal Grid */}
                <div>
                  <Label className="text-sm font-medium text-neutral-700 block mb-3">
                    Select Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={paymentMethod || ''}
                    onValueChange={handlePaymentMethodChange}
                    className="grid grid-cols-3 gap-4"
                  >
                    {paymentMethods.map((method) => {
                      const isSelected = paymentMethod === method.id;
                      return (
                        <div
                          key={method.id}
                          className={cn(
                            "relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-white min-h-[140px]",
                            isSelected
                              ? method.selectedBg
                              : cn("border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50", method.borderColor)
                          )}
                          onClick={() => handlePaymentMethodChange(method.id)}
                        >
                          <RadioGroupItem 
                            value={method.id} 
                            id={method.id} 
                            className="absolute top-2 right-2 opacity-0 pointer-events-none" 
                          />
                          
                          {/* Payment Logo */}
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5">
                            <Image
                              src={method.imageUrl}
                              alt={method.label}
                              width={64}
                              height={64}
                              className="object-contain w-full h-full"
                              priority
                            />
                          </div>
                          
                          <Label htmlFor={method.id} className="font-semibold text-neutral-900 cursor-pointer text-base">
                            {method.label}
                          </Label>
                          <p className="text-xs text-neutral-500">{method.description}</p>
                          
                          {/* Selected checkmark */}
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <div className="bg-green-500 rounded-full p-0.5 shadow-md">
                                <CheckCircle className="h-5 w-5 text-white fill-green-500" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Dynamic Payment Form */}
                {paymentMethod && (
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 space-y-4">
                    <h4 className="font-semibold text-neutral-900">
                      {paymentMethods.find(m => m.id === paymentMethod)?.label} Details
                    </h4>
                    <Separator />

                    {paymentMethod === 'mpesa' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="mpesaPhone" className="text-sm font-medium">
                          M-Pesa Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <Input
                            id="mpesaPhone"
                            name="mpesaPhone"
                            type="tel"
                            placeholder="0712345678"
                            value={formData.mpesaPhone || ''}
                            onChange={handleInputChange}
                            className="pl-10 h-11 text-sm"
                          />
                        </div>
                        <p className="text-xs text-neutral-500">
                          You will receive a prompt on your phone to confirm the payment
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'airtel_money' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="airtelPhone" className="text-sm font-medium">
                          Airtel Money Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <Input
                            id="airtelPhone"
                            name="airtelPhone"
                            type="tel"
                            placeholder="0712345678"
                            value={formData.airtelPhone || ''}
                            onChange={handleInputChange}
                            className="pl-10 h-11 text-sm"
                          />
                        </div>
                        <p className="text-xs text-neutral-500">
                          You will receive a prompt on your phone to confirm the payment
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="cardName" className="text-sm font-medium">
                            Cardholder Name <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              id="cardName"
                              name="cardName"
                              placeholder="John Doe"
                              value={formData.cardName || ''}
                              onChange={handleInputChange}
                              className="pl-10 h-11 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="cardNumber" className="text-sm font-medium">
                            Card Number <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber || ''}
                              onChange={handleInputChange}
                              className="pl-10 h-11 text-sm font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="cardExpiry" className="text-sm font-medium">
                              Expiry Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="cardExpiry"
                              name="cardExpiry"
                              placeholder="MM/YY"
                              value={formData.cardExpiry || ''}
                              onChange={handleInputChange}
                              className="h-11 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="cardCvv" className="text-sm font-medium">
                              CVV <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="cardCvv"
                              name="cardCvv"
                              type="password"
                              placeholder="123"
                              value={formData.cardCvv || ''}
                              onChange={handleInputChange}
                              className="h-11 text-sm font-mono"
                              maxLength={4}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <Shield className="h-3.5 w-3.5" />
                          <span>Your card details are encrypted and secure</span>
                        </div>
                      </div>
                    )}

                    {paymentError && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {paymentError}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isProcessing || !paymentMethod}
                  className={cn(
                    "w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 cursor-pointer",
                    "bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/30 hover:shadow-primary-500/40",
                    isProcessing && "opacity-70 cursor-not-allowed hover:shadow-lg"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      Pay {formatPrice(totalPrice)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-neutral-400">
                  Your payment is secure and encrypted. We do not store your payment details.
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="border-neutral-200/60 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500/5 to-primary-500/10 px-5 py-4 border-b border-neutral-200/30">
                  <h3 className="font-semibold text-neutral-900">Order Summary</h3>
                </div>
                <CardContent className="p-5 space-y-4">
                  {/* Event Image */}
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-neutral-100">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.display_name || event.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 to-neutral-100">
                        <Globe className="h-8 w-8 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 line-clamp-2">
                      {event.display_name || event.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <Clock className="h-3.5 w-3.5 ml-1" />
                      <span>{event.time || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{event.is_virtual ? 'Virtual' : event.location || 'TBD'}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Registration Fee</span>
                      <span className="font-medium text-neutral-900">{formatPrice(event.price)}</span>
                    </div>
                    {event.certificate_price > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Certificate Fee</span>
                        <span className="font-medium text-neutral-900">{formatPrice(event.certificate_price)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-neutral-900">Total</span>
                      <span className="font-bold text-primary-600">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  <div className="space-y-1.5 text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {event.current_attendees || 0} attendees • {event.max_attendees > 0 ? `${event.max_attendees - event.current_attendees} spots left` : 'Unlimited spots'}
                      </span>
                    </div>
                    {event.is_virtual && (
                      <div className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5" />
                        <span>Virtual Event</span>
                      </div>
                    )}
                    {event.is_featured && (
                      <div className="flex items-center gap-2">
                        <Award className="h-3.5 w-3.5 text-secondary-500" />
                        <span className="text-secondary-600">Featured Event</span>
                      </div>
                    )}
                  </div>

                  {/* Secure Checkout Badge */}
                  <div className="flex items-center justify-center gap-2 pt-2 text-xs text-neutral-400 border-t border-neutral-100">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Secure Checkout</span>
                    <span className="w-px h-3 bg-neutral-300" />
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Powered by Nuruvent</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}