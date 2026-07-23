import { z } from "zod";

import {
  AZ900_ALLOWED_TOPICS,
  AZ900_DOMAINS,
  QUESTION_DIFFICULTIES,
  QUESTION_TYPES,
} from "@/lib/constants/az900Topics";

const requiredText = z
  .string()
  .trim()
  .min(1, "This field cannot be empty.");

export const localQuestionOptionSchema = z
  .object({
    id: requiredText.regex(
      /^[A-Z]$/,
      "Option ID must be one uppercase letter, such as A or B.",
    ),
    text: requiredText,
  })
  .strict();

export const localQuestionSchema = z
  .object({
    id: requiredText,
    domain: z.enum(AZ900_DOMAINS),
    topic: z.enum(AZ900_ALLOWED_TOPICS),
    difficulty: z.enum(QUESTION_DIFFICULTIES),
    questionType: z.enum(QUESTION_TYPES),
    selectCount: z
      .number()
      .int("Select count must be a whole number.")
      .min(1, "Select count must be at least 1.")
      .max(3, "Select count cannot be greater than 3."),
    questionText: requiredText,
    options: z
      .array(localQuestionOptionSchema)
      .min(2, "A question must have at least two answer options."),
    correctAnswerIds: z
      .array(requiredText)
      .min(1, "At least one correct answer is required."),
    explanation: requiredText,
    memoryHook: requiredText,
    sourceBasis: requiredText,
    tags: z
      .array(requiredText)
      .min(1, "At least one tag is required."),
  })
  .strict();

/*
 * AI providers generate the question content only.
 * The application assigns the permanent question ID server-side.
 *
 * This schema is derived from the canonical local-question schema so the
 * application does not maintain a second, conflicting question format.
 */
export const generatedQuestionDraftSchema =
  localQuestionSchema.omit({
    id: true,
  });

export type ValidatedLocalQuestion = z.infer<
  typeof localQuestionSchema
>;

export type ValidatedGeneratedQuestionDraft = z.infer<
  typeof generatedQuestionDraftSchema
>;
