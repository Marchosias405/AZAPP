export const APP_NAME = "AZ-900 Bus Prep";

export const APP_DESCRIPTION =
  "A mobile-first AZ-900 study app for mock exams, mistake tracking, progress history, validation, and memory hooks.";

export const PART_LABEL = "Part 19: Supabase Foundation";

export const CURRENT_PROGRESS_TITLE =
  "The database foundation is reproducible";

export const CURRENT_PROGRESS_DESCRIPTION =
  "Supabase now has version-controlled migrations, a locally tested AZ-900 schema, generated TypeScript definitions, and separate browser and server client helpers.";

export const NEXT_PART_LABEL = "Part 20: AI Provider Foundation";

export const NEXT_PART_DESCRIPTION =
  "Next, add a provider abstraction and Gemini implementation so question generation stays separate from the user interface and all AI output can be validated before use.";

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
  "Version-controlled Supabase schema and typed clients complete",
] as const;