export interface ModerationResult {
  isAllowed: boolean;
  reasons: string[];
}

const PROFANITY_LIST = ['badword1', 'badword2'];

export const ModerationService = {
  checkContent(text: string): ModerationResult {
    const lower = text.toLowerCase();
    const reasons: string[] = [];

    for (const word of PROFANITY_LIST) {
      if (lower.includes(word)) {
        reasons.push(`Contains banned term: ${word}`);
      }
    }

    return {
      isAllowed: reasons.length === 0,
      reasons,
    };
  },
};
