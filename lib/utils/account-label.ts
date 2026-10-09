// lib/utils/account-label.ts

/**
 * Human-readable account label with the "Account" suffix.
 *
 * The account name is never shown bare — it always carries the
 * "Account" suffix so users read it as a category (whose account
 * this is), not as a person's name or a team name.
 *
 * Fallback chain:
 *   1. display_name  →  "Allan Mathenge Account"
 *   2. name          →  "acme-corp Account"
 *   3. type-based    →  "Personal Account" | "Institution Account"
 *   4. ultimate      →  "Account"
 *
 * Examples:
 *   { display_name: "Allan Mathenge", type: "personal" }
 *     → "Allan Mathenge Account"
 *
 *   { name: "acme-corp", type: "institution" }
 *     → "acme-corp Account"
 *
 *   { type: "personal" }             // both name fields empty
 *     → "Personal Account"
 *
 *   null | undefined
 *     → "Account"
 */
export function accountLabel(
  account:
    | {
        name?: string | null;
        display_name?: string | null;
        type?: string | null;
      }
    | null
    | undefined,
): string {
  if (!account) return 'Account';

  const raw = (account.display_name || account.name || '').trim();
  if (raw) return `${raw} Account`;

  const isPersonal = (account.type ?? '').includes('personal');
  return isPersonal ? 'Personal Account' : 'Institution Account';
}