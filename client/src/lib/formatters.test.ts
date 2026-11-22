import { describe, expect, it } from 'vitest';
import { formatDate, money } from './formatters';

// Intl puts a non-breaking space (U+00A0) between the number and the € sign.
const euro = (text: string) => text.replace(' ', String.fromCharCode(0xa0));

describe('money', () => {
  it.each([
    [4799.97, '4.799,97 €'],
    [9.9, '9,90 €'],
    [0, '0,00 €'],
  ])('formats %s as %s', (value, expected) => {
    expect(money(value)).toBe(euro(expected));
  });

  it('rounds floating point leftovers to cents (3 × 19.99)', () => {
    expect(money(19.99 * 3)).toBe(euro('59,97 €'));
  });
});

describe('formatDate', () => {
  it('shows a short, readable date', () => {
    expect(formatDate('2026-11-11T12:00:00.000Z')).toBe('11 Nov 2026');
  });
});
