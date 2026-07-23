import { generateQuestionRequestSchema } from "@/lib/ai/contracts";
import { isAiError } from "@/lib/ai/errors";
import { generateQuestion } from "@/lib/ai/generateQuestion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

type ErrorResponseOptions = {
  code: string;
  message: string;
  status: number;
  details?: unknown;
};

type ValidationIssue = {
  path: ReadonlyArray<PropertyKey>;
  message: string;
};

function createErrorResponse({
  code,
  message,
  status,
  details,
}: ErrorResponseOptions): Response {
  return Response.json(
    {
      error: {
        code,
        message,
        ...(details === undefined
          ? {}
          : {
              details,
            }),
      },
    },
    {
      status,
      headers: NO_STORE_HEADERS,
    },
  );
}

function getValidationIssues(
  issues: ReadonlyArray<ValidationIssue>,
) {
  return issues.map((issue) => ({
    path:
      issue.path.length > 0
        ? issue.path.map(String).join(".")
        : "request",
    message: issue.message,
  }));
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    return createErrorResponse({
      code: "NOT_FOUND",
      message: "Not found.",
      status: 404,
    });
  }

  const contentType =
    request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    return createErrorResponse({
      code: "AI_INVALID_REQUEST",
      message:
        "Content-Type must be application/json.",
      status: 415,
    });
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return createErrorResponse({
      code: "AI_INVALID_REQUEST",
      message: "The request body must contain valid JSON.",
      status: 400,
    });
  }

  const parsedRequest =
    generateQuestionRequestSchema.safeParse(requestBody);

  if (!parsedRequest.success) {
    return createErrorResponse({
      code: "AI_INVALID_REQUEST",
      message:
        "The question-generation request is invalid.",
      status: 400,
      details: getValidationIssues(
        parsedRequest.error.issues,
      ),
    });
  }

  try {
    const result = await generateQuestion(
      parsedRequest.data,
    );

    return Response.json(
      {
        data: result,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    if (isAiError(error)) {
      return createErrorResponse({
        code: error.code,
        message: error.message,
        status: error.status,
        details: error.details,
      });
    }

    const safeErrorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "Unknown error";

    console.error(
      "Unexpected AI generation failure:",
      safeErrorMessage,
    );

    return createErrorResponse({
      code: "AI_UNEXPECTED_ERROR",
      message:
        "An unexpected server error occurred while generating the question.",
      status: 500,
    });
  }
}
