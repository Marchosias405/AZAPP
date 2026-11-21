import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { generateQuestion } from "@/lib/ai/generateQuestion";
import { LOCAL_MOCK_QUESTIONS } from "@/lib/exam/localQuestions";

const { createInteraction } = vi.hoisted(() => ({ createInteraction: vi.fn() }));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class { interactions = { create: createInteraction }; },
}));

const { id, ...draft } = LOCAL_MOCK_QUESTIONS[0];
const settings = {
  domain: draft.domain,
  topic: "Shared responsibility model" as const,
  difficulty: draft.difficulty,
  questionType: draft.questionType,
};

const fetchOpenAi = vi.fn<typeof fetch>();
function openAiResponse(question: unknown = draft, status = "completed") {
  return Response.json({
    status,
    model: "openai-test-snapshot",
    output: [
      { type: "reasoning" },
      { type: "message", content: [{ type: "output_text", text: JSON.stringify(question) }] },
    ],
  });
}

beforeEach(() => {
  vi.stubEnv("DEFAULT_AI_PROVIDER", "gemini");
  vi.stubEnv("ENABLE_AI_FACT_CHECKING", "false");
  vi.stubEnv("ENABLE_OPENAI_PROVIDER", "true");
  vi.stubEnv("GEMINI_API_KEY", "local-test-gemini");
  vi.stubEnv("OPENAI_API_KEY", "local-test-openai");
  vi.stubEnv("DEFAULT_GENERATION_MODEL", "gemini-test");
  vi.stubEnv("OPENAI_GENERATION_MODEL", "openai-test");
  vi.stubGlobal("fetch", fetchOpenAi);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("uses only Gemini when the default request succeeds", async () => {
  createInteraction.mockResolvedValue({ output_text: JSON.stringify(draft) });
  const result = await generateQuestion(settings);
  expect(result.provider).toBe("gemini");
  expect(result.question.id).not.toBe(id);
  expect(fetchOpenAi).not.toHaveBeenCalled();
});

it.each([429, 503])("uses OpenAI exactly once on Gemini HTTP %s", async (status) => {
  createInteraction.mockRejectedValue(Object.assign(new Error(), { status }));
  fetchOpenAi.mockResolvedValue(openAiResponse());
  const result = await generateQuestion(settings);
  expect(result).toMatchObject({
    provider: "openai", model: "openai-test-snapshot", validation: { isValid: true },
  });
  expect(fetchOpenAi).toHaveBeenCalledTimes(1);
  const [url, options] = fetchOpenAi.mock.calls[0];
  expect(url).toBe("https://api.openai.com/v1/responses");
  const body = JSON.parse(String(options?.body));
  expect(body).toMatchObject({
    model: "openai-test", store: false, text: { format: {
      type: "json_schema", strict: true, schema: { additionalProperties: false },
    } },
  });
  expect(body.text.format.schema.properties.questionText).not.toHaveProperty("minLength");
});

it("can serve a configured backup when the Gemini key is absent", async () => {
  vi.stubEnv("GEMINI_API_KEY", "");
  fetchOpenAi.mockResolvedValue(openAiResponse());
  expect((await generateQuestion(settings)).provider).toBe("openai");
  expect(createInteraction).not.toHaveBeenCalled();
});

it("honors an explicitly requested provider after an outage", async () => {
  createInteraction.mockRejectedValue(Object.assign(new Error(), { status: 503 }));
  await expect(generateQuestion({ ...settings, provider: "gemini" }))
    .rejects.toMatchObject({ code: "AI_PROVIDER_UNAVAILABLE" });
  expect(fetchOpenAi).not.toHaveBeenCalled();
});

it("makes no OpenAI call when the backup is disabled", async () => {
  vi.stubEnv("ENABLE_OPENAI_PROVIDER", "false");
  createInteraction.mockRejectedValue(new TypeError("fetch failed"));
  await expect(generateQuestion(settings)).rejects.toMatchObject({ code: "AI_PROVIDER_UNAVAILABLE" });
  await expect(generateQuestion({ ...settings, provider: "openai" }))
    .rejects.toMatchObject({ code: "AI_PROVIDER_DISABLED" });
  expect(fetchOpenAi).not.toHaveBeenCalled();
});

it("surfaces invalid Gemini output without trying another provider", async () => {
  createInteraction.mockResolvedValue({ output_text: "{}" });
  await expect(generateQuestion(settings)).rejects.toMatchObject({ code: "AI_OUTPUT_VALIDATION_FAILED" });
  expect(fetchOpenAi).not.toHaveBeenCalled();
});

it("does not retry a rejected Gemini request with another provider", async () => {
  createInteraction.mockRejectedValue(Object.assign(new Error(), { status: 403 }));
  await expect(generateQuestion(settings)).rejects.toMatchObject({ code: "AI_PROVIDER_REQUEST_FAILED" });
  expect(fetchOpenAi).not.toHaveBeenCalled();
});

it("reports a backup outage without exposing upstream content or retrying", async () => {
  createInteraction.mockRejectedValue(new TypeError("fetch failed"));
  fetchOpenAi.mockResolvedValue(new Response("private diagnostic", { status: 429 }));
  await expect(generateQuestion(settings)).rejects.toMatchObject({
    code: "AI_PROVIDER_REQUEST_FAILED",
    message: expect.stringContaining("HTTP 429"),
  });
  expect(fetchOpenAi).toHaveBeenCalledTimes(1);
});

it("validates OpenAI output against the request and rejects partial responses", async () => {
  vi.stubEnv("DEFAULT_AI_PROVIDER", "openai");
  fetchOpenAi.mockResolvedValueOnce(openAiResponse({ ...draft, questionType: "choose-3" }))
    .mockResolvedValueOnce(openAiResponse(draft, "incomplete"));
  await expect(generateQuestion(settings)).rejects.toMatchObject({ code: "AI_OUTPUT_VALIDATION_FAILED" });
  await expect(generateQuestion(settings)).rejects.toMatchObject({ code: "AI_EMPTY_RESPONSE" });
  expect(createInteraction).not.toHaveBeenCalled();
});
