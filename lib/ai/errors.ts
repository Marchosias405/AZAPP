export const AI_ERROR_CODES = [
  "AI_INVALID_REQUEST",
  "AI_CONFIGURATION_ERROR",
  "AI_PROVIDER_DISABLED",
  "AI_PROVIDER_NOT_IMPLEMENTED",
  "AI_PROVIDER_REQUEST_FAILED",
  "AI_EMPTY_RESPONSE",
  "AI_INVALID_JSON",
  "AI_OUTPUT_VALIDATION_FAILED",
  "AI_FACT_CHECKING_NOT_IMPLEMENTED",
  "AI_UNEXPECTED_ERROR",
] as const;

export type AiErrorCode =
  (typeof AI_ERROR_CODES)[number];

type AiErrorOptions = {
  code: AiErrorCode;
  message: string;
  status?: number;
  details?: unknown;
  cause?: unknown;
};

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor({
    code,
    message,
    status = 500,
    details,
    cause,
  }: AiErrorOptions) {
    super(message, {
      cause,
    });

    this.name = "AiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isAiError(error: unknown): error is AiError {
  return error instanceof AiError;
}