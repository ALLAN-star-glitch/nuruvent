// components/ui/CustomToast.tsx
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomToastProps {
  type: 'success' | 'error' | 'loading';
  message: string;
  description?: string;
}

export function CustomToast({ type, message, description }: CustomToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    loading: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
  };

  const backgrounds = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    loading: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-emerald-800',
    error: 'text-red-800',
    loading: 'text-blue-800',
  };

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border shadow-sm max-w-sm w-full',
      backgrounds[type]
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', textColors[type])}>
          {message}
        </p>
        {description && (
          <p className="text-xs text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}