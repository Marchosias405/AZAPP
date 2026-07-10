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
    status: "ready",
    buttonLabel: "Start mock exam",
  },
  {
    title: "Mistakes Only",
    description:
      "Practice only the questions you missed in your local mock exams.",
    href: "/mistakes",
    status: "ready",
    buttonLabel: "Practice mistakes",
  },
  {
    title: "Review All Mistakes",
    description:
      "Review missed questions with explanations, correct answers, and memory hooks.",
    href: "/mistakes/review",
    status: "ready",
    buttonLabel: "Review mistakes",
  },
  {
    title: "Progress Stats",
    description:
      "See your latest local exam score, weak topics, strong topics, and recommended focus.",
    href: "/stats",
    status: "ready",
    buttonLabel: "View stats",
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