/**
 * RankingType represents a type of ranking/rating in the system.
 * This is a value object with a fixed set of valid instances.
 *
 * Use the static constants (e.g., RankingType.ACCURACY) throughout your code
 * instead of hardcoding strings.
 */
export class RankingType {
  /**
   * Private constructor prevents creating invalid instances.
   * Only the predefined static instances can exist.
   */
  private constructor(
    public readonly code: string,
    public readonly description: string
  ) {}

  // ============================================================
  // Define all valid ranking types here
  // ============================================================

  static readonly ACCURACY = new RankingType(
    'ACCURACY',
    'Accuracy Rating'
  );

  static readonly QUALITY = new RankingType(
    'QUALITY',
    'Quality Rating'
  );

  static readonly GRAMMAR = new RankingType(
    'GRAMMAR',
    'Grammar Rating'
  );

  static readonly STYLE = new RankingType(
    'STYLE',
    'Style Rating'
  );

  static readonly RELEVANCE = new RankingType(
    'RELEVANCE',
    'Relevance Rating'
  );

  static readonly OBJECTIVITY = new RankingType(
      'OBJECTIVITY',
      'Is an article Objective? Use of evidence and citations.'
  );

  static readonly OFFENSIVE = new RankingType(
      'OFFENSIVE',
      'Is an article Offensive? Presence of hedging words (maybe, might, could) vs definitive claims.'
  );

  static readonly LOGICAL = new RankingType(
      'LOGICAL',
      "Is an article Logical? Doesn't it contain inner contradictions?"
  );

  static readonly BALANCED = new RankingType(
      'BALANCED',
      'Balance of viewpoints. If the particular opinion is not declared as an absolute truth?'
  );

  static readonly EMOTIONAL = new RankingType(
      'EMOTIONAL',
      'Use of factual vs emotional language.'
  );

  // ============================================================
  // Helper methods
  // ============================================================

  /**
   * Get all valid ranking types.
   * @returns Array of all RankingType instances
   */
  static getAll(): RankingType[] {
    return [
      RankingType.ACCURACY,
      RankingType.QUALITY,
      RankingType.GRAMMAR,
      RankingType.STYLE,
      RankingType.RELEVANCE,
      RankingType.OBJECTIVITY,
      RankingType.OFFENSIVE,
      RankingType.LOGICAL,
      RankingType.BALANCED,
      RankingType.EMOTIONAL,
    ];
  }

  /**
   * Find a RankingType by its code.
   * @param code - The ranking type code (e.g., 'ACCURACY')
   * @returns The matching RankingType or undefined if not found
   */
  static fromCode(code: string): RankingType | undefined {
    return RankingType.getAll().find(rt => rt.code === code);
  }

  /**
   * Check if a code is a valid ranking type.
   * @param code - The code to validate
   * @returns true if the code matches a valid ranking type
   */
  static isValid(code: string): boolean {
    return RankingType.getAll().some(rt => rt.code === code);
  }

  /**
   * Get all valid ranking type codes.
   * @returns Array of all valid codes
   */
  static getCodes(): string[] {
    return RankingType.getAll().map(rt => rt.code);
  }

  // ============================================================
  // Instance methods
  // ============================================================

  /**
   * Check if this ranking type equals another.
   * @param other - Another RankingType to compare
   * @returns true if they have the same code
   */
  equals(other: RankingType): boolean {
    return this.code === other.code;
  }

  /**
   * String representation of this ranking type.
   * @returns Formatted string with code and description
   */
  toString(): string {
    return `${this.code}: ${this.description}`;
  }

  /**
   * Convert to a plain object for JSON serialization.
   * @returns Plain object with code and description
   */
  toJSON(): { code: string; description: string } {
    return {
      code: this.code,
      description: this.description
    };
  }
}
