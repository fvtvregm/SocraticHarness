---
name: readme-architecture-tracker
description: Teaches the agent to log detailed file-level changes, map dependencies and architectural impact, and update feature completion checkmarks in README.md. Use when editing files, implementing architecture features, or updating project documentation.
---

# README & Architecture Progress Tracker

Keep project documentation synchronized with code changes by recording file-level modifications, mapping app-wide impacts, and updating completion checkmarks in `README.md`.

## When to Use

- Implementing or refactoring features across the codebase.
- Modifying files that affect other modules or application logic.
- Updating `README.md` or system architecture tracking logs as tasks are completed.

## Workflow & Directives

1. **Review System Architecture & Task Roadmap**
   - Read `README.md` and relevant architecture docs to verify feature scope, module boundaries, and dependency mappings before writing code.

2. **Document File-Level Modifications**
   - For every file created or edited, maintain a log detailing:
     - **File Path**: Exact path of the modified or created file.
     - **Action Taken**: Explicit summary of what functions, UI components, or variables were added, edited, or removed.
     - **App Impact**: How this specific modification alters overall application behavior and downstream dependent files or packages.

3. **Log Cross-Module & Architectural Effects**
   - Note any cross-package imports, schema interface updates (Pydantic/TypeScript), state management shifts, or protocol scheme routes (`cortex://`).

4. **Update Feature Checkmarks in `README.md`**
   - Locate the target task in `README.md`.
   - Change unchecked tasks (`- [ ]`) to checked (`- [x]`) only after implementation and integration points pass verification.
   - Append the file-by-file impact summary to the release or activity log in `README.md`.

## Example Log Format

```markdown
### Implementation Log: Custom Protocol Handler

- **Modified**: `packages/shell-desktop/src/protocol.ts`
  - **Action**: Registered `cortex://` custom protocol schema handler.
  - **App Impact**: Enables internal links in Markdown notes to open directly in the desktop shell graph node viewer.
  - **Dependencies**: Modifies routing behavior in `packages/learnharness-core/src/graph.ts`.

- [x] Register `cortex://` custom protocol scheme handler in desktop shell