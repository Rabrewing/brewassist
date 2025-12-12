/**
 * @jest-environment node
 */
import handler from "../../pages/api/sandbox";
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from "next";
 
// Mock spawn so tests don’t actually run bash/overlays
jest.mock("node:child_process", () => {
  return {
    spawn: jest.fn(() => {
      const child: any = {
        stdout: {
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              process.nextTick(() => callback(Buffer.from("OK\n")));
            }
          }),
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            process.nextTick(() => callback(0)); // Simulate successful close in next tick
          }
        }),
        kill: jest.fn(),
      };
      return child;
    }),
  };
});

describe("/api/sandbox", () => {
  test("405 on non-POST", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });
    await handler(req, res);
 
    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData().ok).toBe(false);
  });
 
  test("400 on missing prompt", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: { "x-brewassist-mode": "admin" },
      body: { engine: "tiny" },
    });
    await handler(req, res);
 
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().ok).toBe(false);
  });
 
  test("200 on success", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: { "x-brewassist-mode": "admin" },
      body: {
        engine: "tiny",
        prompt: "hello",
      },
    });
    await handler(req, res);
 
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData().ok).toBe(true);
    expect(res._getJSONData().engine).toBe("tiny");
    expect(res._getJSONData().output).toBe("OK"); // Expect exact string from mock
  });
});