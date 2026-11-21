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
      "Answer up to five questions and get feedback. Recent misses get priority.",
    href: "/mock-exam",
    status: "ready",
    buttonLabel: "Start mock exam",
  },
  {
    title: "Mistakes Only",
    description:
      "Retry the questions you missed. Each one leaves the list when you answer it correctly.",
    href: "/mistakes",
    status: "ready",
    buttonLabel: "Practice mistakes",
  },
  {
    title: "Review Latest Mistakes",
    description:
      "Review mistakes from your latest exam with correct answers, explanations, and memory hooks.",
    href: "/mistakes/review",
    status: "ready",
    buttonLabel: "Review latest mistakes",
  },
  {
    title: "Progress Stats",
    description:
      "Review saved attempt history, overall accuracy, recent scores, and performance by topic.",
    href: "/stats",
    status: "ready",
    buttonLabel: "View stats",
  },
  {
    title: "Question Bank",
    description:
      "Search local questions, review answers, flag problems, disable bad questions, and manage mastered status.",
    href: "/question-bank",
    status: "ready",
    buttonLabel: "Open question bank",
  },
  {
    title: "Practice by Topic",
    description:
      "Choose a topic and difficulty, answer a generated question, and see the explanation.",
    href: "/generate",
    status: "ready",
    buttonLabel: "Choose a topic",
  },
];
