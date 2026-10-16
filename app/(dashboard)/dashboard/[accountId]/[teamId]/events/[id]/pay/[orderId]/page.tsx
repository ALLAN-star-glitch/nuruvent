// app/(dashboard)/dashboard/[accountId]/[teamId]/events/[id]/pay/[orderId]/page.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  useGetOrderQuery,
  useGetPaymentQuery,
  useInitiatePaymentMutation,
} from '@/lib/store/api/paymentsApi';
import { certificatesApi } from '@/lib/store/api/certificatesApi';
import { useAppSelector } from '@/lib/store/hooks';
import { selectUser } from '@/lib/store/slices/authSlice';

import { CardForm } from './_components/CardForm';
import { MpesaForm } from './_components/MpesaForm';
import { PaymentMethodPicker } from './_components/PaymentMethodPicker';
import { PollingView } from './_components/PollingView';
import { ErrorState, LoadingState, SuccessState } from './_components/PaymentState';
import { OrderSummary } from './_components/OderSummary';

// ============================================================
// PAYSTACK LOADER
// ============================================================

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

export default function CertificatePaymentPage() {
  const params = useParams<{
    accountId: string;
    teamId: string;
    id: string;
    orderId: string;
  }>();
  const { accountId, teamId, id: eventId, orderId } = params;

  const dispatch = useDispatch();

  const [method, setMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phone, setPhone] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const user = useAppSelector(selectUser);
  const authEmail = user?.email ?? '';

  // Prefill payer email from auth once it hydrates.
  useEffect(() => {
    if (authEmail) setPayerEmail((prev) => prev || authEmail);
  }, [authEmail]);

  const {
    data: orderRes,
    isLoading: orderLoading,
    error: orderError,
  } = useGetOrderQuery(orderId, { skip: !orderId });

  const [initiatePayment] = useInitiatePaymentMutation();

  const { data: paymentRes } = useGetPaymentQuery(paymentId ?? '', {
    skip: !paymentId,
    pollingInterval: 3000,
  });

  const order = orderRes?.data;

  const backHref = `/dashboard/${accountId}/${teamId}/events/${eventId}/certificates`;
  const successHref = backHref;

  // ---- Extract batch info ----
  const batchInfo = useMemo(() => {
    if (!order) return null;
    const anyOrder = order as any;

    const attendeeCount =
      anyOrder.batch_attendee_count ??
      anyOrder.batch_context?.attendee_count ??
      anyOrder.attendee_count ??
      0;

    const totalMinor = order.total_amount ?? 0;

    const pricePerCert =
      anyOrder.batch_context?.price_per_cert_minor ??
      (attendeeCount > 0
        ? Math.round(totalMinor / attendeeCount)
        : totalMinor);

    const eventTitle =
      anyOrder.batch_context?.event_title ??
      anyOrder.metadata?.context_title ??
      'Certificate batch';

    return { attendeeCount, totalMinor, pricePerCert, eventTitle };
  }, [order]);

  // ---- Handle payment status ----
  //
  // On success, the backend webhook runs asynchronously to issue the
  // certificate batch. Fire the certificate-list invalidation immediately
  // and again after a short delay — the first refetch may land before
  // the webhook finishes; the retries catch it.
  useEffect(() => {
    const payment = paymentRes?.data;
    if (!payment) return;

    if (payment.status === 'succeeded') {
      const invalidate = () =>
        dispatch(
          certificatesApi.util.invalidateTags([
            { type: 'Certificates', id: `ACCOUNT_${accountId}` },
          ]),
        );

      invalidate();
      const t1 = setTimeout(invalidate, 3000);
      const t2 = setTimeout(invalidate, 6000);

      setSucceeded(true);
      setPaymentId(null);
      setSubmitting(false);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (payment.status === 'failed') {
      setError(payment.failure_reason || 'Payment failed. Please try again.');
      setPaymentId(null);
      setSubmitting(false);
    }
  }, [paymentRes, dispatch, accountId]);

  // ---- Guards ----
  if (orderLoading || !order) {
    if (orderError) {
      return (
        <ErrorState
          title="Order not found"
          message="This order may have expired, or the link is invalid."
          backHref={backHref}
          backLabel="Back to certificates"
        />
      );
    }
    return <LoadingState message="Loading order…" />;
  }

  if (!batchInfo) {
    return <LoadingState />;
  }

  if (succeeded) {
    return (
      <SuccessState
        eventTitle={batchInfo.eventTitle}
        attendeeCount={batchInfo.attendeeCount}
        redirectHref={successHref}
      />
    );
  }

  const showPolling = !!paymentId;

  // ---- Pay handler ----
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (method === 'mpesa' && !phone.trim()) {
      setError('Please enter your M-Pesa phone number.');
      return;
    }

    if (method === 'card' && !payerEmail.trim()) {
      setError('Please enter an email address for your card receipt.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payRes = await initiatePayment({
        order_id: order.id,
        method,
        payer_phone: method === 'mpesa' ? phone.trim() : undefined,
        payer_email: method === 'card' ? payerEmail.trim() : undefined,
        idempotency_key:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        description: `Certificate batch — ${batchInfo.eventTitle}`,
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
          onSuccess: () => {
            // Wait for the webhook to confirm — start polling.
            setPaymentId(payment.id);
            setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href={backHref}
              className="group inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to certificates</span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold tracking-wide">
                Secure checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {showPolling ? 'Authorizing payment' : 'Complete your purchase'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {showPolling
              ? 'Please respond to the prompt sent to your mobile phone.'
              : 'Review the batch and select a payment method.'}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: form */}
          <div className="space-y-6 lg:col-span-7">
            {showPolling ? (
              <PollingView phone={phone} />
            ) : (
              <form onSubmit={handlePay} className="space-y-6">
                <PaymentMethodPicker value={method} onChange={setMethod} />

                {method === 'mpesa' && (
                  <MpesaForm
                    phone={phone}
                    onChange={(v) => {
                      setPhone(v);
                      setError('');
                    }}
                    disabled={submitting}
                  />
                )}

                {method === 'card' && (
                  <CardForm
                    email={payerEmail}
                    onEmailChange={(v) => {
                      setPayerEmail(v);
                      setError('');
                    }}
                    disabled={submitting}
                  />
                )}

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-12 w-full cursor-pointer rounded-xl text-base font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing request…
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pay {order.currency}{' '}
                      {(batchInfo.totalMinor / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                eventTitle={batchInfo.eventTitle}
                attendeeCount={batchInfo.attendeeCount}
                pricePerCertMinor={batchInfo.pricePerCert}
                totalMinor={batchInfo.totalMinor}
                currency={order.currency}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}