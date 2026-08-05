// app/(public)/forgot-password/page.tsx

import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | Nuruvent',
  description: 'Reset your Nuruvent password. Enter your email address and we\'ll send you a reset link.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}