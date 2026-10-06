#!/usr/bin/env node
/**
 * Local harness for api/audit.js — invokes the Vercel handler directly with a
 * minimal req/res shim so the audit engine can be exercised without `vercel dev`.
 *
 * Usage: node scripts/test-audit.mjs https://example.com
 */
import handler from '../api/audit.js';

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(o) {
      this.body = o;
      return this;
    },
    end() {
      return this;
    },
  };
}

const url = process.argv[2] || 'https://example.com';
const req = { method: 'GET', query: { url }, headers: {} };
const res = mockRes();

const t0 = Date.now();
await handler(req, res);
const elapsed = Date.now() - t0;

console.log(`\n=== ${url} ===`);
console.log(`HTTP ${res.statusCode}  (handler wall time ${elapsed} ms)`);
console.log(JSON.stringify(res.body, null, 2));
