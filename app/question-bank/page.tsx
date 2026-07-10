import { AppShell } from "@/components/app-shell";
import { LocalQuestionBank } from "@/components/exam/local-question-bank";

export default function QuestionBankPage() {
  return (
    <AppShell>
      <LocalQuestionBank />
    </AppShell>
  );
}