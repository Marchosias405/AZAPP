import { AppShell } from "@/components/app-shell";
import { LocalQuestionBank } from "@/components/exam/local-question-bank";
import { CatalogStatus } from "@/components/exam/catalog-status";
import { getQuestionCatalog } from "@/lib/exam/questionCatalog";

export default async function QuestionBankPage() {
  const { questions, unavailable } = await getQuestionCatalog();
  return (
    <AppShell>
      <CatalogStatus unavailable={unavailable} />
      <LocalQuestionBank questions={questions} />
    </AppShell>
  );
}
