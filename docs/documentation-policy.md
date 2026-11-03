---
scope: project
---

# Documentation policy

This policy defines how project knowledge is recorded and kept current. It
applies to product code, documentation, development tooling, tests and
operations.

## Documentation scopes

Projects generated from wp-plugin-base distinguish two scopes:

- **project scope** — this `docs/` tree and the project's root files. It is
  the authoritative documentation of _this_ plugin and carries
  `scope: project` frontmatter.
- **base scope** — documentation of wp-plugin-base itself (architecture,
  ADRs, changelog). It lives in the base repository under `template-docs/` and
  is referenced by link, never copied here; it carries `scope: base`.

`npm run check:docs` enforces the scope markers. `docs/using-the-base/` is the
exception: those guides are project-scope and base-managed, so base upgrades
refresh them automatically.

## Audience and objective

Documentation must enable a human or AI system to:

1. find the authoritative statement for a topic;
2. trace an idea or roadmap outcome through requirements, decisions, work,
   verification and a release;
3. reproduce development, test, build, package and release workflows;
4. design a functionally equivalent implementation that satisfies documented
   functional and non-functional requirements.

Functionally equivalent does not mean byte-for-byte source recovery. The docs
describe stable contracts, constraints, observable behavior and rationale. Code
that merely happens to exist is not automatically a requirement.

## Document roles

- `requirements/` contains accepted, testable obligations.
- `architecture/` describes boundaries, components, flows and decisions.
- `user/` serves editors: visible controls, their location, effects and messages.
- `integrations/` owns public contracts for theme and adapter developers:
  attributes, CSS properties, PHP filters and JavaScript events.
- Site configuration in `operations/` serves website administrators.
- `development/` contains reproducible setup and contribution procedures.
- `testing/strategy.md` defines verification layers and their purpose.
- `testing/coverage.md` owns requirement-to-test mapping, coverage status and
  known verification gaps.
- `testing/automated.md` inventories automated suites and technical limits.
- `testing/manual-acceptance.md` defines reusable manual cases, not their
  execution results.
- `audits/` contains dated investigations and evidence, not current policy.
- `operations/` describes CI, releases, support and maintenance.
- `ideas.md` preserves uncommitted possibilities and open questions.
- `roadmap.md` describes desired outcomes and sequencing, not task checklists.
- `traceability.md` is a navigation index; linked source documents remain
  authoritative.
- GitHub issues are the actionable backlog, milestones are mutable release
  scope, and GitHub releases are immutable evidence of delivery.

## Stable identifiers

Use identifiers that are never reassigned:

- `RM-NNN` for roadmap outcomes;
- `IDEA-NNN` for ideas;
- `FR-NNN` for functional requirements;
- `NFR-NNN` for general non-functional requirements;
- `NFR-PRIV-NNN` for privacy requirements;
- `NFR-A11Y-NNN` for accessibility requirements;
- `MAN-NNN` for reusable manual acceptance cases;
- four-digit filenames for ADRs.

Place an explicit HTML anchor immediately before each identified heading, for
example `<a id="fr-nnn"></a>`. Links use the stable anchor and remain valid if
the title changes.

## Scope and status

Ideas, roadmap entries, requirements and decisions state a scope when it is not
obvious: `product`, `documentation`, `development`, `testing` or `operations`.
Cross-scope links are expected.

Idea statuses are `idea`, `evaluating`, `formalized`, `deferred` or `rejected`.
Roadmap statuses are `planned`, `in progress`, `delivered`, `deferred` or
`cancelled`. Requirements are `accepted`, `deprecated` or `retired`. ADRs use
`proposed`, `accepted`, `superseded` or `rejected`; decisions reconstructed from
evidence say `Accepted – documented retrospectively`.

Do not delete an idea when it is formalized or rejected. Keep a short record and
link its outcome. Large inactive collections may move to an archive while their
IDs and anchors remain resolvable.

## Relationship rules

- An idea links its origin, related roadmap outcomes and requirements that
  formalize it.
- A roadmap outcome links related ideas, accepted requirements, issues,
  milestones and releases.
- A requirement links its origin, relevant ADRs, implementation issue and
  verification where these exist.
- The coverage matrix owns the detailed mapping from requirements to automated
  evidence, manual cases, coverage status and known gaps.
- A manual case links the requirements it verifies. Automated suite ownership
  is summarized in `testing/automated.md` and linked from the coverage matrix.
- An ADR links evidence and affected requirements or architecture documents.
- A planned release links a GitHub milestone. After publication, also link the
  actual GitHub release.
- An uncommitted idea has no promised target release.

The same relationship may be shown in both directions for navigation. The
identified source entry owns its meaning. `traceability.md` summarizes lifecycle
and delivery relationships; it links to `testing/coverage.md` rather than
repeating test assignments.

## Required reconstruction detail

Architecture documentation records system and trust boundaries, external
dependencies, component responsibilities, public interfaces, invariants and
important data, state and event flows. Exact values are stated where required,
including minimum versions, event names, persistent keys and packaged files.

Workflow documentation records prerequisites, executable commands, triggers,
permissions, dependencies, inputs, outputs, artifacts, failure behavior and
manual approvals. A reader must not need to reverse engineer workflow YAML to
understand its contract.

Requirements describe observable behavior and constraints. Automated and manual
tests link back to the behavior they verify. Implementation details that can
change without altering a contract belong in code, not duplicated prose.

Current platform, tool and test versions are summarized in the
[project version matrix](development/versions.md). Executable configuration is
authoritative and the documentation check verifies the matrix against it.
Requirements and ADRs may retain exact values that define a contract or recorded
decision. Audit records may retain dated values. Other documents link to the
matrix instead of copying current version numbers.

## Change workflow and ownership

The product owner decides product intent, priority, release commitments, legal
assessment and acceptance of significant trade-offs. Codex or another
contributor may inventory changes, draft requirements and ADRs, update links,
maintain traceability, identify drift and prepare verification. Significant
product or architecture decisions remain subject to human review.

Every pull request answers:

- Does observable behavior or a public interface change?
- Is a requirement added, changed, deprecated or retired?
- Is an architectural decision added or superseded?
- Does the change affect an idea, roadmap outcome or target release?
- Do setup, tests, operations or user guidance change?
- If no documentation changes are needed, why not?

Documentation changes ship with the code or workflow change they describe. A
separate docs-only pull request is appropriate for restructuring, corrections
or retrospective records that do not change behavior.

## Document update rules

Review the indicated documents when a change occurs. A review may conclude that
no edit is necessary, but that conclusion should be explicit in the pull
request.

Manual cases use a stable ID, requirement links, test objective, prerequisites,
procedure and observable expected results. State any material limitation of the
case. Coverage status describes the available verification methods, not whether
a particular release passed them.

| Change                                             | Documents to review or update                                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Observable product or integration behavior         | Requirements, affected editorial guidance or integration contracts, architecture, coverage and traceability |
| Requirement added, changed, deprecated or retired  | Requirement source, coverage and traceability                                                               |
| Architectural boundary or consequential decision   | Architecture overview or runtime, ADRs, affected requirements and traceability                              |
| Automated suite or verification responsibility     | Automated testing inventory, coverage and development workflow when commands change                         |
| Manual acceptance scope or expected result         | Manual acceptance cases and coverage                                                                        |
| Known verification gap opened or closed            | Coverage, related idea or issue, and affected requirement where its claim changes                           |
| Setup, tool, platform or test-environment version  | Executable configuration, version matrix, setup and affected operations documentation                       |
| CI, packaging or release process                   | Development architecture, operations documentation and affected ADRs                                        |
| Release candidate accepted or published            | Release audit, roadmap delivery link, traceability and release notes                                        |
| Dated investigation or risk decision               | Audit record and the current policy or procedure that links to it                                           |
| Idea accepted, rejected or scheduled               | Idea register, roadmap, related requirements and traceability                                               |
| Issue, milestone or delivery relationship changes  | Traceability and the owning idea, roadmap or requirement entry                                              |
| Support or security process changes                | Maintenance, SECURITY.md and affected user or release guidance                                              |
| Separate MCP investigation changes                 | MCP documentation and its local index                                                                       |
| Document added, moved, renamed or retired          | Documentation index, affected links and document roles in this policy                                       |
| Document audience or entry point changes           | Role-based reading paths and question-based navigation in index.md                                          |
| Historical fact corrected                          | Dated record or project history with the correction's source; preserve the original scope and date          |
| Documentation ownership or validation rules change | This policy, documentation checks and affected contribution guidance                                        |

Actual test executions, failures, waivers and accepted residual risks belong in
a dated audit record. Reusable testing documents contain procedures and expected
results only.

## Verification and release reconciliation

For documentation changes, check Markdown structure, internal paths, stable
anchors and traceability references with `npm run check:docs`. The documentation
job runs in every CI class, including full product checks. See the
[CI contract](operations/ci.md).

Before a release, reconcile:

```text
milestone → closed issues → requirements and ADRs → tests → roadmap → release notes
```

At least quarterly, and before every release, review stale roadmap targets,
formalized ideas, minimum platform statements, external dependencies, manual
acceptance records and links to source or release artifacts.

## Reuse and OpenSpec

This documentation schema originates from the
[wp-plugin-base](https://github.com/quasipapa/wp-plugin-base) template. Do not
introduce a second requirement source (e.g. OpenSpec) without a dedicated ADR.

## Audience and single ownership

The index provides reading paths for WordPress editors, WordPress website
administrators, WordPress theme and integration developers, plugin developers,
plugin testers, plugin maintainers / release owners and plugin product owners.
Use these qualified names when identifying an audience. Each path states
reading priority and links to the owning documents. Document purposes remain
defined under Document roles; technical content remains in its owning document.
AI assistance follows the path of the role it performs and the applicable
repository instructions.

Explain editor tasks using visible interface labels in `user/`. Keep code,
serialized attribute schemas and event payloads in `integrations/`. Architecture
explains implementation mechanisms and decisions, linking to the public contracts.
Administration instructions own site-wide configuration and responsibilities.

Describe each interface, procedure or historical observation in its owning
location. Other documents provide short context and links. Test instructions
belong in `testing/`; execution results belong in `audits/`. When splitting or
moving content, preserve technical details, update inbound links and consolidate
overlapping checks into the existing manual cases. Changes to UI labels require
review of editorial instructions; changes to public interfaces require review
of their integration contracts and architectural references.
