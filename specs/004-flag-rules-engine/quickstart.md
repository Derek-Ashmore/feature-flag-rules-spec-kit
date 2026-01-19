# Quickstart: Feature Flag Rules Engine

A simple, static rules engine for evaluating feature flags based on user context.

## Installation

```bash
npm install feature-flag-rules-engine
```

## Basic Usage

### 1. Define Rules in YAML

Create a `flags.yaml` file:

```yaml
flags:
  dark-mode:
    enabled: true
    plans:
      - pro
      - enterprise

  beta-feature:
    enabled: true
    allowlist:
      - user-beta-001
      - user-beta-002

  regional-feature:
    enabled: true
    regions:
      - US
      - CA
```

### 2. Load and Evaluate

```typescript
import { loadRulesFromFile, evaluate } from 'feature-flag-rules-engine';

// Load rules from file
const engine = loadRulesFromFile('./flags.yaml');

// Define user context
const user = {
  userId: 'user-123',
  plan: 'pro',
  region: 'US'
};

// Check if feature is enabled
if (evaluate(engine, 'dark-mode', user)) {
  // Enable dark mode UI
}
```

## Loading Rules

### From YAML String

```typescript
import { loadRules } from 'feature-flag-rules-engine';

const yaml = `
flags:
  my-feature:
    enabled: true
    plans: [pro, enterprise]
`;

const engine = loadRules(yaml);
```

### From File

```typescript
import { loadRulesFromFile } from 'feature-flag-rules-engine';

const engine = loadRulesFromFile('./config/flags.yaml');
```

## User Context

Every evaluation requires a user context with three fields:

```typescript
interface UserContext {
  userId: string;     // Unique user identifier (case-sensitive)
  plan: Plan;         // 'free' | 'pro' | 'enterprise' (case-insensitive)
  region: string;     // ISO country code, e.g., 'US', 'GB'
}
```

## Rule Configuration

### Required Field

Every rule MUST have an `enabled` field:

```yaml
flags:
  my-feature:
    enabled: true  # Required!
```

### Plan Targeting

Restrict access by subscription plan:

```yaml
flags:
  premium-analytics:
    enabled: true
    plans:
      - pro
      - enterprise
```

### Region Targeting

Restrict access by geographic region:

```yaml
flags:
  eu-compliance:
    enabled: true
    regions:
      - DE
      - FR
      - IT
      - ES
```

### Combined Conditions (AND Logic)

When both plans and regions are specified, ALL conditions must match:

```yaml
flags:
  premium-us-feature:
    enabled: true
    plans:
      - enterprise
    regions:
      - US
# User must have enterprise plan AND be in US
```

### Allowlist (Beta Access)

Grant access to specific users regardless of plan/region:

```yaml
flags:
  experimental-ui:
    enabled: true
    allowlist:
      - user-tester-001
      - user-vip-042
```

### Blocklist (Deny Access)

Block specific users regardless of other conditions:

```yaml
flags:
  premium-feature:
    enabled: true
    plans: [pro, enterprise]
    blocklist:
      - user-banned-123
```

**Note**: Blocklist takes precedence over allowlist.

### Omitted Conditions

Omitting a condition means "any value matches":

```yaml
flags:
  # Any plan, any region
  global-feature:
    enabled: true

  # Any region, specific plans
  pro-feature:
    enabled: true
    plans: [pro, enterprise]

  # Any plan, specific regions
  us-only:
    enabled: true
    regions: [US]
```

## Evaluation Behavior

### Unknown Flags

Evaluating a flag that doesn't exist returns `false` (fail-safe):

```typescript
evaluate(engine, 'nonexistent-flag', user); // Returns false
```

### Disabled Flags

A flag with `enabled: false` always returns `false`:

```yaml
flags:
  maintenance-mode:
    enabled: false
```

```typescript
evaluate(engine, 'maintenance-mode', user); // Always false
```

## Error Handling

```typescript
import {
  loadRules,
  YamlParseError,
  ValidationError,
  EvaluationError
} from 'feature-flag-rules-engine';

try {
  const engine = loadRules(yamlString);
  const enabled = evaluate(engine, 'my-flag', user);
} catch (error) {
  if (error instanceof YamlParseError) {
    // Invalid YAML syntax
    console.error('YAML parse error:', error.message);
  } else if (error instanceof ValidationError) {
    // Missing required field or invalid value
    console.error('Validation error:', error.message, error.path);
  } else if (error instanceof EvaluationError) {
    // User context missing required fields
    console.error('Evaluation error:', error.message, error.field);
  }
}
```

## Fluent API (Alternative)

```typescript
import { createEngine } from 'feature-flag-rules-engine';

const enabled = createEngine()
  .loadRulesFromFile('./flags.yaml')
  .evaluate('dark-mode', {
    userId: 'user-123',
    plan: 'pro',
    region: 'US'
  });
```

## Complete Example

```yaml
# flags.yaml
flags:
  # Premium feature for paying customers
  advanced-analytics:
    enabled: true
    plans:
      - pro
      - enterprise

  # Beta feature for testers
  new-dashboard:
    enabled: true
    allowlist:
      - beta-tester-001
      - beta-tester-002
    blocklist:
      - problem-user-999

  # Region-specific compliance feature
  gdpr-tools:
    enabled: true
    regions:
      - DE
      - FR
      - IT
      - ES
      - NL
      - BE

  # Kill switch (always off)
  deprecated-feature:
    enabled: false
```

```typescript
import { loadRulesFromFile, evaluate, UserContext } from 'feature-flag-rules-engine';

const engine = loadRulesFromFile('./flags.yaml');

function checkFeatures(user: UserContext) {
  return {
    advancedAnalytics: evaluate(engine, 'advanced-analytics', user),
    newDashboard: evaluate(engine, 'new-dashboard', user),
    gdprTools: evaluate(engine, 'gdpr-tools', user),
    deprecatedFeature: evaluate(engine, 'deprecated-feature', user),
  };
}

// Example usage
const features = checkFeatures({
  userId: 'beta-tester-001',
  plan: 'free',
  region: 'DE'
});

console.log(features);
// {
//   advancedAnalytics: false,  // free plan, not in [pro, enterprise]
//   newDashboard: true,        // in allowlist
//   gdprTools: true,           // DE is in regions list
//   deprecatedFeature: false   // enabled: false
// }
```
