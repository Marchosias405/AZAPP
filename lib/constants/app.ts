export const APP_NAME = "AZ-900 Bus Prep";

export const APP_DESCRIPTION =
  "A mobile-first AZ-900 study app for mock exams, mistake tracking, progress history, validated AI question generation, and memory hooks.";

export const PART_LABEL =
  "Part 21: Question Generation Preview";

export const CURRENT_PROGRESS_TITLE =
  "AI question generation and editing are ready";

export const CURRENT_PROGRESS_DESCRIPTION =
  "The app can now generate one structured AZ-900-style question with Gemini, preview every generated field, rerun deterministic validation after edits, regenerate the draft, or discard it. Generated questions remain temporary and are not saved automatically.";

export const NEXT_PART_LABEL =
  "Next: Save reviewed questions";

export const NEXT_PART_DESCRIPTION =
  "Next, add a controlled save workflow so a reviewed and valid generated question can be stored without allowing unreviewed AI output into the question bank.";

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
] as const;