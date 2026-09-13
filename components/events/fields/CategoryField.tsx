// components/events/fields/CategoryField.tsx

'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useGetCategoriesQuery } from '@/lib/store/api/eventsApi';
import { FieldWrapper } from '@/components/form/FieldWrapper';
import { FieldBaseProps, fieldId } from '@/components/form/types';



// ============================================================
// CATEGORY FIELD (events)
// ============================================================
//
// Optional event category, loaded from the events categories API.

interface CategoryFieldProps extends FieldBaseProps {
  value: string;
  onChange: (value: string) => void;
}

const NO_CATEGORY = '__none__';

export function CategoryField({
  value,
  onChange,
  error,
  disabled,
  id,
}: CategoryFieldProps) {
  const { data: categoriesResponse, isLoading } = useGetCategoriesQuery();
  const categories = categoriesResponse?.data ?? [];

  return (
    <FieldWrapper
      id={fieldId('category_id', id)}
      label="Category"
      optional
      helper="Helps attendees find your event."
      error={error}
    >
      <Select
        value={value || NO_CATEGORY}
        onValueChange={(v) => onChange(v === NO_CATEGORY ? '' : v)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={cn('cursor-pointer', error && 'border-error-500')}
        >
          <SelectValue placeholder="Choose a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CATEGORY} className="cursor-pointer">
            None
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id} className="cursor-pointer">
              {cat.display_name || cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}