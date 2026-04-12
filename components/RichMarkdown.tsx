'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { highlightSource } from '@/lib/codeHighlight';

type RichMarkdownProps = {
  content: string;
  className?: string;
};

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="markdown-h1" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="markdown-h2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="markdown-h3" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="markdown-p" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="markdown-ul" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="markdown-ol" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="markdown-li" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="markdown-blockquote" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="markdown-table-wrap">
      <table className="markdown-table" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="markdown-thead" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="markdown-tbody" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="markdown-tr" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="markdown-th" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="markdown-td" {...props}>
      {children}
    </td>
  ),
  code: ({ className, children, ...props }) => {
    const code = String(children).replace(/\n$/, '');
    const languageMatch = /language-(\w+)/.exec(className || '');
    const isBlock = Boolean(languageMatch) || code.includes('\n');

    if (!isBlock) {
      return (
        <code className="markdown-inline-code" {...props}>
          {children}
        </code>
      );
    }

    const highlighted = highlightSource(
      code,
      languageMatch ? `file.${languageMatch[1]}` : 'file.txt'
    );

    return (
      <pre className="markdown-pre">
        <code
          className={`hljs ${className || ''}`.trim()}
          dangerouslySetInnerHTML={{ __html: highlighted }}
          {...props}
        />
      </pre>
    );
  },
};

export function RichMarkdown({ content, className }: RichMarkdownProps) {
  return (
    <div
      className={
        className
          ? `brewassist-response rich-markdown ${className}`
          : 'brewassist-response rich-markdown'
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
