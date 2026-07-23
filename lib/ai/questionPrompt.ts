import type { GenerateQuestionRequest } from "@/lib/ai/contracts";
import { EXPECTED_SELECT_COUNTS } from "@/lib/validation/questionRules";

export function buildQuestionGenerationPrompt(
  request: GenerateQuestionRequest,
): string {
  const selectCount =
    EXPECTED_SELECT_COUNTS[request.questionType];

  return `
Create exactly one original AZ-900-style practice question.

Requested settings:
- Domain: ${request.domain}
- Topic: ${request.topic}
- Difficulty: ${request.difficulty}
- Question type: ${request.questionType}
- Required number of correct answers: ${selectCount}

Content requirements:
- Test knowledge appropriate for the Microsoft Azure Fundamentals AZ-900 exam.
- Use current Azure terminology.
- Keep the question focused on the requested topic.
- Make every answer option plausible enough to test understanding.
- Ensure there is no ambiguity about which answers are correct.
- Provide exactly ${selectCount} correct answer${
    selectCount === 1 ? "" : "s"
  }.
- Ensure selectCount is exactly ${selectCount}.
- Use uppercase single-letter option IDs beginning with A.
- Explain why the correct answer is correct.
- Include a short, memorable, slightly funny memory hook.
- Include concise sourceBasis text describing the relevant AZ-900 objective.
- Include useful lowercase tags.

Originality and safety requirements:
- Write an original question.
- Do not copy Microsoft practice questions or third-party question banks.
- Do not use exam dumps or leaked questions.
- Do not claim that the question appeared on a real or official exam.
- Do not use "all of the above" or "none of the above".
- Do not include a permanent question ID; the application creates it.
- Return only the structured response requested by the schema.
`.trim();
}