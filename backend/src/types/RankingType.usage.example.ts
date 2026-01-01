/**
 * Usage Examples for RankingType Class
 *
 * This file demonstrates how to use the RankingType value object
 * throughout your application.
 *
 * NOTE: This is an example file for documentation purposes.
 * You can delete this file after reviewing the examples.
 */

import { RankingType } from './RankingType';
import { Ranking, RankingHelpers, CreateRankingDTO } from '../entities/Ranking';

// ============================================================
// Example 1: Using predefined ranking type constants
// ============================================================

function example1_UsingConstants() {
  // ✅ Use static constants instead of hardcoded strings
  const accuracyType = RankingType.ACCURACY;

  console.log(accuracyType.code);         // 'ACCURACY'
  console.log(accuracyType.description);  // 'Accuracy Rating'
  console.log(accuracyType.toString());   // 'ACCURACY: Accuracy Rating'
}

// ============================================================
// Example 2: Creating rankings with type safety
// ============================================================

async function example2_CreateRanking(userId: string, value: number) {
  const newRanking: CreateRankingDTO = {
    id: 'ranking-123',
    ranking_type: RankingType.ACCURACY.code,  // ✅ Type-safe constant
    user_id: userId,
    value: value
  };

  // Insert into database
  // await db.insert('rankings', newRanking);
}

// ============================================================
// Example 3: Validating ranking types from user input
// ============================================================

function example3_ValidateUserInput(userProvidedCode: string) {
  // Validate that the code is valid
  if (!RankingType.isValid(userProvidedCode)) {
    throw new Error(`Invalid ranking type: ${userProvidedCode}`);
  }

  // Convert string code to RankingType object
  const rankingType = RankingType.fromCode(userProvidedCode);

  if (rankingType) {
    console.log(`Valid type: ${rankingType.description}`);
  }
}

// ============================================================
// Example 4: API endpoint returning all ranking types
// ============================================================

function example4_GetAllRankingTypes() {
  // Get all available ranking types for a dropdown/select
  const allTypes = RankingType.getAll().map(rt => rt.toJSON());

  // Returns:
  // [
  //   { code: 'ACCURACY', description: 'Accuracy Rating' },
  //   { code: 'QUALITY', description: 'Quality Rating' },
  //   { code: 'GRAMMAR', description: 'Grammar Rating' },
  //   ...
  // ]

  return allTypes;
}

// ============================================================
// Example 5: Using helpers with database entities
// ============================================================

function example5_WorkingWithRankingEntity(ranking: Ranking) {
  // Get the RankingType object from the ranking entity
  const rankingType = RankingHelpers.getRankingType(ranking);

  if (rankingType) {
    console.log(`This is a ${rankingType.description} ranking`);
  }

  // Check if ranking has valid type
  if (RankingHelpers.hasValidType(ranking)) {
    console.log('Valid ranking type');
  }

  // Get description directly
  const description = RankingHelpers.getTypeDescription(ranking);
  console.log(description);
}

// ============================================================
// Example 6: Filtering rankings by type
// ============================================================

async function example6_FilterByType(allRankings: Ranking[]) {
  // Filter for only accuracy rankings
  const accuracyRankings = allRankings.filter(
    r => r.ranking_type === RankingType.ACCURACY.code
  );

  return accuracyRankings;
}

// ============================================================
// Example 7: Switch statement with ranking types
// ============================================================

function example7_ProcessByType(ranking: Ranking) {
  const type = RankingHelpers.getRankingType(ranking);

  if (!type) {
    throw new Error('Invalid ranking type');
  }

  // Use reference equality for comparison
  if (type === RankingType.ACCURACY) {
    console.log('Processing accuracy ranking');
  } else if (type === RankingType.QUALITY) {
    console.log('Processing quality ranking');
  } else if (type === RankingType.GRAMMAR) {
    console.log('Processing grammar ranking');
  }

  // Or use code comparison
  switch (ranking.ranking_type) {
    case RankingType.ACCURACY.code:
      console.log('Accuracy ranking');
      break;
    case RankingType.QUALITY.code:
      console.log('Quality ranking');
      break;
    default:
      console.log('Other ranking type');
  }
}

// ============================================================
// Example 8: Express API endpoint examples
// ============================================================

// Example API routes using RankingType:
/*
import express from 'express';
import { RankingType } from './types/RankingType';

const app = express();

// GET /api/ranking-types - List all available ranking types
app.get('/api/ranking-types', (req, res) => {
  const types = RankingType.getAll().map(rt => ({
    code: rt.code,
    description: rt.description
  }));

  res.json(types);
});

// POST /api/rankings - Create a new ranking
app.post('/api/rankings', async (req, res) => {
  const { ranking_type, user_id, value } = req.body;

  // Validate ranking type
  if (!RankingType.isValid(ranking_type)) {
    return res.status(400).json({
      error: 'Invalid ranking type',
      validTypes: RankingType.getCodes()
    });
  }

  // Create ranking with validated type
  const newRanking: CreateRankingDTO = {
    id: generateId(),
    ranking_type: ranking_type,
    user_id: user_id,
    value: value
  };

  // await db.insert('rankings', newRanking);
  res.status(201).json({ success: true });
});

// GET /api/rankings/accuracy/:userId - Get accuracy rankings for user
app.get('/api/rankings/accuracy/:userId', async (req, res) => {
  const userId = req.params.userId;

  // Use constant instead of hardcoded string
  const rankings = await db.query(
    'SELECT * FROM rankings WHERE user_id = ? AND ranking_type = ?',
    [userId, RankingType.ACCURACY.code]
  );

  res.json(rankings);
});
*/

// ============================================================
// Key Benefits of Using RankingType Class:
// ============================================================

/*
1. TYPE SAFETY: Can't accidentally use invalid ranking type codes
   ✅ RankingType.ACCURACY.code
   ❌ 'ACCRUACY' (typo caught by IDE)

2. AUTOCOMPLETE: IDE shows all available types
   RankingType. <-- IDE shows ACCURACY, QUALITY, GRAMMAR, etc.

3. REFACTORING: If you change a code, all usages update
   Change 'ACCURACY' to 'ACCURACY_SCORE' in one place

4. VALIDATION: Easy to validate user input
   RankingType.isValid(userInput)

5. DOCUMENTATION: Self-documenting code
   RankingType.ACCURACY is clearer than 'ACCURACY'

6. NO MAGIC STRINGS: All ranking type codes in one place
   Easy to see what types exist
*/
