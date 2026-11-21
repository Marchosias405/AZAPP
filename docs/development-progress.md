# Development progress

## Part 22 — Save reviewed questions

Learners practice at `/generate` in development. The correct answers and explanation appear after submission. Missed questions are stored in the current browser and included in future practice until answered correctly.

For authoring, open `/author/questions` in development, generate a question, and review the prompt, answer choices, correct answers, explanation, memory hook and source. Edits clear the review checkbox. After you confirm review, Save sends the current draft to the server, which validates it again.

The database stores the question in `public.questions` and its ordered choices in `public.question_options` in one transaction. The generated preview ID is the unique external key. Retrying the same reviewed content returns the original database ID. A conflicting version is rejected. Validation checks question structure and rules. Reviewers should check factual accuracy against the cited material.

To run locally, start Docker Desktop and run these commands from the project root:

```sh
npx supabase start
npx supabase migration up --local
npm run dev -- --hostname 127.0.0.1
```

Use the local project URL and server secret in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY`), and configure `GEMINI_API_KEY` for generation. Local Supabase runs on this computer and requires no hosted project slot. Open Supabase Studio's Table Editor to inspect published questions.

## Reviewed questions in practice

Reload the question bank and search for the text of a newly published question. The bank and mock exams read the same catalog. It includes built-in questions and active, validated, shared generated questions from Supabase. The exam gives pending misses priority and respects the learner’s local disabled and mastered settings.

The hosted app can run with the built-in bank alone. For CI checks, Vercel setup and connecting a hosted question bank, see the [deployment guide](deployment.md).
