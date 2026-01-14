import { describe, it, expect } from 'vitest';
import { registerSchema } from '@/lib/onboarding-schemas';
import { ZodIssue } from 'zod';

describe('onboarding-schemas', () => {
    describe('registerSchema', () => {
        describe('email validation', () => {
            it('should accept valid email addresses', () => {
                const validData = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('should reject invalid email addresses', () => {
                const invalidData = {
                    email: 'not-an-email',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Individual'
                };
                const result = registerSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });

        describe('password validation', () => {
            it('should require minimum 12 characters', () => {
                const shortPassword = {
                    email: 'test@example.com',
                    password: 'Short1!',
                    confirmPassword: 'Short1!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(shortPassword);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('12'))).toBe(true);
                }
            });

            it('should require uppercase letter', () => {
                const noUppercase = {
                    email: 'test@example.com',
                    password: 'securepass123!',
                    confirmPassword: 'securepass123!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(noUppercase);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('uppercase'))).toBe(true);
                }
            });

            it('should require lowercase letter', () => {
                const noLowercase = {
                    email: 'test@example.com',
                    password: 'SECUREPASS123!',
                    confirmPassword: 'SECUREPASS123!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(noLowercase);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('lowercase'))).toBe(true);
                }
            });

            it('should require number', () => {
                const noNumber = {
                    email: 'test@example.com',
                    password: 'SecurePassword!!',
                    confirmPassword: 'SecurePassword!!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(noNumber);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('number'))).toBe(true);
                }
            });

            it('should require special character', () => {
                const noSpecial = {
                    email: 'test@example.com',
                    password: 'SecurePassword12',
                    confirmPassword: 'SecurePassword12',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(noSpecial);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('special'))).toBe(true);
                }
            });

            it('should reject passwords with spaces', () => {
                const withSpaces = {
                    email: 'test@example.com',
                    password: 'Secure Pass123!',
                    confirmPassword: 'Secure Pass123!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(withSpaces);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('spaces'))).toBe(true);
                }
            });

            it('should accept valid complex password', () => {
                const validPassword = {
                    email: 'test@example.com',
                    password: 'SecurePass123!@#',
                    confirmPassword: 'SecurePass123!@#',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(validPassword);
                expect(result.success).toBe(true);
            });
        });

        describe('password confirmation', () => {
            it('should require passwords to match', () => {
                const mismatch = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'DifferentPass123!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(mismatch);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error.issues.some((i: ZodIssue) => i.message.includes('match'))).toBe(true);
                }
            });
        });

        describe('date of birth validation', () => {
            it('should accept valid past date', () => {
                const validDOB = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Individual',
                    dateOfBirth: '1990-01-15',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(validDOB);
                expect(result.success).toBe(true);
            });

            it('should reject future dates', () => {
                const futureDOB = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Individual',
                    dateOfBirth: '2099-01-15',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(futureDOB);
                expect(result.success).toBe(false);
            });

            it('should allow missing date of birth for organizations', () => {
                const noDOB = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Business',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(noDOB);
                expect(result.success).toBe(true);
            });
        });

        describe('account type validation', () => {
            it('should accept Individual account type', () => {
                const individual = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Individual',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(individual);
                expect(result.success).toBe(true);
            });

            it('should accept Business account type', () => {
                const business = {
                    email: 'test@example.com',
                    password: 'SecurePass123!',
                    confirmPassword: 'SecurePass123!',
                    accountType: 'Business',
                    organisationName: 'Test Corp',
                    firstName: 'John',
                    lastName: 'Doe'
                };
                const result = registerSchema.safeParse(business);
                expect(result.success).toBe(true);
            });
        });
    });
});
