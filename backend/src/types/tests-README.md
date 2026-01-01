# RankingType Tests

This directory contains unit tests for the `RankingType` class.

## Test Coverage

### `RankingType.isValid()` - 27 Tests

#### Valid Inputs (6 tests)
- ✅ Returns `true` for all valid ranking type codes:
  - `ACCURACY`
  - `QUALITY`
  - `GRAMMAR`
  - `STYLE`
  - `RELEVANCE`
- ✅ Dynamic test for all valid codes

#### Invalid Inputs (9 tests)
- ✅ Returns `false` for:
  - Empty string
  - Lowercase valid codes (`accuracy`)
  - Mixed case codes (`Accuracy`)
  - Non-existent codes
  - Codes with whitespace
  - Similar but incorrect codes
  - Numeric strings
  - Special characters
  - Random strings

#### Edge Cases (4 tests)
- ✅ Returns `false` for:
  - Whitespace-only strings
  - Strings with newline characters
  - Strings with tab characters
  - Very long strings

#### Type Safety (5 tests)
- ✅ Handles unexpected types without throwing:
  - `null`
  - `undefined`
  - Numbers
  - Objects
  - Arrays

#### Performance (1 test)
- ✅ Validates 1000 codes in < 100ms

#### Consistency (2 tests)
- ✅ `isValid()` and `fromCode()` return consistent results

## Running Tests

```bash
# Run all tests
npm test

# Run only RankingType tests
npm test RankingType

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/types/__tests__/RankingType.test.ts
```

## Test Structure

```
src/types/__tests__/
└── RankingType.test.ts    # Unit tests for RankingType class
```

## Adding More Tests

When adding new ranking types to `RankingType.ts`:

1. The tests will automatically include them (dynamic test coverage)
2. Add specific test cases if needed for edge cases
3. Run tests to verify: `npm test`

## Coverage Report

To see detailed coverage:

```bash
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```
