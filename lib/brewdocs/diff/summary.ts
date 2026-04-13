export type DiffSummary = {
  fileCount: number;
  addedLines: number;
  removedLines: number;
  hasBinaryHint: boolean;
  files: string[];
};

export function summarizeUnifiedDiff(diffText: string): DiffSummary {
  const files = new Set<string>();
  let addedLines = 0;
  let removedLines = 0;
  let hasBinaryHint = false;

  for (const line of diffText.split('\n')) {
    if (line.startsWith('Binary files ') || line.includes('GIT binary patch')) {
      hasBinaryHint = true;
    }

    if (line.startsWith('+++ b/')) {
      files.add(line.slice(6));
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      addedLines += 1;
    }

    if (line.startsWith('-') && !line.startsWith('---')) {
      removedLines += 1;
    }
  }

  return {
    fileCount: files.size,
    addedLines,
    removedLines,
    hasBinaryHint,
    files: [...files],
  };
}
