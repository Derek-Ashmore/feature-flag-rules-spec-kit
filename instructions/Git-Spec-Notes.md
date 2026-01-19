# Git Spec Notes

## MVP Clarify Questions and Answers

```
 Question 1 of up to 5

  The spec mentions region-based targeting using ISO country codes but doesn't specify whether rules can target multiple
   regions (e.g., EU countries) or only a single region per condition.

  Recommended: Option B - Multiple regions per rule provides practical value for common use cases like "EU countries" or
   "North America" without adding significant complexity.
  ┌────────┬────────────────────────────────────────────────────────────────────────┐
  │ Option │                              Description                               │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ A      │ Single region per rule condition (e.g., region: "US")                  │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ B      │ Multiple regions per rule condition (e.g., region: ["US", "CA", "MX"]) │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ C      │ Both single and array syntax supported                                 │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ Short  │ Provide a different short answer (<=5 words)                           │
  └────────┴────────────────────────────────────────────────────────────────────────┘
  You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or
  provide your own short answer.
```

> Answer:  B

```
Question 2 of up to 5

  For consistency with the multi-region approach, should plan-based targeting also support multiple plans per rule
  condition?

  Recommended: Option B - Supporting multiple plans per rule (e.g., plans: ["pro", "enterprise"]) provides consistency
  with region targeting and covers the common "pro or higher" use case cleanly.
  ┌────────┬────────────────────────────────────────────────────────────────────────┐
  │ Option │                              Description                               │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ A      │ Single plan per rule condition (e.g., plan: "pro")                     │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ B      │ Multiple plans per rule condition (e.g., plans: ["pro", "enterprise"]) │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ C      │ Both single and array syntax supported                                 │
  ├────────┼────────────────────────────────────────────────────────────────────────┤
  │ Short  │ Provide a different short answer (<=5 words)                           │
  └────────┴────────────────────────────────────────────────────────────────────────┘
  You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or
  provide your own short answer.
```

> Answer:  B

```
Question 3 of up to 5

  When a rule omits a condition (e.g., no plans or regions specified), how should the engine interpret that missing
  condition?

  Recommended: Option A - Treating omitted conditions as "match any" is the most intuitive and flexible approach. It
  allows rules like "enable for all regions" without listing every country code, and follows the principle of least
  surprise.
  ┌────────┬─────────────────────────────────────────────────────────────────────────────────────────┐
  │ Option │                                       Description                                       │
  ├────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
  │ A      │ Omitted condition means "match any" (permissive)                                        │
  ├────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
  │ B      │ Omitted condition means "match none" (restrictive, rule invalid without all conditions) │
  ├────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
  │ C      │ Require all conditions; omitted conditions cause validation error on load               │
  ├────────┼─────────────────────────────────────────────────────────────────────────────────────────┤
  │ Short  │ Provide a different short answer (<=5 words)                                            │
  └────────┴─────────────────────────────────────────────────────────────────────────────────────────┘
  You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or
  provide your own short answer.
```

> Answer:  A

```
Question 4 of up to 5

  Should feature flag rules have an explicit enabled toggle, or is the presence of a rule with matching conditions
  sufficient to enable the flag?

  Recommended: Option B - An explicit enabled: true/false toggle allows operators to quickly disable a feature without
  deleting or modifying rule conditions. This is a common safety pattern for kill switches and incident response.
  ┌────────┬─────────────────────────────────────────────────────────────────────────────┐
  │ Option │                                 Description                                 │
  ├────────┼─────────────────────────────────────────────────────────────────────────────┤
  │ A      │ Presence of matching rule = enabled; no explicit toggle needed              │
  ├────────┼─────────────────────────────────────────────────────────────────────────────┤
  │ B      │ Rules have enabled: true/false toggle; disabled rules always return false   │
  ├────────┼─────────────────────────────────────────────────────────────────────────────┤
  │ C      │ Rules default to enabled but can be explicitly disabled with enabled: false │
  ├────────┼─────────────────────────────────────────────────────────────────────────────┤
  │ Short  │ Provide a different short answer (<=5 words)                                │
  └────────┴─────────────────────────────────────────────────────────────────────────────┘
  You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or
  provide your own short answer.
```

> Answer:  B

```
 Question 5 of up to 5

  What is the target runtime/language for this library?

  Suggested: TypeScript (Node.js) - TypeScript provides type safety for the rule schema and user context, strong
  ecosystem support for YAML parsing, and is commonly used for developer-facing libraries.

  Format: Short answer (<=5 words). You can accept the suggestion by saying "yes" or "suggested", or provide your own
  answer.
```

> Answer:  yes