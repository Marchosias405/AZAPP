import "server-only";

import { connection } from "next/server";
import { LOCAL_MOCK_QUESTIONS } from "@/lib/exam/localQuestions";
import type { LocalQuestion } from "@/lib/exam/types";
import { getSupabaseServerAdminClient } from "@/lib/supabase/server";
import { validateLocalQuestion } from "@/lib/validation/questionRules";
import { generatedQuestionSchema } from "@/lib/validation/questionSchema";

export async function getQuestionCatalog(): Promise<{
  questions: LocalQuestion[];
  unavailable: boolean;
}> {
  await connection();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url && !key) {
    return { questions: LOCAL_MOCK_QUESTIONS, unavailable: false };
  }
  if (!url || !key) {
    return { questions: LOCAL_MOCK_QUESTIONS, unavailable: true };
  }

  try {
    const supabase = getSupabaseServerAdminClient();
    const reviewed: LocalQuestion[] = [];
    let afterKey: string | null = null;

    // Advance by the unique external key even when the project's row cap is
    // smaller than this page size or a row fails the current validation rules.
    while (true) {
      const query = supabase.from("questions")
        .select(`
          id:external_key, domain, topic, difficulty, questionType:question_type,
          selectCount:select_count, questionText:question_text,
          options:question_options(id:option_id, text:option_text),
          correctAnswerIds:correct_answer_ids, explanation, memoryHook:memory_hook,
          sourceBasis:source_basis, tags
        `)
        .is("owner_user_id", null)
        .eq("source_kind", "generated")
        .eq("validation_status", "valid")
        .eq("is_active", true)
        .like("external_key", "generated-%")
        .order("external_key")
        .order("sort_order", { referencedTable: "options" })
        .limit(250)
        .abortSignal(AbortSignal.timeout(5000))
        .retry(false);
      if (afterKey !== null) query.gt("external_key", afterKey);

      const { data, error } = await query;
      if (error) throw error;
      if (data.length === 0) break;
      for (const row of data) {
        const parsed = generatedQuestionSchema.safeParse(row);
        if (parsed.success && validateLocalQuestion(parsed.data).isValid) {
          reviewed.push(parsed.data);
        }
      }
      const lastKey = data[data.length - 1].id;
      if (!lastKey || lastKey === afterKey) throw new Error("Invalid catalog cursor");
      afterKey = lastKey;
    }
    return { questions: [...LOCAL_MOCK_QUESTIONS, ...reviewed], unavailable: false };
  } catch {
    return { questions: LOCAL_MOCK_QUESTIONS, unavailable: true };
  }
}
