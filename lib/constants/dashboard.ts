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
      "Take a mobile-friendly exam using up to five active questions. Non-mastered questions are prioritized.",
    href: "/mock-exam",
    status: "ready",
    buttonLabel: "Start mock exam",
  },
  {
    title: "Mistakes Only",
    description:
      "Practice questions you previously missed across your saved local exam attempts.",
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
    title: "Generate More Questions",
    description:
      "Generate original AZ-900-style questions after local validation and database foundations are complete.",
    href: "/generate",
    status: "locked",
    buttonLabel: "Coming later",
  },
];