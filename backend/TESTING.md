# Testing Guide

## Test Location Pattern

Tests live **next to the source file** they test:

```
src/
├── types/
│   ├── RankingType.ts
│   └── RankingType.test.ts          ✅
├── entities/
│   ├── Article.ts
│   └── Article.test.ts              ✅
├── repositories/
│   ├── ArticleRepository.ts
│   └── ArticleRepository.test.ts    ✅
├── services/
│   ├── ArticleService.ts
│   └── ArticleService.test.ts       ✅
├── controllers/
│   ├── ArticleController.ts
│   └── ArticleController.test.ts    ✅
└── routes/
    ├── articleRoutes.ts
    └── articleRoutes.test.ts        ✅
```

## Naming Convention

- Source: `ClassName.ts`
- Test: `ClassName.test.ts`

## Running Tests

```bash
npm test                    # All tests
npm test ArticleService     # Specific file
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage
```
