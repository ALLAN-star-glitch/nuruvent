// components/events/fields/schedule/SinglePlatformHeader.tsx

import Image from 'next/image';
import type { PlatformMeta } from '../../video/PlatformPickerModal';

export function SinglePlatformHeader({
  platform,
  connection,
  hasMeeting,
  isSelected,
}: {
  platform: PlatformMeta;
  connection: { external_email?: string } | undefined | null;
  hasMeeting: boolean;
  isSelected: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center p-1.5 shrink-0">
        <Image
          src={platform.logo}
          alt={`${platform.label} logo`}
          width={32}
          height={32}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-foreground">
          {hasMeeting
            ? 'Meeting is linked'
            : isSelected
              ? 'Meeting will be created automatically'
              : `Use ${platform.label} for this session`}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Using your {platform.label} account
          {connection?.external_email && (
            <>
              {' '}
              <span className="font-medium text-foreground">
                {connection.external_email}
              </span>
            </>
          )}
          .{' '}
          {hasMeeting
            ? 'Changes to this session update the meeting — the join link stays the same.'
            : isSelected
              ? 'The join link appears here when you publish.'
              : 'Select it above to enable meeting creation.'}
        </p>
      </div>
    </div>
  );
}