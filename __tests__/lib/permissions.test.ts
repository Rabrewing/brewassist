import { BREWASSIST_REPO_ROOT } from '../../lib/brewConfig';
import { assertRepoScope } from '../../lib/permissions';

describe('assertRepoScope', () => {
  const baseContext = {
    cockpitMode: 'admin' as const,
    role: 'admin' as const,
  };

  it('allows the active BrewAssist repo root', () => {
    expect(assertRepoScope(baseContext, BREWASSIST_REPO_ROOT)).toEqual({
      ok: true,
    });
  });

  it('blocks a different repo root until multi-repo is wired', () => {
    expect(assertRepoScope(baseContext, '/tmp/another-repo')).toMatchObject({
      ok: false,
      statusCode: 403,
    });
  });
});
