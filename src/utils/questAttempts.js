const TRUE_VALUES = new Set(['true', 'correct', 'success', 'successful', 'solved', 'passed', 'complete', 'completed']);
const FALSE_VALUES = new Set(['false', 'incorrect', 'failed', 'fail', 'wrong', 'unsolved']);

export const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.attempts)) return data.attempts;
  if (Array.isArray(data?.questAttempts)) return data.questAttempts;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) return true;
    if (FALSE_VALUES.has(normalized)) return false;
  }
  return undefined;
};

export const getAttemptIsCorrect = (attempt) => {
  const direct = normalizeBoolean(
    attempt?.isCorrect ??
    attempt?.is_correct ??
    attempt?.IsCorrect ??
    attempt?.correct ??
    attempt?.Correct
  );

  if (direct !== undefined) return direct;

  const status = normalizeBoolean(
    attempt?.status ??
    attempt?.Status ??
    attempt?.result ??
    attempt?.Result
  );

  if (status !== undefined) return status;

  const solved = normalizeBoolean(
    attempt?.isSolved ??
    attempt?.is_solved ??
    attempt?.IsSolved
  );

  if (solved !== undefined) return solved;

  const selectedIndex =
    attempt?.selectedOptionIndex ??
    attempt?.selected_option_index ??
    attempt?.userSelectedOptionIndex ??
    attempt?.user_selected_option_index ??
    attempt?.userAnswerIndex ??
    attempt?.user_answer_index;
  const correctIndex =
    attempt?.correctOptionIndex ??
    attempt?.correct_option_index ??
    attempt?.correctIndex ??
    attempt?.correct_index ??
    attempt?.CorrectIndex;

  if (selectedIndex !== undefined && selectedIndex !== null && correctIndex !== undefined && correctIndex !== null) {
    return Number(selectedIndex) === Number(correctIndex);
  }

  const awardedXp =
    attempt?.awardedXp ??
    attempt?.awarded_xp ??
    attempt?.AwardedXp ??
    attempt?.xpEarned ??
    attempt?.xp_earned;

  if (awardedXp !== undefined && awardedXp !== null && awardedXp !== '') {
    return Number(awardedXp) > 0;
  }

  return undefined;
};

export const getAttemptQuestId = (attempt) => (
  attempt?.questId ??
  attempt?.quest_id ??
  attempt?.QuestId ??
  attempt?.quest?.id ??
  attempt?.id
);

export const getAttemptSelectedIndex = (attempt) => (
  attempt?.userSelectedOptionIndex ??
  attempt?.user_selected_option_index ??
  attempt?.userAnswerIndex ??
  attempt?.user_answer_index ??
  attempt?.selectedOptionIndex ??
  attempt?.selected_option_index ??
  attempt?.selectedIndex ??
  attempt?.selected_index
);

export const getAttemptCorrectIndex = (attempt) => (
  attempt?.correctOptionIndex ??
  attempt?.correct_option_index ??
  attempt?.correctIndex ??
  attempt?.correct_index ??
  attempt?.CorrectIndex
);
