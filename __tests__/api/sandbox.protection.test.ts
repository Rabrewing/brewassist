import { createMocks } from 'node-mocks-http';
import sandboxHandler from '@/pages/api/sandbox';
import * as brewLast from '@/lib/brewLast';

jest.mock('@/lib/brewLast', () => ({
  ...jest.requireActual('@/lib/brewLast'),
  logSandboxBlocked: jest.fn(),
}));

describe('/api/sandbox protection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Admin allowed', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'x-brewassist-mode': 'admin',
      },
      body: {
        prompt: 'test prompt',
      },
    });

    await sandboxHandler(req, res);

    expect(res._getStatusCode()).not.toBe(403);
  });

  it('Customer blocked', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'x-brewassist-mode': 'customer',
      },
      body: {
        prompt: 'test prompt',
      },
    });

    await sandboxHandler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData()).toEqual({
      ok: false, // Added ok: false
      error: 'Sandbox is available only in Admin mode.',
      code: 'SANDBOX_FORBIDDEN',
    });
    expect(brewLast.logSandboxBlocked).toHaveBeenCalledWith({
      mode: 'customer',
      path: '/api/sandbox',
      reason: 'non-admin attempted sandbox',
    });
  });

  it('Missing header blocked', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        prompt: 'test prompt',
      },
    });

    await sandboxHandler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData()).toEqual({
      ok: false, // Added ok: false
      error: 'Sandbox is available only in Admin mode.',
      code: 'SANDBOX_FORBIDDEN', // Assuming this is the default code when header is missing
    });
    expect(brewLast.logSandboxBlocked).toHaveBeenCalledWith({
        mode: 'undefined',
        path: '/api/sandbox',
        reason: 'non-admin attempted sandbox',
      });
  });
});
