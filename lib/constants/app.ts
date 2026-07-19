export const APP_NAME = "AZ-900 Bus Prep";

export const APP_DESCRIPTION =
  "A mobile-first AZ-900 study app for mock exams, mistake tracking, progress history, validation, and memory hooks.";

export const PART_LABEL = "Part 18: Local Question Validation";

export const CURRENT_PROGRESS_TITLE =
  "Local question validation is connected";

export const CURRENT_PROGRESS_DESCRIPTION =
  "Every local question can now be checked for required fields, supported AZ-900 topics, answer consistency, duplicate options, and other deterministic rules.";

export const NEXT_PART_LABEL = "Part 19: Supabase Foundation";

export const NEXT_PART_DESCRIPTION =
  "Next, add version-controlled Supabase configuration and database migrations before moving local questions or exam attempts into cloud storage.";

export const BUILD_STATUS_ITEMS = [
  "Mobile-first dashboard and app shell complete",
  "Local mock exam grading and results complete",
  "Mistakes Only practice and latest-mistakes review complete",
  "Local question search and filtering complete",
  "Question reporting and disabled-question controls complete",
  "Disabled questions excluded from local exams",
  "Mastered questions stored and deprioritized in exams",
  "Local exam attempt history and aggregate stats complete",
  "Zod-based local question validation complete",
] as const;