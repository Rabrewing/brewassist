import { summarizeUnifiedDiff } from '../../lib/brewdocs/diff/summary';

describe('summarizeUnifiedDiff', () => {
  it('counts files and line changes', () => {
    const summary = summarizeUnifiedDiff(`--- a/foo.ts
+++ b/foo.ts
+added line
-removed line
+++ b/bar.ts
+more
`);

    expect(summary.fileCount).toBe(2);
    expect(summary.addedLines).toBe(2);
    expect(summary.removedLines).toBe(1);
    expect(summary.hasBinaryHint).toBe(false);
    expect(summary.files).toEqual(['foo.ts', 'bar.ts']);
  });

  it('detects binary diff hints', () => {
    const summary = summarizeUnifiedDiff(
      'Binary files a/image.png and b/image.png differ'
    );

    expect(summary.hasBinaryHint).toBe(true);
  });
});
