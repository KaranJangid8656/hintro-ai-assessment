import { normalizeTimestamp } from '../../src/utils/timestamp';

describe('normalizeTimestamp', () => {
  it('normalizes single-digit minutes and seconds', () => {
    expect(normalizeTimestamp('0:10')).toBe('00:10');
    expect(normalizeTimestamp('00:20')).toBe('00:20');
  });

  it('normalizes H:M:S to MM:SS', () => {
    expect(normalizeTimestamp('1:05:30')).toBe('65:30');
  });
});
