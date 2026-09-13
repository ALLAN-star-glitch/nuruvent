// components/form/types.ts

// ============================================================
// SHARED FIELD PROPS
// ============================================================
//
// Every generic field component extends FieldBaseProps. This keeps
// the public surface consistent across every form in the app —
// events, certificates, courses, wherever.
//
// - `error`    — validation message to display (if any)
// - `disabled` — lock the input (e.g. editing a published record)
// - `id`       — override the default `field-<name>` wrapper id.
//                Useful if the same field ever renders twice on a page.

export interface FieldBaseProps {
  error?: string;
  disabled?: boolean;
  id?: string;
}

/** Derive a wrapper DOM id, honoring an explicit override. */
export function fieldId(name: string, override?: string): string {
  return override ?? `field-${name}`;
}