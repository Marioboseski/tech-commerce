import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './authSchemas';

const valid = {
  fullName: 'Marko Petrov',
  email: 'marko@example.com',
  password: 'Password123',
};

const firstMessage = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

// The messages must stay the same as on the server, so the user sees the
// same text whether the browser or the server finds the mistake.
describe('registerSchema', () => {
  it('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    [{ fullName: '   ' }, 'Full name is required'],
    [{ email: 'not-an-email' }, 'Email must be a valid email address'],
    [{ password: 'short12' }, 'Password must be at least 8 characters'],
    [{ password: 'a'.repeat(73) }, 'Password can be at most 72 characters'],
  ])('refuses %o with "%s"', (change, message) => {
    expect(
      firstMessage(registerSchema.safeParse({ ...valid, ...change })),
    ).toBe(message);
  });
});

describe('loginSchema', () => {
  it('only checks that something was typed', () => {
    expect(
      loginSchema.safeParse({ email: 'a@b.c', password: 'x' }).success,
    ).toBe(true);
  });

  it('asks for the password when it is empty', () => {
    expect(
      firstMessage(loginSchema.safeParse({ email: 'a@b.c', password: '' })),
    ).toBe('Password is required');
  });
});
