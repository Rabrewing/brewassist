import React from 'react';
import { act, renderHook } from '@testing-library/react';
import {
  RepoConnectionProvider,
  useRepoConnection,
} from '../../contexts/RepoConnectionContext';

describe('RepoConnectionContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('updates and persists repo provider selection', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepoConnectionProvider>{children}</RepoConnectionProvider>
    );

    const { result } = renderHook(() => useRepoConnection(), { wrapper });

    expect(result.current.repoProvider).toBe('github');

    act(() => {
      result.current.setRepoProvider('gitlab');
    });

    expect(result.current.repoProvider).toBe('gitlab');
    expect(window.localStorage.getItem('repoProvider')).toBe('gitlab');
  });
});
