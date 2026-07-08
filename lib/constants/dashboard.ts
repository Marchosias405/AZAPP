export type DashboardCardStatus = "ready" | "locked" | "soon";

export type DashboardCard = {
  title: string;
  description: string;
  href: string;
  status: DashboardCardStatus;
  buttonLabel: string;
};

export const DASHBOARD_CARDS: DashboardCard[] = [
  {
    title: "Start Mock Exam",
    description:
      "Practice AZ-900 questions one at a time with a mobile-friendly exam flow.",
    href: "/mock-exam",
    status: "locked",
    buttonLabel: "Coming in Part 3",
  },
  {
    title: "Mistakes Only",
    description:
      "Redo questions you previously got wrong so weak topics come back more often.",
    href: "/mistakes-only",
    status: "locked",
    buttonLabel: "Coming later",
  },
  {
    title: "Review All Mistakes",
    description:
      "See missed questions with explanations, correct answers, and memory hooks.",
    href: "/mistakes",
    status: "locked",
    buttonLabel: "Coming later",
  },
  {
    title: "Progress Stats",
    description:
      "Track your score, weak domains, mastered topics, and study progress.",
    href: "/stats",
    status: "locked",
    buttonLabel: "Coming later",
  },
  {
    title: "Generate More Questions",
    description:
      "Generate original AZ-900-style questions with validation before saving.",
    href: "/generate",
    status: "locked",
    buttonLabel: "Coming later",
  },
  {
    title: "Question Bank",
    description:
      "Review, filter, disable, delete, regenerate, or mark questions as mastered.",
    href: "/question-bank",
    status: "locked",
    buttonLabel: "Coming later",
  },
];