// app/(dashboard)/dashboard/me/certificates/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { Award, RefreshCw, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetMyCertificatesQuery } from '@/lib/store/api/certificatesApi';

import { CertificateCard } from './_components/CertificateCard';
import { CertificateEmpty } from './_components/CertificateEmpty';
import { CertificateSkeleton } from './_components/CertificateSkeleton';

type StatusFilter = 'all' | 'active' | 'revoked';

export default function MyCertificatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyCertificatesQuery({ limit: 100, offset: 0 });

  const certificates = data?.data?.certificates ?? [];

  // ---- Filter (client-side for search + status) ----
  const filtered = useMemo(() => {
    let list = certificates;

    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const title = (c.metadata?.context_title ?? '').toLowerCase();
        const issuer = (c.metadata?.issuer_name ?? '').toLowerCase();
        return (
          title.includes(q) ||
          issuer.includes(q) ||
          c.verification_code.toLowerCase().includes(q) ||
          c.recipient_name.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [certificates, searchQuery, statusFilter]);

  const hasFilters = searchQuery.trim().length > 0 || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  // ---- Error ----
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md border-destructive/30">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load certificates. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Award className="h-6 w-6 text-primary" />
            My Certificates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Certificates you have earned and can download.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer self-start"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      {!isLoading && certificates.length > 0 && (
        <Card className="border-border">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, issuer, or code…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:bg-muted"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-full cursor-pointer sm:w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  All statuses
                </SelectItem>
                <SelectItem value="active" className="cursor-pointer">
                  Active
                </SelectItem>
                <SelectItem value="revoked" className="cursor-pointer">
                  Revoked
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <CertificateSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <CertificateEmpty hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {filtered.length} certificate{filtered.length === 1 ? '' : 's'}
            {hasFilters && ` (of ${certificates.length})`}
          </p>
        </>
      )}
    </div>
  );
}