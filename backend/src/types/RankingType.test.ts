import { RankingType } from './RankingType';

describe('RankingType', () => {
  describe('isValid', () => {
    // Test valid ranking type codes
    describe('when given valid ranking type codes', () => {
      it('should return true for "ACCURACY"', () => {
        expect(RankingType.isValid('ACCURACY')).toBe(true);
      });

      it('should return true for "QUALITY"', () => {
        expect(RankingType.isValid('QUALITY')).toBe(true);
      });

      it('should return true for "GRAMMAR"', () => {
        expect(RankingType.isValid('GRAMMAR')).toBe(true);
      });

      it('should return true for "STYLE"', () => {
        expect(RankingType.isValid('STYLE')).toBe(true);
      });

      it('should return true for "RELEVANCE"', () => {
        expect(RankingType.isValid('RELEVANCE')).toBe(true);
      });
    });

    // Test all valid codes at once
    describe('when testing all valid codes dynamically', () => {
      it('should return true for all valid ranking type codes', () => {
        const validCodes = RankingType.getCodes();

        validCodes.forEach((code: string) => {
          expect(RankingType.isValid(code)).toBe(true);
        });
      });
    });

    // Test invalid ranking type codes
    describe('when given invalid ranking type codes', () => {
      it('should return false for empty string', () => {
        expect(RankingType.isValid('')).toBe(false);
      });

      it('should return false for lowercase valid code', () => {
        expect(RankingType.isValid('accuracy')).toBe(false);
      });

      it('should return false for mixed case valid code', () => {
        expect(RankingType.isValid('Accuracy')).toBe(false);
      });

      it('should return false for non-existent code', () => {
        expect(RankingType.isValid('INVALID')).toBe(false);
      });

      it('should return false for code with extra spaces', () => {
        expect(RankingType.isValid(' ACCURACY ')).toBe(false);
      });

      it('should return false for similar but wrong code', () => {
        expect(RankingType.isValid('ACCURACYY')).toBe(false);
      });

      it('should return false for numeric string', () => {
        expect(RankingType.isValid('123')).toBe(false);
      });

      it('should return false for special characters', () => {
        expect(RankingType.isValid('ACCURACY!')).toBe(false);
      });

      it('should return false for random string', () => {
        expect(RankingType.isValid('RANDOM_CODE')).toBe(false);
      });
    });

    // Edge cases
    describe('edge cases', () => {
      it('should return false for code with only whitespace', () => {
        expect(RankingType.isValid('   ')).toBe(false);
      });

      it('should return false for code with newline characters', () => {
        expect(RankingType.isValid('ACCURACY\n')).toBe(false);
      });

      it('should return false for code with tab characters', () => {
        expect(RankingType.isValid('ACCURACY\t')).toBe(false);
      });

      it('should return false for very long string', () => {
        expect(RankingType.isValid('A'.repeat(1000))).toBe(false);
      });
    });

    // Type safety tests (TypeScript should catch these at compile time, but test runtime behavior)
    describe('when given unexpected types (runtime)', () => {
      it('should handle null without throwing (type coercion)', () => {
        expect(RankingType.isValid(null as any)).toBe(false);
      });

      it('should handle undefined without throwing (type coercion)', () => {
        expect(RankingType.isValid(undefined as any)).toBe(false);
      });

      it('should handle number without throwing (type coercion)', () => {
        expect(RankingType.isValid(123 as any)).toBe(false);
      });

      it('should handle object without throwing (type coercion)', () => {
        expect(RankingType.isValid({ code: 'ACCURACY' } as any)).toBe(false);
      });

      it('should handle array without throwing (type coercion)', () => {
        expect(RankingType.isValid(['ACCURACY'] as any)).toBe(false);
      });
    });

    // Performance test (optional but good practice)
    describe('performance', () => {
      it('should validate 1000 codes in reasonable time', () => {
        const startTime = Date.now();

        for (let i = 0; i < 1000; i++) {
          RankingType.isValid('ACCURACY');
          RankingType.isValid('INVALID');
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete in less than 100ms
        expect(duration).toBeLessThan(100);
      });
    });
  });

  // Bonus: Test consistency between isValid and fromCode
  describe('isValid and fromCode consistency', () => {
    it('should return true for isValid when fromCode returns a value', () => {
      const validCodes = RankingType.getCodes();

      validCodes.forEach((code: string) => {
        const foundType = RankingType.fromCode(code);
        expect(foundType).toBeDefined();
        expect(RankingType.isValid(code)).toBe(true);
      });
    });

    it('should return false for isValid when fromCode returns undefined', () => {
      const invalidCodes = ['INVALID', '', 'random', '123'];

      invalidCodes.forEach((code: string) => {
        const foundType = RankingType.fromCode(code);
        expect(foundType).toBeUndefined();
        expect(RankingType.isValid(code)).toBe(false);
      });
    });
  });
});
