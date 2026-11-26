import { describe, expect, it } from 'vitest';
import { buildTimeline } from './orderTimeline';

const placed = {
  status: 'PENDING',
  createdAt: '2026-11-12T10:00:00.000Z',
} as const;
const processing = {
  status: 'PROCESSING',
  createdAt: '2026-11-12T15:00:00.000Z',
} as const;
const shipped = {
  status: 'SHIPPED',
  createdAt: '2026-11-13T09:00:00.000Z',
} as const;

const summary = (steps: ReturnType<typeof buildTimeline>) =>
  steps.map(
    ({ status, state, date }) => `${status}:${state}:${date ? 'date' : '-'}`,
  );

describe('buildTimeline', () => {
  it('marks the steps before the current one as done', () => {
    const steps = buildTimeline('SHIPPED', [placed, processing, shipped]);

    expect(summary(steps)).toEqual([
      'PENDING:done:date',
      'PROCESSING:done:date',
      'SHIPPED:current:date',
      'DELIVERED:upcoming:-',
    ]);
    expect(steps[2]?.date).toBe(shipped.createdAt);
  });

  it('shows a new order as placed, with everything else still to come', () => {
    expect(summary(buildTimeline('PENDING', [placed]))).toEqual([
      'PENDING:current:date',
      'PROCESSING:upcoming:-',
      'SHIPPED:upcoming:-',
      'DELIVERED:upcoming:-',
    ]);
  });

  it('ends a cancelled order at "Cancelled", without the steps it never reached', () => {
    const cancelled = {
      status: 'CANCELLED',
      createdAt: '2026-11-12T18:00:00.000Z',
    } as const;

    expect(
      summary(buildTimeline('CANCELLED', [placed, processing, cancelled])),
    ).toEqual([
      'PENDING:done:date',
      'PROCESSING:done:date',
      'CANCELLED:current:date',
    ]);
  });

  it('keeps a step without a date when an older order has no record of it', () => {
    // Orders from before tracking only got PENDING and their status back then.
    const delivered = {
      status: 'DELIVERED',
      createdAt: '2026-11-14T12:00:00.000Z',
    } as const;

    expect(summary(buildTimeline('DELIVERED', [placed, delivered]))).toEqual([
      'PENDING:done:date',
      'PROCESSING:done:-',
      'SHIPPED:done:-',
      'DELIVERED:current:date',
    ]);
  });
});
