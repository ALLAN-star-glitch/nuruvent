'use client';

import { RegistrationsList } from "./_components/RegistrationsList";



export default function RegistrationsPage() {
  return (
    <div className="space-y-5 pb-44 md:pb-20">
      {/* Header */}
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Registration center
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Registrations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage registrations for your events.
        </p>
      </div>

      <RegistrationsList />
    </div>
  );
}