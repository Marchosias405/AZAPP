export const APP_NAME = "AZ-900 Bus Prep";

export const APP_DESCRIPTION =
  "A mobile-first AZ-900 study app for mock exams, mistake tracking, progress history, validated AI question generation, and memory hooks.";

export const PART_LABEL =
  "Part 22: Save reviewed questions";

export const CURRENT_PROGRESS_TITLE =
  "Save reviewed questions to Supabase";

export const CURRENT_PROGRESS_DESCRIPTION =
  "Generate a question with Gemini, check the answer and explanation, then confirm your review to save the edited question.";

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
  "Editable AI question preview and regeneration workflow complete",
  "Reviewed question and answer choices saved together in Supabase",
] as const;
