<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version Change: N/A (initial) → 1.0.0

  Modified Principles:
    - N/A (initial constitution)

  Added Sections:
    - Core Principles (5 principles defined)
    - Development Workflow (trunk-based, PR testing, coverage)
    - Documentation Standards (spec-first artifacts)
    - Governance (amendment procedures, versioning, compliance)

  Removed Sections:
    - N/A (initial constitution)

  Templates Requiring Updates:
    - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section)
    - .specify/templates/spec-template.md: ✅ Compatible (user stories, requirements)
    - .specify/templates/tasks-template.md: ✅ Compatible (phase structure)
    - .specify/templates/checklist-template.md: ✅ Compatible (no principle refs)
    - .specify/templates/agent-file-template.md: ✅ Compatible (no principle refs)

  Follow-up TODOs:
    - None
  ============================================================================
-->

# Feature Flag Rules Constitution

## Core Principles

### I. Specification-First

All features MUST begin with a complete specification before implementation starts.

**Non-Negotiable Rules:**
- Every feature MUST have a `spec.md` document defining user stories, requirements, and
  success criteria before any code is written
- Specifications MUST include prioritized user stories (P1, P2, P3) that are independently
  testable
- Each user story MUST define acceptance scenarios using Given/When/Then format
- Functional requirements MUST use precise language (MUST, SHOULD, MAY) per RFC 2119
- Requirements marked `NEEDS CLARIFICATION` MUST be resolved before implementation begins

**Rationale:** Specification-first development ensures alignment between stakeholders,
prevents scope creep, and provides clear acceptance criteria for testing.

### II. Integration-First Testing

Integration and contract tests take priority over unit tests; tests MUST validate real
system behavior.

**Non-Negotiable Rules:**
- Contract tests MUST exist for all API endpoints before implementation is complete
- Integration tests MUST cover each user story's primary happy path
- Tests MUST run against real dependencies when feasible (databases, external services)
- Mock usage is permitted only when external dependencies are unavailable or prohibitively
  slow
- Test coverage for pull requests MUST be documented in the PR description
- Tests MUST be organized by user story to enable independent validation

**Rationale:** Integration tests catch real-world failures that unit tests miss. Contract
tests ensure API stability across changes.

### III. Simplicity and YAGNI

Code MUST solve today's problem with minimal complexity; do not build for hypothetical
futures.

**Non-Negotiable Rules:**
- Features MUST NOT be added until explicitly required by a specification
- Abstractions MUST NOT be introduced until the third concrete use case (Rule of Three)
- Code complexity MUST be justified in the plan's Complexity Tracking table
- Prefer three similar lines over one premature abstraction
- Delete unused code immediately; do not comment it out or deprecate with shims
- Configuration and extensibility points MUST be added only when the spec requires them

**Rationale:** Premature abstraction and speculative features increase maintenance burden
and obscure intent. Simple code is easier to test, review, and modify.

### IV. Trunk-Based Development

All work happens on short-lived feature branches that merge frequently to main.

**Non-Negotiable Rules:**
- Feature branches MUST be prefixed with issue number: `###-feature-name`
- Branches MUST NOT live longer than necessary to complete the feature
- All merges to main MUST pass automated CI checks (GitHub Actions workflow)
- Pull requests MUST include test coverage documentation
- Main branch MUST always be in a deployable state
- Merge conflicts MUST be resolved by rebasing on latest main before merge

**Rationale:** Trunk-based development reduces integration pain, catches issues early, and
keeps the team synchronized on a single source of truth.

### V. Documentation as Artifact

Documentation is a first-class deliverable, not an afterthought.

**Non-Negotiable Rules:**
- Specifications (`spec.md`) MUST be approved before implementation planning begins
- Implementation plans (`plan.md`) MUST be approved before task generation
- Task lists (`tasks.md`) MUST reference source specifications and plans
- Each spec directory MUST contain: `spec.md`, `plan.md`, `tasks.md` at minimum
- Quickstart documentation MUST be validated as part of the final implementation phase
- Changes to specifications MUST be versioned and require explicit approval

**Rationale:** Documentation-as-artifact ensures knowledge transfer, enables async review,
and provides an audit trail for decisions.

## Development Workflow

### Pull Request Process

1. Create feature branch from main: `###-feature-name`
2. Implement changes following tasks.md order
3. Ensure all local tests pass
4. Open pull request against main
5. GitHub Actions automatically runs test suite
6. Document test coverage in PR description
7. Obtain required approvals
8. Merge via squash or rebase (no merge commits)

### Quality Gates

| Gate | Trigger | Requirements |
|------|---------|--------------|
| Specification Review | Before planning | spec.md approved by stakeholder |
| Plan Review | Before task generation | plan.md Constitution Check passes |
| PR Automated Tests | PR created/updated | All CI checks green |
| PR Coverage | Before merge | Coverage documented in PR |
| Main Protection | Always | Main branch requires passing CI |

### Branch Naming

- Feature: `###-feature-name` (e.g., `42-add-user-auth`)
- Bugfix: `###-fix-description` (e.g., `57-fix-login-redirect`)
- Hotfix: `hotfix/###-description` (only for production emergencies)

## Documentation Standards

### Required Artifacts per Feature

```
specs/###-feature-name/
├── spec.md          # User stories, requirements, success criteria
├── plan.md          # Technical approach, constitution check, structure
├── research.md      # Discovery findings (if applicable)
├── data-model.md    # Entity definitions (if applicable)
├── contracts/       # API contracts (if applicable)
├── tasks.md         # Implementation task list
└── quickstart.md    # Usage documentation (validated in final phase)
```

### Artifact Dependencies

- `spec.md` → `plan.md` → `tasks.md` (strict ordering)
- `research.md` informs `plan.md`
- `contracts/` inform `tasks.md` test tasks
- `quickstart.md` validates final implementation

## Governance

### Constitution Authority

This constitution supersedes all other development practices, guidelines, and conventions
within this project. Conflicts between this constitution and other documentation MUST be
resolved in favor of the constitution.

### Amendment Procedure

1. Propose amendment via pull request modifying this file
2. Document rationale for the change
3. Obtain approval from project maintainers
4. Update `CONSTITUTION_VERSION` according to semantic versioning:
   - **MAJOR**: Principle removal or fundamental redefinition
   - **MINOR**: New principle or significant expansion of existing guidance
   - **PATCH**: Clarifications, wording improvements, non-semantic changes
5. Update `LAST_AMENDED_DATE` to amendment merge date
6. Propagate changes to dependent templates

### Compliance Review

- All pull requests SHOULD be checked against constitution principles
- Plan documents MUST include a Constitution Check section
- Violations MUST be justified in the Complexity Tracking table or rejected
- Periodic reviews (quarterly) SHOULD verify template alignment

### Templates Under Constitution

The following templates MUST remain aligned with this constitution:
- `.specify/templates/spec-template.md`
- `.specify/templates/plan-template.md`
- `.specify/templates/tasks-template.md`
- `.specify/templates/checklist-template.md`
- `.specify/templates/agent-file-template.md`

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18
