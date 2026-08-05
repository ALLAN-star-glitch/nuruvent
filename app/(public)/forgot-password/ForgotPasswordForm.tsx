

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement password reset logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🕯️</span>
            <span className="text-2xl font-bold text-primary">NURUVENT</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Reset Password</h1>
          <p className="text-gray-600 mt-1">
            {isSent 
              ? 'Check your email for the reset link' 
              : 'Enter your email to receive a reset link'
            }
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          {isSent ? (
            // Success State
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary/10 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-tertiary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600 mb-6">
                We&apos;ve sent a password reset link to <strong className="text-gray-900">{email}</strong>
              </p>
              <Link href="/signin">
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-5 rounded-xl transition-all w-full">
                  Back to Sign In
                </Button>
              </Link>
              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail('');
                }}
                className="block text-sm text-primary hover:underline mt-4 cursor-pointer"
              >
                Send again
              </button>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  We&apos;ll send a password reset link to this email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Link
                href="/signin"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}