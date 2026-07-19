import type { LocalQuestion } from "@/lib/exam/types";

export const LOCAL_MOCK_EXAM_MAX_QUESTIONS = 5;

type SelectLocalExamQuestionsOptions = {
  questions: LocalQuestion[];
  masteredQuestionIds: ReadonlySet<string>;
  maxQuestions?: number;
  random?: () => number;
};

function shuffleQuestions(
  questions: LocalQuestion[],
  random: () => number,
): LocalQuestion[] {
  const shuffledQuestions = [...questions];

  for (
    let currentIndex = shuffledQuestions.length - 1;
    currentIndex > 0;
    currentIndex -= 1
  ) {
    const randomIndex = Math.floor(random() * (currentIndex + 1));

    [shuffledQuestions[currentIndex], shuffledQuestions[randomIndex]] = [
      shuffledQuestions[randomIndex],
      shuffledQuestions[currentIndex],
    ];
  }

  return shuffledQuestions;
}

export function selectLocalExamQuestions({
  questions,
  masteredQuestionIds,
  maxQuestions = LOCAL_MOCK_EXAM_MAX_QUESTIONS,
  random = Math.random,
}: SelectLocalExamQuestionsOptions): LocalQuestion[] {
  const questionLimit = Math.max(
    0,
    Math.min(maxQuestions, questions.length),
  );

  if (questionLimit === 0) {
    return [];
  }

  const nonMasteredQuestions = shuffleQuestions(
    questions.filter(
      (question) => !masteredQuestionIds.has(question.id),
    ),
    random,
  );

  const masteredQuestions = shuffleQuestions(
    questions.filter((question) => masteredQuestionIds.has(question.id)),
    random,
  );

  const selectedNonMasteredQuestions = nonMasteredQuestions.slice(
    0,
    questionLimit,
  );

  const remainingQuestionSlots =
    questionLimit - selectedNonMasteredQuestions.length;

  const selectedMasteredQuestions = masteredQuestions.slice(
    0,
    remainingQuestionSlots,
  );

  return shuffleQuestions(
    [...selectedNonMasteredQuestions, ...selectedMasteredQuestions],
    random,
  );
}