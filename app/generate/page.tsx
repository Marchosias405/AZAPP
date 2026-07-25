import { QuestionGenerationWorkspace } from "@/components/ai/question-generation-workspace";
import { AppShell } from "@/components/app-shell";

export default function GenerateQuestionPage() {
  return (
    <AppShell>
      <QuestionGenerationWorkspace />
    </AppShell>
  );
}
