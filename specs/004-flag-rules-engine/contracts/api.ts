/**
 * Feature Flag Rules Engine - API Contract
 *
 * This file defines the public API contract for the feature flag rules engine.
 * Implementation MUST conform to these type signatures and documented behaviors.
 *
 * Feature: 004-flag-rules-engine
 * Date: 2026-01-19
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Valid subscription plan values.
 * Comparison is case-insensitive; values are normalized to lowercase internally.
 */
export type Plan = 'free' | 'pro' | 'enterprise';

/**
 * User context for feature flag evaluation.
 * All fields are required for evaluation.
 */
export interface UserContext {
  /** Unique user identifier. Case-sensitive. */
  userId: string;

  /** User's subscription plan. Case-insensitive on input. */
  plan: Plan;

  /** User's region as ISO 3166-1 alpha-2 code (e.g., "US", "GB"). */
  region: string;
}

/**
 * Single feature flag rule configuration.
 */
export interface FeatureFlagRule {
  /** Master toggle. If false, flag returns false for all users. Required. */
  enabled: boolean;

  /** Plans with access. Omit or empty = any plan matches. */
  plans?: Plan[];

  /** Regions with access. Omit or empty = any region matches. */
  regions?: string[];

  /** User IDs always granted access (bypasses plan/region checks). */
  allowlist?: string[];

  /** User IDs always denied access (highest precedence). */
  blocklist?: string[];
}

/**
 * Complete rules configuration loaded from YAML.
 */
export interface RulesConfiguration {
  /** Feature flags indexed by name. */
  flags: Record<string, FeatureFlagRule>;
}

/**
 * Opaque rules engine instance. Immutable after creation.
 */
export interface RulesEngine {
  /** Internal rules - do not access directly. */
  readonly rules: RulesConfiguration;
}

// =============================================================================
// Error Types
// =============================================================================

/**
 * Base error class for rules engine errors.
 */
export interface RulesEngineError extends Error {
  /** Error code for programmatic handling. */
  code: string;
}

/**
 * Thrown when YAML parsing fails.
 * @see FR-011
 */
export interface YamlParseError extends RulesEngineError {
  code: 'YAML_PARSE_ERROR';
  /** Original parse error message. */
  cause?: Error;
}

/**
 * Thrown when rule validation fails (missing/invalid fields).
 * @see FR-012, FR-014
 */
export interface ValidationError extends RulesEngineError {
  code: 'VALIDATION_ERROR';
  /** Path to invalid field (e.g., "flags.dark-mode.enabled"). */
  path?: string;
  /** The invalid value, if applicable. */
  value?: unknown;
}

/**
 * Thrown when user context is invalid during evaluation.
 * @see FR-013
 */
export interface EvaluationError extends RulesEngineError {
  code: 'EVALUATION_ERROR';
  /** Missing or invalid field name. */
  field?: string;
}

/**
 * Thrown when no rules are loaded before evaluation.
 */
export interface ConfigurationError extends RulesEngineError {
  code: 'CONFIGURATION_ERROR';
}

// =============================================================================
// Public API Functions
// =============================================================================

/**
 * Load and validate rules from a YAML string.
 *
 * @param yaml - YAML string containing rules configuration
 * @returns Immutable RulesEngine instance
 * @throws {YamlParseError} If YAML syntax is invalid (FR-011)
 * @throws {ValidationError} If rules fail schema validation (FR-012, FR-014)
 *
 * @example
 * ```typescript
 * const engine = loadRules(`
 *   flags:
 *     dark-mode:
 *       enabled: true
 *       plans: [pro, enterprise]
 * `);
 * ```
 */
export declare function loadRules(yaml: string): RulesEngine;

/**
 * Load and validate rules from a YAML file.
 *
 * @param filePath - Path to YAML file
 * @returns Immutable RulesEngine instance
 * @throws {YamlParseError} If YAML syntax is invalid (FR-011)
 * @throws {ValidationError} If rules fail schema validation (FR-012, FR-014)
 * @throws {Error} If file cannot be read
 *
 * @example
 * ```typescript
 * const engine = loadRulesFromFile('./config/flags.yaml');
 * ```
 */
export declare function loadRulesFromFile(filePath: string): RulesEngine;

/**
 * Evaluate a feature flag for a user.
 *
 * Evaluation order (short-circuit):
 * 1. If user in blocklist → false (FR-008, FR-009)
 * 2. If user in allowlist → true (FR-007)
 * 3. If enabled = false → false (FR-016)
 * 4. If plans specified and user.plan not in plans → false (FR-004)
 * 5. If regions specified and user.region not in regions → false (FR-005)
 * 6. Return true (all conditions passed)
 *
 * @param engine - RulesEngine instance from loadRules/loadRulesFromFile
 * @param flagName - Name of the feature flag to evaluate
 * @param context - User context for evaluation
 * @returns true if flag is enabled for user, false otherwise
 * @throws {EvaluationError} If user context is missing required fields (FR-013)
 *
 * @remarks
 * - Returns false for unknown flag names (fail-safe, FR-010)
 * - Plan comparison is case-insensitive
 * - User ID comparison is case-sensitive
 *
 * @example
 * ```typescript
 * const enabled = evaluate(engine, 'dark-mode', {
 *   userId: 'user-123',
 *   plan: 'pro',
 *   region: 'US'
 * });
 * ```
 */
export declare function evaluate(
  engine: RulesEngine,
  flagName: string,
  context: UserContext
): boolean;

// =============================================================================
// Alternative Fluent API
// =============================================================================

/**
 * Create a rules engine builder for fluent API usage.
 *
 * @returns Engine builder instance
 *
 * @example
 * ```typescript
 * const result = createEngine()
 *   .loadRules(yamlString)
 *   .evaluate('dark-mode', userContext);
 * ```
 */
export declare function createEngine(): {
  /**
   * Load rules from YAML string.
   * @throws {YamlParseError} If YAML syntax is invalid
   * @throws {ValidationError} If rules fail validation
   */
  loadRules(yaml: string): {
    /** Evaluate a flag for a user. */
    evaluate(flagName: string, context: UserContext): boolean;
    /** Get the underlying engine instance. */
    getEngine(): RulesEngine;
  };

  /**
   * Load rules from file path.
   * @throws {YamlParseError} If YAML syntax is invalid
   * @throws {ValidationError} If rules fail validation
   */
  loadRulesFromFile(filePath: string): {
    /** Evaluate a flag for a user. */
    evaluate(flagName: string, context: UserContext): boolean;
    /** Get the underlying engine instance. */
    getEngine(): RulesEngine;
  };
};
