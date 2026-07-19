export const APP_NAME = "AZ-900 Bus Prep";

export const APP_DESCRIPTION =
  "A mobile-first AZ-900 study app for mock exams, mistake tracking, progress history, and memory hooks.";

export const PART_LABEL = "Part 17: Dashboard Status Cleanup";

export const CURRENT_PROGRESS_TITLE = "Local study workflow is connected";

export const CURRENT_PROGRESS_DESCRIPTION =
  "Mock exams, mistakes practice, question management, mastered-question prioritization, and local attempt history are now working together.";

export const NEXT_PART_LABEL = "Part 18: Local Question Validation";

export const NEXT_PART_DESCRIPTION =
  "Next, add Zod-based question validation so malformed or unsupported questions can be detected before AI generation and Supabase storage are introduced.";

export const BUILD_STATUS_ITEMS = [
  "Mobile-first dashboard and app shell complete",
  "Local mock exam grading and results complete",
  "Mistakes Only practice and latest-mistakes review complete",
  "Local question search and filtering complete",
  "Question reporting and disabled-question controls complete",
  "Disabled questions excluded from local exams",
  "Mastered questions stored and deprioritized in exams",
  "Local exam attempt history and aggregate stats complete",
] as const;