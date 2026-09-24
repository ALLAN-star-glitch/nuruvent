/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(public)/checkout/[slug]/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
  Shield,
  Sparkles,
  Calendar,
  MapPin,
  Globe,
  Phone,
  Smartphone,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { useGetEventBySlugQuery } from '@/lib/store/api/eventsApi';
import { useGetRegistrationQuery } from '@/lib/store/api/registrationsApi';
import {
  useCreateOrderMutation,
  useInitiatePaymentMutation,
  useGetPaymentQuery,
} from '@/lib/store/api/paymentsApi';

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `KSh ${(price / 100).toLocaleString()}`;
}

type PaymentMethod = 'mpesa' | 'card';

// ---- Paystack Inline V2 loader (runs once) ----
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).PaystackPop) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v2/inline.js"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('paystack load failed')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('paystack load failed'));
    document.body.appendChild(script);
  });
}

// ============================================================
// PAGE
// ============================================================

export default function CheckoutPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const slug = params?.slug as string;
  const registrationId = search.get('registration');
  const emailFromUrl = search.get('email') ?? undefined;

  // ---- Data ----
  const { data: eventRes, isLoading: eventLoading } = useGetEventBySlugQuery(
    slug,
    { skip: !slug },
  );

  const { data: regRes, isLoading: regLoading } = useGetRegistrationQuery(
    { id: registrationId ?? '', guestEmail: emailFromUrl },
    { skip: !registrationId },
  );

  const event = eventRes?.data;
  const registration = regRes?.data;

  // ---- Mutations ----
  const [createOrder] = useCreateOrderMutation();
  const [initiatePayment] = useInitiatePaymentMutation();

  // ---- Local state ----
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // ---- M-Pesa poll ----
  const { data: paymentRes } = useGetPaymentQuery(paymentId ?? '', {
    skip: !paymentId,
    pollingInterval: 3000,
  });

  // ---- Guest email resolution ----
  const guestEmail = useMemo(() => {
    return emailFromUrl ?? registration?.guest?.email ?? undefined;
  }, [emailFromUrl, registration]);

  const payerEmail = useMemo(() => {
    return registration?.guest?.email ?? guestEmail ?? '';
  }, [registration, guestEmail]);

  // ---- M-Pesa success/failure redirect ----
  useEffect(() => {
    const payment = paymentRes?.data;
    if (!payment || !registration) return;

    if (payment.status === 'succeeded') {
      const params = new URLSearchParams({
        reference: payment.id,
        registration: registration.id,
        slug: slug ?? '',
      });
      if (guestEmail) params.set('email', guestEmail);
      router.push(`/booking-confirmation?${params.toString()}`);
    } else if (payment.status === 'failed') {
      setError(payment.failure_reason || 'Payment failed.');
      setPaymentId(null);
      setSubmitting(false);
    }
  }, [paymentRes, router, registration, slug, guestEmail]);

  // ---- Prefill phone ----
  useEffect(() => {
    if (registration?.guest?.phone && !phone) {
      setPhone(registration.guest.phone);
    }
  }, [registration, phone]);

  // ---- Derived totals ----
  const subtotal = registration?.pricing.subtotal ?? 0;
  const discount = registration?.pricing.discount_total ?? 0;
  const total = registration?.pricing.total ?? 0;

  // ---- Guards ----
  if (!registrationId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Missing registration</h2>
          <p className="text-sm text-muted-foreground mb-6">
            The checkout link is missing a registration ID.
          </p>
          <Link href={`/events/${slug}`}>
            <Button className="cursor-pointer">Go back to the event</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (eventLoading || regLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !registration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Registration not found
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            We couldn&apos;t load this registration. It may have expired or been
            cancelled.
          </p>
          <Link href={`/events/${slug}`}>
            <Button className="cursor-pointer">Go back to the event</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ---- Success redirect helper (used by both flows) ----
  const goToConfirmation = (paymentReference: string) => {
    const params = new URLSearchParams({
      reference: paymentReference,
      registration: registration.id,
      slug: slug ?? '',
    });
    if (payerEmail) params.set('email', payerEmail);
    router.push(`/booking-confirmation?${params.toString()}`);
  };

  // ---- Pay handler ----
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'mpesa' && !phone.trim()) {
      setError('Please enter your M-Pesa phone number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Create the order.
      const orderRes = await createOrder({
        registration_id: registration.id,
        guest_email: guestEmail,
      }).unwrap();

      const order = orderRes.data;

      // 2. Initiate the payment.
      const payRes = await initiatePayment({
        order_id: order.id,
        method,
        payer_phone: method === 'mpesa' ? phone : undefined,
        payer_email: payerEmail || undefined,
        idempotency_key:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        description: `${event.display_name || event.name}`,
      }).unwrap();

      const payment = payRes.data;

      // 3a. Card → open Paystack Inline popup.
      if (method === 'card') {
        if (!payment.access_code) {
          setError('Card checkout is temporarily unavailable. Please try M-Pesa or try again.');
          setSubmitting(false);
          return;
        }

        try {
          await loadPaystackScript();
        } catch {
          setError('Could not load card checkout. Check your connection and try again.');
          setSubmitting(false);
          return;
        }

        const PaystackPop = (window as any).PaystackPop;
        if (!PaystackPop) {
          setError('Card checkout is not available in this browser.');
          setSubmitting(false);
          return;
        }

        const popup = new PaystackPop();
        popup.resumeTransaction(payment.access_code, {
          onSuccess: (transaction: { reference: string }) => {
            // The popup completed. Navigate with all context intact.
            goToConfirmation(transaction.reference || payment.id);
          },
          onCancel: () => {
            setError('Payment cancelled. You can try again when ready.');
            setSubmitting(false);
          },
          onError: (err: unknown) => {
            const msg =
              (err as { message?: string })?.message ||
              'Card payment failed. Please try again.';
            setError(msg);
            setSubmitting(false);
          },
        });
        return; // popup takes over
      }

      // 3b. M-Pesa → stay on this page and poll.
      setPaymentId(payment.id);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Payment could not be started. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  // ---- Payment method options ----
  const paymentMethods: Array<{
    id: PaymentMethod;
    label: string;
    description: string;
    icon: typeof Smartphone;
    imageUrl?: string;
  }> = [
    {
      id: 'mpesa',
      label: 'M-Pesa',
      description: 'Mobile money',
      icon: Smartphone,
      imageUrl: '/payment-logos/mpesa.jpeg',
    },
    {
      id: 'card',
      label: 'Card',
      description: 'Visa, Mastercard',
      icon: CreditCard,
      imageUrl: '/payment-logos/card.png',
    },
  ];

  const showPolling = !!paymentId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Nav bar */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-muted-foreground hover:text-foreground transition-all duration-200 group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium hidden sm:inline">
                Back to Event
              </span>
              <span className="font-medium sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs sm:text-sm text-primary font-medium hidden sm:inline">
                Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {showPolling
                    ? 'Waiting for payment'
                    : 'Complete your payment'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {showPolling
                    ? 'Check your phone and enter your M-Pesa PIN to authorize the payment.'
                    : 'Choose your payment method to secure your spot.'}
                </p>
              </div>

              {showPolling ? (
                <Card className="border-border/60">
                  <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 animate-spin text-primary" />
                      <Smartphone className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">
                        Waiting for M-Pesa confirmation
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        If you don&apos;t see a prompt on your phone, check that{' '}
                        <span className="font-medium text-foreground">
                          {phone}
                        </span>{' '}
                        is correct and dial *334# to authorize.
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status updates automatically. Do not close this page.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handlePay} className="space-y-6">
                  {/* Payment method grid */}
                  <div>
                    <Label className="text-sm font-medium text-foreground block mb-3">
                      Select Payment Method{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {paymentMethods.map((m) => {
                        const isSelected = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setMethod(m.id);
                              setError('');
                            }}
                            className={cn(
                              'relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-card min-h-[140px]',
                              isSelected
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/40 hover:bg-accent/30',
                            )}
                          >
                            {m.imageUrl ? (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-background flex items-center justify-center p-1.5">
                                <Image
                                  src={m.imageUrl}
                                  alt={m.label}
                                  width={64}
                                  height={64}
                                  className="object-contain w-full h-full"
                                />
                              </div>
                            ) : (
                              <m.icon className="h-10 w-10 text-primary" />
                            )}
                            <Label className="font-semibold text-foreground cursor-pointer text-base">
                              {m.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {m.description}
                            </p>
                            {isSelected && (
                              <div className="absolute -top-1.5 -right-1.5">
                                <div className="bg-primary rounded-full p-0.5 shadow-md">
                                  <CheckCircle className="h-5 w-5 text-primary-foreground fill-primary" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* M-Pesa phone */}
                  {method === 'mpesa' && (
                    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
                      <h4 className="font-semibold text-foreground">
                        M-Pesa Details
                      </h4>
                      <Separator />
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="mpesaPhone"
                          className="text-sm font-medium"
                        >
                          M-Pesa Phone Number{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="mpesaPhone"
                            type="tel"
                            placeholder="254712345678"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setError('');
                            }}
                            className="pl-10 h-11 text-sm"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter the number registered to your M-Pesa account.
                          Format: 254XXXXXXXXX
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Card info */}
                  {method === 'card' && (
                    <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-3">
                      <h4 className="font-semibold text-foreground">
                        Card Payment
                      </h4>
                      <Separator />
                      <div className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">
                            A secure Paystack window will open
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter your card details in the popup. Your card
                            never touches our servers.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      'w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 cursor-pointer',
                      submitting && 'opacity-70 cursor-not-allowed',
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {method === 'mpesa'
                          ? 'Sending payment request...'
                          : 'Opening secure checkout...'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay {formatPrice(total)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Your payment is secure. We never store card or M-Pesa
                    credentials.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right column — summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="border-border/60 shadow-lg overflow-hidden bg-card">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">
                    Order Summary
                  </h3>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.display_name || event.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 to-muted">
                        <Globe className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground line-clamp-2">
                      {event.display_name || event.name}
                    </h4>
                    {event.start_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {event.is_virtual
                          ? 'Virtual'
                          : event.in_person_location ||
                            event.venue?.city ||
                            'TBD'}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Registration
                      </span>
                      <span className="font-mono text-foreground">
                        {registration.registration_number}
                      </span>
                    </div>
                    {registration.guest && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Guest</span>
                        <span className="text-foreground truncate max-w-[60%] text-right">
                          {registration.guest.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {registration.selections.map((sel, i) => (
                      <div
                        key={`${sel.ticket_type_id}-${i}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {sel.quantity} × ticket
                        </span>
                        <span className="font-medium text-foreground">
                          {formatPrice(sel.line_total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-primary">
                          −{formatPrice(discount)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between text-base">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-bold text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Secure Checkout</span>
                    <span className="w-px h-3 bg-border" />
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