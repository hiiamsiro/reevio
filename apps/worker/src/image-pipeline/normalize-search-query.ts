const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'at',
  'for',
  'from',
  'in',
  'of',
  'on',
  'the',
  'to',
  'with',
]);

export function normalizeSearchQuery(prompt: string): string {
  const tokens = prompt
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

  const dedupedTokens = Array.from(new Set(tokens)).slice(0, 8);
  return dedupedTokens.join(' ').trim() || 'product marketing';
}
