export function areAnswerSetsEqual(
  selectedAnswerIds: string[],
  correctAnswerIds: string[],
) {
  if (selectedAnswerIds.length !== correctAnswerIds.length) {
    return false;
  }

  const selectedSet = new Set(selectedAnswerIds);

  return correctAnswerIds.every((correctAnswerId) =>
    selectedSet.has(correctAnswerId),
  );
}

export function formatAnswerList(answerIds: string[]) {
  return answerIds.join(", ");
}