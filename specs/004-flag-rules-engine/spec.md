# Feature Specification: Feature Flag Rules Engine

**Feature Branch**: `004-flag-rules-engine`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "A simple, static rules engine that determines which features are enabled for a user based on their plan, region, and user ID. Rule definitions are authored in YAML. The engine evaluates flags against a user context containing userId, plan (free/pro/enterprise), and region (ISO country codes). Rules use AND logic where all conditions must match. Supports allowlist and blocklist targeting by user ID. Returns boolean values. This establishes the foundation for the feature flag rules engine library."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evaluate Feature Flag for User (Priority: P1)

As a developer integrating the rules engine, I want to check if a specific feature is enabled for a given user so that I can conditionally enable or disable functionality in my application.

**Why this priority**: This is the core functionality of the entire library. Without the ability to evaluate a flag against a user context, the engine provides no value.

**Independent Test**: Can be fully tested by loading a YAML rule file, creating a user context, and calling the evaluation function to receive a boolean result.

**Acceptance Scenarios**:

1. **Given** a YAML file with a feature flag rule requiring plan "pro", **When** evaluating for a user with plan "pro" and matching region, **Then** the engine returns `true`
2. **Given** a YAML file with a feature flag rule requiring plan "enterprise", **When** evaluating for a user with plan "free", **Then** the engine returns `false`
3. **Given** a YAML file with a feature flag rule requiring region "US", **When** evaluating for a user with region "CA", **Then** the engine returns `false`
4. **Given** a YAML file with multiple conditions (plan AND region), **When** all conditions match the user context, **Then** the engine returns `true`
5. **Given** a YAML file with multiple conditions (plan AND region), **When** any condition does not match the user context, **Then** the engine returns `false`

---

### User Story 2 - Target Users by Allowlist (Priority: P2)

As a product manager, I want to enable features for specific users by their user ID so that I can grant early access to beta testers or VIP customers regardless of their plan or region.

**Why this priority**: Allowlist targeting is essential for beta testing, gradual rollouts, and handling special cases. It's the second most common use case after standard rule evaluation.

**Independent Test**: Can be fully tested by creating a rule with an allowlist of user IDs and verifying that only those users receive `true` while others receive `false`.

**Acceptance Scenarios**:

1. **Given** a feature flag with an allowlist containing user ID "user-123", **When** evaluating for user "user-123", **Then** the engine returns `true`
2. **Given** a feature flag with an allowlist containing user IDs "user-123" and "user-456", **When** evaluating for user "user-789", **Then** the engine returns `false`
3. **Given** a feature flag with an allowlist and other conditions (plan, region), **When** the user is in the allowlist, **Then** the engine returns `true` regardless of other conditions

---

### User Story 3 - Exclude Users by Blocklist (Priority: P3)

As a product manager, I want to disable features for specific users by their user ID so that I can prevent problematic users or specific accounts from accessing certain functionality.

**Why this priority**: Blocklist targeting handles exception cases and is less frequently needed than allowlist, but still important for operational control.

**Independent Test**: Can be fully tested by creating a rule with a blocklist of user IDs and verifying that those users receive `false` while others are evaluated normally.

**Acceptance Scenarios**:

1. **Given** a feature flag with a blocklist containing user ID "blocked-user", **When** evaluating for user "blocked-user", **Then** the engine returns `false`
2. **Given** a feature flag with a blocklist containing user ID "blocked-user", **When** evaluating for user "normal-user" who matches all other conditions, **Then** the engine returns `true`
3. **Given** a feature flag where a user is on both allowlist and blocklist, **When** evaluating for that user, **Then** the blocklist takes precedence and the engine returns `false`

---

### User Story 4 - Load Rules from YAML (Priority: P1)

As a developer, I want to define feature flag rules in YAML format so that I can manage feature configurations in a human-readable, version-controllable format.

**Why this priority**: YAML loading is a foundational capability required for all other user stories to function. Tied with P1 as it's a prerequisite.

**Independent Test**: Can be fully tested by providing a valid YAML string or file and verifying the rules are parsed correctly into the internal representation.

**Acceptance Scenarios**:

1. **Given** a valid YAML string defining a feature flag, **When** loading the rules, **Then** the engine successfully parses and stores the rule configuration
2. **Given** a YAML file path, **When** loading the rules, **Then** the engine reads the file and parses the rules
3. **Given** an invalid YAML format, **When** attempting to load the rules, **Then** the engine provides a clear error message indicating the parsing failure
4. **Given** a YAML file with missing required fields, **When** loading the rules, **Then** the engine provides a clear error message indicating which fields are missing

---

### Edge Cases

- What happens when a feature flag name doesn't exist in the loaded rules? Engine returns `false` (fail-safe default)
- What happens when the user context is missing required fields (userId, plan, or region)? Engine returns an error indicating the missing field
- What happens when the YAML contains an unrecognized plan value (not free/pro/enterprise)? Engine provides a validation error on load
- What happens when the YAML contains an invalid region code? Engine accepts any string as region (validation is caller's responsibility)
- What happens when the allowlist or blocklist is empty? Engine ignores empty lists and evaluates other conditions normally
- What happens when no rules file is loaded before evaluation? Engine returns an error indicating no rules are configured

## Clarifications

### Session 2026-01-19

- Q: Can rules target multiple regions or only a single region per condition? → A: Multiple regions per rule condition (e.g., `region: ["US", "CA", "MX"]`)
- Q: Should plan-based targeting support multiple plans per rule condition? → A: Multiple plans per rule condition (e.g., `plans: ["pro", "enterprise"]`)
- Q: When a rule omits a condition (plans/regions), how should the engine interpret it? → A: Omitted condition means "match any" (permissive)
- Q: Should rules have an explicit enabled toggle or is presence sufficient? → A: Rules have `enabled: true/false` toggle; disabled rules always return `false`
- Q: What is the target runtime/language for this library? → A: TypeScript (Node.js)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST evaluate feature flags and return boolean values (`true` for enabled, `false` for disabled)
- **FR-002**: System MUST support user context containing three fields: userId (string), plan (free/pro/enterprise), and region (ISO country code string)
- **FR-003**: System MUST load and parse rule definitions from YAML format
- **FR-004**: System MUST support plan-based targeting where a rule specifies one or more plans (as an array) that have access (free, pro, enterprise); user matches if their plan is in the array
- **FR-005**: System MUST support region-based targeting where a rule specifies one or more regions (as an array) that have access using ISO country codes; user matches if their region is in the array
- **FR-006**: System MUST apply AND logic when multiple conditions are specified (all conditions must match for `true`)
- **FR-007**: System MUST support allowlist targeting where specific user IDs are granted access regardless of other conditions
- **FR-008**: System MUST support blocklist targeting where specific user IDs are denied access regardless of other conditions
- **FR-009**: System MUST give blocklist precedence over allowlist when a user appears in both
- **FR-010**: System MUST return `false` (fail-safe) when evaluating a feature flag that doesn't exist in the loaded rules
- **FR-011**: System MUST provide clear error messages for invalid YAML format during rule loading
- **FR-012**: System MUST provide clear error messages for missing required fields in rule definitions
- **FR-013**: System MUST provide clear error messages when user context is missing required fields during evaluation
- **FR-014**: System MUST validate plan values in rules against the allowed set (free, pro, enterprise) during loading
- **FR-015**: System MUST treat omitted conditions (plans or regions not specified in a rule) as "match any", allowing the rule to pass that condition for all users
- **FR-016**: System MUST support an `enabled` boolean field on each rule; rules with `enabled: false` MUST return `false` without evaluating other conditions
- **FR-017**: System MUST require the `enabled` field on each rule (no implicit default)

### Key Entities

- **Feature Flag Rule**: Represents a single feature flag configuration including its name, enabled toggle, targeting conditions (plans array, regions array), and user lists (allowlist, blocklist)
- **User Context**: Represents the current user being evaluated, containing userId (unique identifier), plan (subscription tier), and region (geographic location as ISO country code)
- **Rules Configuration**: The complete set of feature flag rules loaded from YAML, indexed by feature flag name for lookup during evaluation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can evaluate a feature flag for a user in a single function call
- **SC-002**: Rule authors can define a new feature flag rule in under 5 minutes using YAML
- **SC-003**: 100% of rule evaluations produce consistent, deterministic results for the same input
- **SC-004**: System provides actionable error messages that identify the specific problem (e.g., "Missing required field 'plan' in rule 'dark-mode'")
- **SC-005**: All feature flag evaluations return within 10 milliseconds for a rules file containing up to 100 rules
- **SC-006**: The YAML rule format is self-documenting enough that a new developer understands a rule's behavior by reading it

## Assumptions

- The library is implemented in TypeScript targeting Node.js runtime
- Region values in user context are provided as valid ISO 3166-1 alpha-2 country codes by the caller (e.g., "US", "CA", "GB"); the engine does not validate region code format
- User IDs are case-sensitive strings; "User-123" and "user-123" are treated as different users
- The engine operates synchronously; rule loading and evaluation are blocking operations
- Rules are static after loading; the engine does not watch for file changes or support hot-reloading
- A single rules file may contain multiple feature flag definitions
- Plan comparison is case-insensitive; "Pro", "PRO", and "pro" are treated as equivalent
