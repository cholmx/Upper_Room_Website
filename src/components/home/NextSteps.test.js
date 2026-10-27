import { describe, it, expect } from 'vitest';
import { nextSteps } from './NextSteps';

describe('nextSteps', () => {
  const steps = nextSteps({ giveUrl: 'https://give.example.org' });
  it('has the four steps in order', () => {
    expect(steps.map(s => s.title)).toEqual(['Visit', 'Connect', 'Serve', 'Give']);
  });
  it('links inside the site except giving', () => {
    expect(steps.filter(s => !s.external).every(s => s.to.startsWith('/'))).toBe(true);
    expect(steps.find(s => s.title === 'Give')).toMatchObject({ to: 'https://give.example.org', external: true });
  });
});
