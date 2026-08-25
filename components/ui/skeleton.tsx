// components/ui/skeleton.tsx

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
}

function Skeleton({ 
  className, 
  variant = 'default', 
  width, 
  height,
  style,
  ...props 
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
    card: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200/70",
        variantClasses[variant],
        className
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
        ...style,
      }}
      {...props}
    />
  );
}

// Export individual variants for convenience
const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
  <Skeleton variant="card" className={cn("h-48", className)} {...props} />
);

const SkeletonText = ({ className, ...props }: SkeletonProps) => (
  <Skeleton variant="text" className={cn("h-4 w-full", className)} {...props} />
);

const SkeletonAvatar = ({ className, ...props }: SkeletonProps) => (
  <Skeleton variant="circular" className={cn("h-12 w-12", className)} {...props} />
);

export { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar };