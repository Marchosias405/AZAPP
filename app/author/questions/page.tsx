import { notFound } from "next/navigation";
import { QuestionGenerationWorkspace } from "@/components/ai/question-generation-workspace";
import { AppShell } from "@/components/app-shell";

export default function AuthorQuestionsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <AppShell>
      <QuestionGenerationWorkspace mode="author" />
    </AppShell>
  );
}
