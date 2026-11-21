import { z } from "zod";
import { getSupabaseServerAdminClient } from "@/lib/supabase/server";
import { validateLocalQuestion } from "@/lib/validation/questionRules";
import { generatedQuestionSchema } from "@/lib/validation/questionSchema";

export const runtime = "nodejs";

const saveRequest = z.strictObject({
  reviewed: z.literal(true),
  question: generatedQuestionSchema,
});

function failure(
  status: number,
  message: string,
  details?: { path: string; message: string }[],
) {
  return Response.json({ error: { message, details } }, { status });
}

export async function POST(request: Request) {
  // Keep this administrative write on the same development-only surface as generation.
  if (process.env.NODE_ENV !== "development") {
    return failure(404, "Not found.");
  }
  const host = request.headers.get("host");
  if (!host || !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)) {
    return failure(403, "Open the review page on localhost to save this question.");
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== `http://${host}` && origin !== `https://${host}`) {
    return failure(403, "Save the question from the app's own review page.");
  }
  const mediaType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return failure(415, "Send the reviewed question as JSON.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(400, "The request must contain valid JSON.");
  }
  const parsed = saveRequest.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => ({
      path: issue.path.map(String).join("."),
      message: issue.message,
    }));
    return failure(422, "Confirm review and check the question fields.", issues);
  }
  const question = parsed.data.question;
  const validation = validateLocalQuestion(question);
  if (!validation.isValid) {
    return failure(422, "The edited question failed validation.", validation.issues);
  }

  try {
    const { data: id, error } = await getSupabaseServerAdminClient()
      .rpc("save_reviewed_question", { p_question: question });
    if (error?.code === "23505") {
      return failure(409, "A different version of this preview was already saved.");
    }
    if (error || !id) {
      return failure(503, "Could not confirm the save. Check the Supabase connection and Part 22 migration, then retry.");
    }
    return Response.json({ data: { id } });
  } catch {
    return failure(503, "Could not reach the configured Supabase database. Check the server settings and retry.");
  }
}
