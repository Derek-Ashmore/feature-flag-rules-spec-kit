# Data Model: Feature Flag Rules Engine

**Feature**: 004-flag-rules-engine | **Date**: 2026-01-19

## Entities

### UserContext

Represents the current user being evaluated against feature flag rules.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| userId | string | Yes | Non-empty | Unique identifier for the user. Case-sensitive. |
| plan | Plan | Yes | One of: free, pro, enterprise | User's subscription tier. Case-insensitive on input. |
| region | string | Yes | Non-empty | ISO 3166-1 alpha-2 country code (e.g., "US", "GB"). Not validated by engine. |

**TypeScript Definition**:

```typescript
type Plan = 'free' | 'pro' | 'enterprise';

interface UserContext {
  userId: string;
  plan: Plan;
  region: string;
}
```

---

### FeatureFlagRule

Represents a single feature flag configuration defining who has access.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| enabled | boolean | Yes | - | Master toggle. If false, flag returns false for all users. |
| plans | Plan[] | No | Valid plan values | Plans that have access. Omit = any plan matches. |
| regions | string[] | No | Non-empty strings | Regions that have access. Omit = any region matches. |
| allowlist | string[] | No | Non-empty strings | User IDs granted access regardless of other conditions. |
| blocklist | string[] | No | Non-empty strings | User IDs denied access regardless of other conditions. |

**TypeScript Definition**:

```typescript
interface FeatureFlagRule {
  enabled: boolean;
  plans?: Plan[];
  regions?: string[];
  allowlist?: string[];
  blocklist?: string[];
}
```

**Validation Rules**:
- `enabled` field is required (FR-017)
- `plans` values must be one of: free, pro, enterprise (FR-014)
- Empty arrays are treated as "not specified" (omitted condition)

---

### RulesConfiguration

The complete set of feature flag rules loaded from YAML.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| flags | Map<string, FeatureFlagRule> | Yes | Feature flags indexed by name |

**TypeScript Definition**:

```typescript
interface RulesConfiguration {
  flags: Record<string, FeatureFlagRule>;
}
```

---

### RulesEngine

Internal runtime representation holding loaded rules.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rules | RulesConfiguration | Yes | Validated and normalized rules |

**TypeScript Definition**:

```typescript
interface RulesEngine {
  readonly rules: RulesConfiguration;
}
```

**Invariants**:
- Immutable after creation
- All plan values normalized to lowercase
- All rules validated against schema

---

## YAML Schema

The external representation of rules in YAML format.

```yaml
# Required root key
flags:
  # Feature flag name (string key)
  dark-mode:
    # Required: master toggle
    enabled: true

    # Optional: plans with access (array)
    plans:
      - pro
      - enterprise

    # Optional: regions with access (array)
    regions:
      - US
      - CA
      - GB

    # Optional: user IDs always granted access
    allowlist:
      - user-beta-001
      - user-vip-042

    # Optional: user IDs always denied access
    blocklist:
      - user-banned-123

  # Another flag with minimal config
  new-checkout:
    enabled: false
```

---

## State Transitions

The rules engine has minimal state with the following transitions:

```
[Uninitialized] --loadRules()--> [Loaded]
[Loaded] --evaluate()--> [Loaded] (no state change, returns boolean)
```

**States**:
- **Uninitialized**: No rules loaded. `evaluate()` returns `ConfigurationError`.
- **Loaded**: Rules validated and stored. Ready for evaluation.

---

## Relationships

```
┌─────────────────┐
│  RulesEngine    │
│                 │
│  rules ────────►│ RulesConfiguration
└─────────────────┘          │
                             │ flags (1:N)
                             ▼
                   ┌─────────────────────┐
                   │  FeatureFlagRule    │
                   │                     │
                   │  - enabled          │
                   │  - plans[]          │
                   │  - regions[]        │
                   │  - allowlist[]      │
                   │  - blocklist[]      │
                   └─────────────────────┘
                             │
                             │ evaluated against
                             ▼
                   ┌─────────────────────┐
                   │    UserContext      │
                   │                     │
                   │  - userId           │
                   │  - plan             │
                   │  - region           │
                   └─────────────────────┘
```

---

## Validation Summary

| Entity | Validation Point | Error Type |
|--------|-----------------|------------|
| YAML syntax | loadRules() | YamlParseError |
| RulesConfiguration schema | loadRules() | ValidationError |
| FeatureFlagRule.enabled required | loadRules() | ValidationError |
| FeatureFlagRule.plans values | loadRules() | ValidationError |
| UserContext required fields | evaluate() | EvaluationError |
