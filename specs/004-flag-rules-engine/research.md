# Research: Feature Flag Rules Engine

**Feature**: 004-flag-rules-engine | **Date**: 2026-01-19

## Research Tasks

This document captures technology decisions and best practices research for the feature flag rules engine implementation.

---

## 1. YAML Parsing Library Selection

**Decision**: js-yaml

**Rationale**:
- Most widely adopted YAML parser for Node.js (40M+ weekly downloads)
- Supports YAML 1.1 and 1.2 specifications
- Synchronous API aligns with spec requirements (no async operations)
- Mature, well-maintained, minimal dependencies
- `safeLoad` function prevents code execution vulnerabilities

**Alternatives Considered**:

| Library | Rejected Because |
|---------|------------------|
| yaml | Larger bundle size, more features than needed |
| yamljs | Less maintained, fewer downloads |
| js-yaml-loader | Webpack-specific, not a general parser |

**Implementation Notes**:
- Use `yaml.load()` with default safe schema
- Wrap in try-catch for parse error handling per FR-011

---

## 2. Schema Validation Library Selection

**Decision**: Zod

**Rationale**:
- TypeScript-first with excellent type inference
- Runtime validation matches compile-time types automatically
- Clear, composable error messages align with FR-011, FR-012
- Zero dependencies
- Supports custom error messages for user-friendly validation errors

**Alternatives Considered**:

| Library | Rejected Because |
|---------|------------------|
| Joi | Not TypeScript-native, requires separate type definitions |
| Yup | Less precise TypeScript inference |
| io-ts | Steeper learning curve, more verbose |
| ajv | JSON Schema-based, more complex setup for simple schemas |

**Implementation Notes**:
- Define Zod schemas that mirror TypeScript interfaces
- Use `.parse()` for validation with automatic error throwing
- Customize error messages for required field validation (FR-012)

---

## 3. Testing Framework Selection

**Decision**: Vitest

**Rationale**:
- Native TypeScript support without configuration
- Jest-compatible API (familiar patterns)
- Fast execution with native ESM support
- Built-in coverage reporting
- Watch mode for development

**Alternatives Considered**:

| Library | Rejected Because |
|---------|------------------|
| Jest | Requires ts-jest or babel configuration |
| Mocha | Requires separate assertion library, more setup |
| Node test runner | Less mature ecosystem, fewer features |

**Implementation Notes**:
- Configure with `vitest.config.ts`
- Use `describe` blocks per user story (US1-US4)
- Target 90%+ coverage for core logic

---

## 4. YAML Rule Schema Design

**Decision**: Flat structure with explicit field names

**Rationale**:
- Matches spec requirements (FR-004, FR-005, FR-016, FR-017)
- Self-documenting format (SC-006)
- Easy to validate with Zod
- Supports arrays for plans and regions per clarifications

**Schema Structure**:

```yaml
flags:
  feature-name:
    enabled: true
    plans: ["pro", "enterprise"]    # Optional: omit = any plan
    regions: ["US", "CA", "GB"]     # Optional: omit = any region
    allowlist: ["user-123"]         # Optional
    blocklist: ["user-456"]         # Optional
```

**Alternatives Considered**:

| Structure | Rejected Because |
|-----------|------------------|
| Nested conditions object | More complex, no benefit for AND-only logic |
| Separate files per flag | Overhead for typical use case of <100 flags |
| JSON format | Less human-readable, spec requires YAML |

---

## 5. Error Handling Strategy

**Decision**: Custom error classes with specific error codes

**Rationale**:
- Enables programmatic error handling by consumers
- Provides actionable messages per SC-004
- Distinguishes parse errors from validation errors from evaluation errors

**Error Types**:

| Error Class | Use Case |
|-------------|----------|
| `YamlParseError` | Invalid YAML syntax (FR-011) |
| `ValidationError` | Missing/invalid fields in rules (FR-012, FR-014) |
| `EvaluationError` | Missing user context fields (FR-013) |
| `ConfigurationError` | No rules loaded (edge case) |

**Implementation Notes**:
- Extend `Error` base class
- Include `code` property for programmatic handling
- Include `field` or `rule` property for context

---

## 6. Evaluation Order and Short-Circuit Logic

**Decision**: Blocklist → Allowlist → Enabled → Conditions

**Rationale**:
- Blocklist precedence required by FR-009
- Short-circuit on disabled rules saves evaluation time (FR-016)
- Allowlist bypass aligns with FR-007

**Evaluation Flow**:

```
1. If user in blocklist → return false (FR-008, FR-009)
2. If user in allowlist → return true (FR-007)
3. If enabled = false → return false (FR-016)
4. If plans specified and user.plan not in plans → return false
5. If regions specified and user.region not in regions → return false
6. Return true (all conditions passed)
```

---

## 7. Plan Value Normalization

**Decision**: Case-insensitive comparison via lowercase normalization

**Rationale**:
- Spec assumption: "Pro", "PRO", "pro" treated as equivalent
- Normalize on load for consistent storage
- Compare normalized values during evaluation

**Implementation Notes**:
- Store plans as lowercase in internal representation
- Normalize user context plan on evaluation
- Validate against lowercase set: `["free", "pro", "enterprise"]`

---

## 8. Public API Design

**Decision**: Functional API with single engine instance

**Rationale**:
- Simple API aligns with SC-001 (single function call)
- No class instantiation overhead for basic use case
- Supports advanced use with explicit engine management

**API Surface**:

```typescript
// Primary API
loadRules(yamlString: string): RulesEngine
loadRulesFromFile(filePath: string): RulesEngine
evaluate(engine: RulesEngine, flagName: string, context: UserContext): boolean

// Alternative: fluent API
createEngine()
  .loadRules(yaml)
  .evaluate(flagName, context)
```

**Implementation Notes**:
- Export both functional and fluent APIs
- Engine is immutable after loading (no mutation)
- Synchronous operations per spec assumption

---

## Summary

All technical decisions made. No NEEDS CLARIFICATION items remain. Ready for Phase 1 design artifacts.

| Category | Decision |
|----------|----------|
| YAML Parser | js-yaml |
| Validation | Zod |
| Testing | Vitest |
| Schema | Flat YAML with arrays |
| Errors | Custom error classes |
| Eval Order | Blocklist → Allowlist → Enabled → Conditions |
| Plan Compare | Case-insensitive (lowercase) |
| API Style | Functional + optional fluent |
