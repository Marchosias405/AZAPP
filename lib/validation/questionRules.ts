import type { QuestionType } from "@/lib/exam/types";
import {
  localQuestionSchema,
  type ValidatedLocalQuestion,
} from "@/lib/validation/questionSchema";

export type QuestionValidationIssue = {
  path: string;
  message: string;
};

export type QuestionValidationResult = {
  questionId: string;
  questionText: string;
  isValid: boolean;
  issues: QuestionValidationIssue[];
};

export type QuestionBankValidationSummary = {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  results: QuestionValidationResult[];
};

export const EXPECTED_SELECT_COUNTS: Record<QuestionType, number> = {
  "single-answer": 1,
  "choose-2": 2,
  "choose-3": 3,
  scenario: 1,
  "common-confusion": 1,
};

const FORBIDDEN_OPTION_TEXT = new Set([
  "all of the above",
  "none of the above",
]);

const FORBIDDEN_REAL_EXAM_CLAIMS = [
  "real exam question",
  "actual exam question",
  "official exam question",
  "exam dump",
  "exam-dump",
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeOptionText(value: string): string {
  return normalizeText(value).replace(/[.!?]+$/g, "");
}

function getDisplayValue(
  value: unknown,
  key: string,
  fallback: string,
): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const fieldValue = record[key];

  return typeof fieldValue === "string" && fieldValue.trim().length > 0
    ? fieldValue
    : fallback;
}

function getSemanticIssues(
  question: ValidatedLocalQuestion,
): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = [];

  const optionIds = question.options.map((option) => option.id);
  const normalizedOptionTexts = question.options.map((option) =>
    normalizeText(option.text),
  );
  const normalizedTags = question.tags.map(normalizeText);

  if (new Set(optionIds).size !== optionIds.length) {
    issues.push({
      path: "options",
      message: "Option IDs must be unique.",
    });
  }

  if (
    new Set(normalizedOptionTexts).size !== normalizedOptionTexts.length
  ) {
    issues.push({
      path: "options",
      message: "Answer option text must not be duplicated.",
    });
  }

  if (
    new Set(question.correctAnswerIds).size !==
    question.correctAnswerIds.length
  ) {
    issues.push({
      path: "correctAnswerIds",
      message: "Correct answer IDs must not contain duplicates.",
    });
  }

  if (new Set(normalizedTags).size !== normalizedTags.length) {
    issues.push({
      path: "tags",
      message: "Tags must not contain duplicates.",
    });
  }

  question.correctAnswerIds.forEach((correctAnswerId, index) => {
    if (!optionIds.includes(correctAnswerId)) {
      issues.push({
        path: `correctAnswerIds.${index}`,
        message: `Correct answer ${correctAnswerId} does not exist in the options.`,
      });
    }
  });

  if (question.correctAnswerIds.length !== question.selectCount) {
    issues.push({
      path: "selectCount",
      message:
        "Select count must match the number of correct answers.",
    });
  }

  if (question.selectCount > question.options.length) {
    issues.push({
      path: "selectCount",
      message:
        "Select count cannot be greater than the number of options.",
    });
  }

  const expectedSelectCount =
    EXPECTED_SELECT_COUNTS[question.questionType];

  if (question.selectCount !== expectedSelectCount) {
    issues.push({
      path: "selectCount",
      message: `${question.questionType} questions must require exactly ${expectedSelectCount} answer${
        expectedSelectCount === 1 ? "" : "s"
      }.`,
    });
  }

  question.options.forEach((option, index) => {
    if (FORBIDDEN_OPTION_TEXT.has(normalizeOptionText(option.text))) {
      issues.push({
        path: `options.${index}.text`,
        message: `"${option.text}" is not allowed as an answer option.`,
      });
    }
  });

  const searchableQuestionContent = normalizeText(
    [
      question.questionText,
      question.explanation,
      question.memoryHook,
      question.sourceBasis,
    ].join(" "),
  );

  FORBIDDEN_REAL_EXAM_CLAIMS.forEach((claim) => {
    if (searchableQuestionContent.includes(claim)) {
      issues.push({
        path: "question",
        message: `Question content must not claim it is a "${claim}".`,
      });
    }
  });

  return issues;
}

export function validateLocalQuestion(
  value: unknown,
  questionIndex = 0,
): QuestionValidationResult {
  const fallbackQuestionId = `Question ${questionIndex + 1}`;
  const questionId = getDisplayValue(
    value,
    "id",
    fallbackQuestionId,
  );
  const questionText = getDisplayValue(
    value,
    "questionText",
    "Question text is unavailable.",
  );

  const parsedQuestion = localQuestionSchema.safeParse(value);

  if (!parsedQuestion.success) {
    const issues = parsedQuestion.error.issues.map((issue) => ({
      path:
        issue.path.length > 0
          ? issue.path.map(String).join(".")
          : "question",
      message: issue.message,
    }));

    return {
      questionId,
      questionText,
      isValid: false,
      issues,
    };
  }

  const issues = getSemanticIssues(parsedQuestion.data);

  return {
    questionId,
    questionText,
    isValid: issues.length === 0,
    issues,
  };
}

export function validateLocalQuestionBank(
  questions: readonly unknown[],
): QuestionBankValidationSummary {
  const results = questions.map((question, index) =>
    validateLocalQuestion(question, index),
  );

  const questionIdCounts = new Map<string, number>();

  results.forEach((result) => {
    questionIdCounts.set(
      result.questionId,
      (questionIdCounts.get(result.questionId) ?? 0) + 1,
    );
  });

  results.forEach((result) => {
    if ((questionIdCounts.get(result.questionId) ?? 0) > 1) {
      result.issues.push({
        path: "id",
        message: `Question ID "${result.questionId}" is duplicated in the question bank.`,
      });

      result.isValid = false;
    }
  });

  const validCount = results.filter((result) => result.isValid).length;

  return {
    totalCount: results.length,
    validCount,
    invalidCount: results.length - validCount,
    results,
  };
}