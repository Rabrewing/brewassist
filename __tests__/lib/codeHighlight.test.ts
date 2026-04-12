import {
  getLanguageFromPath,
  highlightSource,
  isMarkdownPath,
} from '../../lib/codeHighlight';

describe('codeHighlight helpers', () => {
  it('detects markdown paths', () => {
    expect(isMarkdownPath('docs/readme.md')).toBe(true);
    expect(isMarkdownPath('src/index.ts')).toBe(false);
  });

  it('maps file extensions to languages', () => {
    expect(getLanguageFromPath('src/app.tsx')).toBe('typescript');
    expect(getLanguageFromPath('scripts/build.sh')).toBe('bash');
  });

  it('highlights source into HTML safely', () => {
    const html = highlightSource('const value = 1;', 'file.ts');
    expect(html).toContain('value');
  });
});
