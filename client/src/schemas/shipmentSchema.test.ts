import { describe, expect, it } from 'vitest';
import { shipmentSchema } from './shipmentSchema';

const firstMessage = (value: unknown) =>
  shipmentSchema.safeParse(value).error?.issues[0]?.message;

describe('shipmentSchema', () => {
  it('accepts a carrier and a trimmed tracking number', () => {
    expect(
      shipmentSchema.parse({ carrier: 'UPS', trackingNumber: '  1Z999  ' }),
    ).toEqual({ carrier: 'UPS', trackingNumber: '1Z999' });
  });

  it('asks for a carrier when none is chosen', () => {
    // An empty <select> sends "".
    expect(firstMessage({ carrier: '', trackingNumber: '1Z999' })).toBe(
      'Choose a carrier',
    );
  });

  it('asks for a tracking number when it is blank', () => {
    expect(firstMessage({ carrier: 'DHL', trackingNumber: '   ' })).toBe(
      'Enter a tracking number',
    );
  });

  it('limits the tracking number to 100 characters, like the database column', () => {
    expect(
      firstMessage({ carrier: 'DHL', trackingNumber: '1'.repeat(101) }),
    ).toBe('Tracking number can be at most 100 characters');
  });
});
