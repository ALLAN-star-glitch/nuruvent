// components/events/fields/ScheduleField.tsx
//
// This file used to contain the full SchedulesField component. It has
// been split into smaller components under ./schedule/ for
// maintainability. This file re-exports the public API so existing
// imports of `{ SchedulesField }` from this path keep working.
//
// New code should import from './schedule/SchedulesField' directly.

export {
  SchedulesField,
  type SchedulesFieldProps,
} from './schedule/SchedulesField';