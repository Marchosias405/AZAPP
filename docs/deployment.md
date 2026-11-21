# Deploy AZAPP on Vercel

The hosted app supports mock exams, answer feedback, mistake retries, question browsing and progress tracking. Exam history and pending mistakes belong to the learner's browser and site address. A Vercel preview and the production domain have separate histories. Question generation and publishing run in local development.

## Connect GitHub

1. In Vercel, choose **Add New → Project**, select **Import Git Repository**, and authorize access to **Marchosias405/AZAPP**. Choose the repository root and the **Next.js** framework preset. Use Node.js **24.x** to match CI. The repository sets the install command and Vercel uses the Next.js build and output defaults. [Vercel Git integration](https://vercel.com/docs/git)
2. For the bundled bank, leave environment variables empty. Under **Project Settings → Environments → Production → Branch Tracking**, choose the branch containing the release. This release lives on `codex/part-22-save-reviewed-questions`. After merging it into `main`, you can switch tracking to `main`. [Vercel environments](https://vercel.com/docs/deployments/environments)
3. GitHub Actions runs **Verify AZAPP** on pull requests and release-branch pushes. Other branches get previews through Vercel’s GitHub integration. In a preview, answer a mock question incorrectly, then answer it correctly in **Mistakes Only** and check that it leaves the retry list.
4. Pushes to the tracked production branch update the production domain. For releases through pull requests, enable a branch protection rule that requires the **Verify AZAPP** status check before merging. [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github)

## Include reviewed questions in production

The bundled bank works without a hosted database. To include questions you publish, use a Supabase project reachable from Vercel with the AZAPP migrations applied. Questions saved to a local Docker database are available to your local app.

In **Vercel → Project Settings → Environment Variables**, select **Production** and add `NEXT_PUBLIC_SUPABASE_URL` with that project's HTTPS URL. Add `SUPABASE_SECRET_KEY` as a **Sensitive** variable using a secret key from the same project. The server also accepts `SUPABASE_SERVICE_ROLE_KEY` for projects using the legacy key. Redeploy to apply the settings, then open **Question bank** and check for a question you published to that database. Preview deployments can use the bundled bank independently. [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables) · [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

## Run the checks locally

Use Node.js 24 and run the following commands from the repository root.

```sh
npm ci
npm run lint
npm test
npm run build
npm start
```

Open `http://localhost:3000` to exercise the production build. CI checks that the learner pages load and that the two development-only AI endpoints return HTTP 404. These checks run on pull requests, pushes to `main` or `codex/**`, and manual workflow runs. [GitHub Actions for Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
