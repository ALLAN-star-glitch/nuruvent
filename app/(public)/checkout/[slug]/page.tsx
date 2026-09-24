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
  Lock,
  ShieldCheck,
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
      existing.addEventListener('error', () =>
        reject(new Error('paystack load failed')),
      );
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

  // ---- Success redirect helper ----
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
      const orderRes = await createOrder({
        registration_id: registration.id,
        guest_email: guestEmail,
      }).unwrap();

      const order = orderRes.data;

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

      if (method === 'card') {
        if (!payment.access_code) {
          setError(
            'Card checkout is temporarily unavailable. Please try M-Pesa or try again.',
          );
          setSubmitting(false);
          return;
        }

        try {
          await loadPaystackScript();
        } catch {
          setError(
            'Could not load card checkout. Check your connection and try again.',
          );
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
        return;
      }

      setPaymentId(payment.id);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Payment could not be started. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const paymentMethods: Array<{
    id: PaymentMethod;
    label: string;
    description: string;
    imageUrl: string;
  }> = [
    {
      id: 'mpesa',
      label: 'M-Pesa',
      description: 'Instant STK Push prompt',
      imageUrl: '/payment-logos/mpesa.jpeg',
    },
    {
      id: 'card',
      label: 'Card',
      description: 'Visa, Mastercard, Amex',
      imageUrl: '/payment-logos/card.png',
    },
  ];

  const showPolling = !!paymentId;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-foreground selection:bg-primary/10">
      {/* Header Navigation */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/80">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Return to event details</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold tracking-wide">
                256-Bit SSL Secured
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Title Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {showPolling ? 'Authorizing Payment' : 'Complete Your Purchase'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {showPolling
              ? 'Please respond to the prompt sent to your mobile phone.'
              : 'Review your order and select your preferred payment option.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Form & Payment Methods */}
          <div className="lg:col-span-7 space-y-8">
            {showPolling ? (
              <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
                <CardContent className="p-8 sm:p-12 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                    <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Smartphone className="h-10 w-10 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-xl mb-2">
                    STK Push Sent to Phone
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
                    Check your phone screen for the M-Pesa prompt and enter your
                    PIN to complete the transaction for{' '}
                    <span className="font-semibold text-foreground">
                      {phone}
                    </span>
                    .
                  </p>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                    <span>
                      Waiting for payment confirmation. Do not close this
                      window.
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handlePay} className="space-y-6">
                {/* Method selector */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Select Payment Method
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
                            'relative flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer bg-card text-left',
                            isSelected
                              ? 'border-primary ring-2 ring-primary/10 bg-primary/[0.02] shadow-sm'
                              : 'border-border/80 hover:border-border hover:bg-muted/40',
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="h-5 w-5 text-primary fill-primary/10" />
                            </div>
                          )}
                          <div className="relative w-12 h-12 rounded-md bg-white p-1 border border-border/40 shadow-xs mb-3 flex items-center justify-center overflow-hidden">
                            <Image
                              src={m.imageUrl}
                              alt={m.label}
                              width={48}
                              height={48}
                              className="object-contain max-h-full"
                            />
                          </div>
                          <span className="font-semibold text-foreground text-sm">
                            {m.label}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {m.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form controls based on selection */}
                {method === 'mpesa' && (
                  <Card className="border-border/80 shadow-xs bg-card">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">
                          M-Pesa Phone Number
                        </h4>
                      </div>
                      <Separator className="bg-border/60" />
                      <div className="space-y-2">
                        <Label
                          htmlFor="mpesaPhone"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Enter active M-Pesa registered number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="mpesaPhone"
                            type="tel"
                            placeholder="254712345678"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              setError('');
                            }}
                            className="pl-10 h-11 text-sm bg-background"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          An STK push authorization prompt will be delivered
                          directly to this phone.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {method === 'card' && (
                  <Card className="border-border/80 shadow-xs bg-card">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">
                          Debit or Credit Card
                        </h4>
                      </div>
                      <Separator className="bg-border/60" />
                      <div className="flex items-start gap-3 text-sm text-muted-foreground pt-1">
                        <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-foreground text-sm">
                            Secure Modal Checkout
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Clicking the pay button below will trigger a secure
                            Paystack gateway popup to finalize card details safely.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {error && (
                  <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className={cn(
                    'w-full h-12 text-base font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
                    submitting && 'opacity-70 cursor-not-allowed',
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay {formatPrice(total)}
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Embedded Trust / Security Section */}
            {!showPolling && (
              <div className="pt-2">
                <Image
                  src="/checkout-banner.png"
                  alt="Secure checkout powered by Paystack"
                  width={1200}
                  height={320}
                  className="w-full h-auto rounded-xl border border-border/60 shadow-xs"
                  priority
                />
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Card className="border-border/80 shadow-md overflow-hidden bg-card">
                <div className="px-6 py-4 border-b border-border/80 bg-muted/40 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm">
                    Order Summary
                  </h3>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    #{registration.registration_number}
                  </span>
                </div>
                <CardContent className="p-6 space-y-5">
                  {/* Event graphic and title */}
                  <div className="flex gap-4 items-center">
                    <div className="relative h-16 w-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.display_name || event.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <Globe className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                        {event.display_name || event.name}
                      </h4>
                      {event.start_date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {event.is_virtual
                            ? 'Virtual Event'
                            : event.in_person_location ||
                              event.venue?.city ||
                              'Location TBD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Customer Details */}
                  {registration.guest && (
                    <div className="text-xs space-y-1.5">
                      <span className="text-muted-foreground block font-medium">
                        Attendee Details
                      </span>
                      <p className="text-foreground font-medium truncate">
                        {registration.guest.name}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {registration.guest.email}
                      </p>
                    </div>
                  )}

                  <Separator className="bg-border/60" />

                  {/* Line Items */}
                  <div className="space-y-2.5">
                    {registration.selections.map((sel, i) => (
                      <div
                        key={`${sel.ticket_type_id}-${i}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground text-xs">
                          {sel.quantity} × Ticket
                        </span>
                        <span className="font-medium text-foreground text-xs">
                          {formatPrice(sel.line_total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Price Calculations */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        Subtotal
                      </span>
                      <span className="font-medium text-foreground text-xs">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          Discount
                        </span>
                        <span className="font-medium text-emerald-600 text-xs">
                          −{formatPrice(discount)}
                        </span>
                      </div>
                    )}
                    <Separator className="bg-border/60" />
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-foreground text-sm">
                        Total Due
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground border-t border-border/40">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span>Guaranteed Safe Checkout</span>
                    <span>•</span>
                    <Sparkles className="h-3 w-3 text-muted-foreground" />
                    <span>Nuruvent</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}