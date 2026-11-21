import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCAL_MOCK_QUESTIONS } from "@/lib/exam/localQuestions";
import { getQuestionCatalog } from "@/lib/exam/questionCatalog";

vi.mock("next/server", () => ({ connection: async () => undefined }));

const id = "generated-00000000-0000-4000-8000-000000000001";
const stored = { ...LOCAL_MOCK_QUESTIONS[0], id };

describe("published question catalog", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads only eligible records in option order and follows a short server page", async () => {
    const second = { ...stored, id: id.slice(0, -1) + "2" };
    const invalid = { ...stored, id: id.slice(0, -1) + "3", correctAnswerIds: ["Z"] };
    fetchMock
      .mockResolvedValueOnce(Response.json([stored]))
      .mockResolvedValueOnce(Response.json([second, invalid]))
      .mockResolvedValueOnce(Response.json([]));

    const catalog = await getQuestionCatalog();
    expect(catalog).toEqual({
      unavailable: false,
      questions: [...LOCAL_MOCK_QUESTIONS, stored, second],
    });
    const [first, next, last] = fetchMock.mock.calls.map(([url]) => new URL(String(url)));
    expect(first.pathname).toBe("/rest/v1/questions");
    expect(Object.fromEntries(first.searchParams)).toMatchObject({
      source_kind: "eq.generated",
      validation_status: "eq.valid",
      is_active: "eq.true",
      owner_user_id: "is.null",
      external_key: "like.generated-%",
      order: "external_key.asc",
      "options.order": "sort_order.asc",
    });
    expect(first.searchParams.get("select")).toContain("options:question_options(id:option_id,text:option_text)");
    expect(next.searchParams.getAll("external_key")).toContain(`gt.${id}`);
    expect(last.searchParams.getAll("external_key")).toContain(`gt.${invalid.id}`);
  });

  it("discards a partial catalog if a later page fails", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json([stored]))
      .mockResolvedValueOnce(Response.json({ message: "Access denied" }, { status: 403 }));
    expect(await getQuestionCatalog()).toEqual({ questions: LOCAL_MOCK_QUESTIONS, unavailable: true });
  });

  it("supports a bundled-only installation and reports incomplete configuration", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(await getQuestionCatalog()).toEqual({ questions: LOCAL_MOCK_QUESTIONS, unavailable: false });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    expect(await getQuestionCatalog()).toEqual({ questions: LOCAL_MOCK_QUESTIONS, unavailable: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
