export type Az900Domain =
  | "Describe cloud concepts"
  | "Describe Azure architecture and services"
  | "Describe Azure management and governance";

export type QuestionDifficulty = "beginner" | "standard" | "challenging";

export type QuestionType =
  | "single-answer"
  | "choose-2"
  | "choose-3"
  | "scenario"
  | "common-confusion";

export type LocalQuestionOption = {
  id: string;
  text: string;
};

export type LocalQuestion = {
  id: string;
  domain: Az900Domain;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  selectCount: number;
  questionText: string;
  options: LocalQuestionOption[];
  correctAnswerIds: string[];
  explanation: string;
  memoryHook: string;
  sourceBasis: string;
  tags: string[];
};