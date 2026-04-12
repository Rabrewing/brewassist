import hljs from 'highlight.js';

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  css: 'css',
  scss: 'scss',
  html: 'html',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  py: 'python',
  sql: 'sql',
  diff: 'diff',
};

export function getLanguageFromPath(filePath: string): string | undefined {
  const match = filePath.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!match) return undefined;
  return EXTENSION_TO_LANGUAGE[match[1]];
}

export function isMarkdownPath(filePath: string): boolean {
  return /\.(md|mdx|markdown)$/i.test(filePath);
}

export function highlightSource(source: string, filePath: string): string {
  const language = getLanguageFromPath(filePath);

  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(source, { language }).value;
    }
    return hljs.highlightAuto(source).value;
  } catch {
    return escapeHtml(source);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
