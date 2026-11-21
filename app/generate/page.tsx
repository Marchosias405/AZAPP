import { QuestionGenerationWorkspace } from "@/components/ai/question-generation-workspace";
import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";

export default function GenerateQuestionPage() {
  if (process.env.NODE_ENV !== "development") redirect("/mock-exam");

  return (
    <AppShell>
      <QuestionGenerationWorkspace />
    </AppShell>
  );
}
