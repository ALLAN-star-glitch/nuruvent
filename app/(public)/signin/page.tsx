// app/(public)/signin/page.tsx

import { SignInForm } from './SignInForm';

export const metadata = {
  title: 'Sign In | Nuruvent',
  description: 'Sign in to your Nuruvent account. Access your events, certificates, and dashboard.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function SignInPage() {
  return <SignInForm />;
}