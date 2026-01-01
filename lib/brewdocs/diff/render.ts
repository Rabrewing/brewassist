export function renderUnifiedDiff(
  oldContent: string,
  newContent: string,
  filename: string = 'file'
): string {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  // Simple diff implementation (in production, use a library)
  const diff: string[] = [];
  diff.push(`--- a/${filename}`);
  diff.push(`+++ b/${filename}`);

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';

    if (oldLine !== newLine) {
      if (oldLine) diff.push(`-${oldLine}`);
      if (newLine) diff.push(`+${newLine}`);
    }
  }

  return diff.join('\n');
}
