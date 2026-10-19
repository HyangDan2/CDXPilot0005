import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
describe('bootstrap', () => {
  it('uses relative production paths', () => {
    expect(readFileSync('vite.config.ts', 'utf8')).toContain("base: './'");
  });
});
