// app/(public)/signup/page.tsx

import { SignUpForm } from "../../../components/registration/SignupForm";


export const metadata = {
  title: 'Sign Up | Nuruvent',
  description: 'Create your Nuruvent account. Join as a host or attendee and start managing training events in Kenya.',
};

export const dynamic = 'force-static';
export const revalidate = false;

export default function SignUpPage() {
  return <SignUpForm />;
}