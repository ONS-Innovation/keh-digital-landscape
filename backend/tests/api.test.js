import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fetch from 'node-fetch';
import app from '../src/index.js';

let server;
let baseUrl;

beforeAll(async () => {
  server = app.listen(0); // 0 = random available port
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

afterAll(() => {
  server.close();
});

describe('API Health Check', () => {
  it('should return status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    console.log(data);
    expect(data.status).toEqual('healthy');
  });
});