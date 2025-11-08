export const buildSearchKeywords = (...sources: Array<string | null | undefined>): string[] => {
  const keywords = new Set<string>();

  const addPrefixes = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return;

    keywords.add(normalized);

    // Whole string prefixes
    for (let i = 1; i <= normalized.length; i += 1) {
      keywords.add(normalized.slice(0, i));
    }

    // Word prefixes
    const words = normalized.split(/[\s@._-]+/).filter(Boolean);
    words.forEach((word) => {
      for (let i = 1; i <= word.length; i += 1) {
        keywords.add(word.slice(0, i));
      }
    });
  };

  sources.forEach((source) => {
    if (!source) return;
    addPrefixes(source);
  });

  return Array.from(keywords);
};

