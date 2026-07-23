export const APP_NAME = "AZ-900 Bus Prep";

export const APP_DESCRIPTION =
  "A mobile-first AZ-900 study app for mock exams, mistake tracking, progress history, validated AI question generation, and memory hooks.";

export const PART_LABEL = "Part 20: AI Provider Foundation";

export const CURRENT_PROGRESS_TITLE =
  "Validated server-side AI generation is working";

export const CURRENT_PROGRESS_DESCRIPTION =
  "The app now has a provider-independent AI layer, a server-only Gemini implementation, structured question output, deterministic validation, and a development-only generation endpoint. Generated questions are previewed through the API only and are not saved automatically.";

export const NEXT_PART_LABEL =
  "Next: Question Generation Preview";

export const NEXT_PART_DESCRIPTION =
  "Next, add a mobile-first preview workflow so generated questions can be reviewed and edited before any validated question is saved.";

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
  "Server-side Gemini provider and validated AI generation complete",
] as const;
