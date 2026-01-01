import { validateDiff } from '../../lib/brewdocs/diff/validate';
import { canApplyProposal } from '../../lib/brewdocs/apply/guard';

describe('BrewDocs Lock-Aware Tests', () => {
  test('diff validation rejects frozen surfaces', () => {
    const frozenFiles = [
      'lib/capabilities/registry.ts',
      'lib/toolbelt/handshake.ts',
      'lib/brewIdentityEngine.ts',
      'components/WorkspaceSidebarRight.tsx',
    ];

    frozenFiles.forEach((file) => {
      const mockDiff = `--- a/${file}\n+++ b/${file}\n+// Modified`;
      const result = validateDiff(mockDiff, file);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('frozen surface');
    });
  });

  test('apply guard rejects non-admin personas', () => {
    const mockProposal = {
      diff: '--- a/test.md\n+++ b/test.md\n+New content',
      targetFile: 'brewdocs/test.md',
      confidence: 0.8,
    };

    const result = canApplyProposal(mockProposal, 'customer');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Insufficient persona permissions');
  });

  test('apply guard accepts admin personas', () => {
    const mockProposal = {
      diff: '--- a/test.md\n+++ b/test.md\n+New content',
      targetFile: 'brewdocs/test.md',
      confidence: 0.8,
    };

    ['admin', 'dev', 'support'].forEach((persona) => {
      const result = canApplyProposal(mockProposal, persona);
      expect(result.allowed).toBe(true);
    });
  });

  test('low confidence proposals rejected', () => {
    const mockProposal = {
      diff: '--- a/test.md\n+++ b/test.md\n+New content',
      targetFile: 'brewdocs/test.md',
      confidence: 0.5,
    };

    const result = canApplyProposal(mockProposal, 'admin');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('confidence too low');
  });
});
