# AZ-900 Bus Prep

Practice for Azure Fundamentals in short sessions. Each mock exam picks up to five questions. Select an answer to see the explanation and memory hook. A missed question gets priority in the next exam and stays in **Mistakes Only** until you answer it correctly.

## Run locally

Use Node.js 24 and run the following commands from the project root.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open [the dashboard](http://127.0.0.1:3000). The six built-in questions, exam results, progress stats and retry queue work without API keys. Study history and question preferences are stored in the current browser.

## Generate and publish questions

1. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. Restart the dev server. Use **Practice by Topic** to answer a generated question.
2. To publish, configure local Supabase and open `/author/questions`. Review the draft against its source, confirm the review, and save. The server validates the question and saves its options in the same transaction. [Local database setup](docs/development-progress.md)
3. Open `/question-bank` and search for the question. Active, validated published questions join the built-in bank and become eligible for mock exams. When the configured database is unavailable, practice continues with the built-in bank and this browser’s pending mistakes.

Gemini is the default generator. For the optional OpenAI backup, set `ENABLE_OPENAI_PROVIDER=true` and `OPENAI_API_KEY`. Set `OPENAI_GENERATION_MODEL` to override `gpt-4.1-mini`, or `DEFAULT_AI_PROVIDER=openai` to use OpenAI first. Generation and publishing are available in local development. Reviewers check factual accuracy before publishing.

## Verify and deploy

```sh
npm run lint
npm test
npm run build
```

GitHub Actions runs these checks and exercises the production routes. Vercel can serve the learner app with the built-in bank alone or with a reachable Supabase database. [Vercel setup and release checks](docs/deployment.md)
