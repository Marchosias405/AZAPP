# AZ-900 App Guardrails

This file is a placeholder for future AI generation rules.

## Current Part

Part 1 only sets up the project foundation.

## AI Rules Coming Later

The app should eventually generate original AZ-900-style practice questions using official skills measured, Microsoft Learn concepts, Azure documentation, and reputable public Azure learning resources.

The app must not:

- Copy real exam-dump questions word-for-word
- Copy Microsoft practice assessment questions word-for-word
- Claim generated questions are real exam questions
- Save AI output before local validation passes
- Hardcode API keys in source code

## Validation Rules Coming Later

Generated questions should be locally validated before saving.

Future validation should check:

- Valid JSON
- Required fields
- Valid AZ-900 domain
- Valid topic
- Valid question type
- Correct answer count
- No duplicate options
- Explanation exists
- Memory hook exists
- No fake Azure services