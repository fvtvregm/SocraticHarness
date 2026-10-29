# CortexOS / SocraticHarness Monorepo Agent Rules (.cursorrules)

## 1. Monorepo Directory Boundaries & Component Stitching
- Directory Map:
  - `vault/`: Reor Markdown notes[cite: 1].
  - `graph_vault/`: LearnHarness graph database state[cite: 1].
  - `open-sunsama/` & `learnharness-core/`: Cloned reference modules[cite: 1].
  - `desktop-shell/`: Unified frontend UI shell[cite: 1].
  - `bridge-service/`: Central backend communication gateway & APIs[cite: 1].
- Stitching Law: Always search `packages/reor-core/`, `packages/learnharness-core/`, `packages/sunsama-core/`, and `packages/timeline-reference/` before creating new UI components. Reuse or adapt existing primitives first.

## 2. Design System & Global UI Tokens
- Visual Identity: Replicate LearnHarness's sleek academic identity across all main tabs (`Notes`, `Calendar`, `Learning`)[cite: 1].
- Token Enforcement: Apply CSS variable tokens (`var(--bg-primary)`, `var(--accent-color)`, `var(--radius-ui)`) across all CSS/Tailwind modules. Hardcoded hex values or inline style overrides are prohibited.
- State Synchronization: Ensure all desktop shell views wrap inside the root `ThemeStore` provider so dark/light theme switching updates synchronously without page reloads[cite: 1].

## 3. Dual-Vault Isolation & Cortex Protocol Schema
- Strict Boundary: Never store Markdown documents inside `graph_vault/` or JSON graph nodes inside `vault/`.
- Protocol Routing: Route all cross-vault links and local file references through the `cortex://` custom protocol schema[cite: 1].
- Metadata Pointers: Store lightweight metadata pointers in LearnHarness graph nodes that resolve to Reor Markdown paths via `cortex://`[cite: 1].

## 4. Ingestion Rules & Frontmatter Filtering
- Selective Indexing: Only process files containing `source: learnharness` or `indexed: true` frontmatter.
- Binary Bypassing: Explicitly ignore non-text attachments (PDFs, images, audio files) in vector chunking pipelines[cite: 1].

## 5. Execution Environment & Sandboxing
- Headless Visualizations: Execute Matplotlib/Seaborn visualization scripts in isolated backend runtimes and output rendered assets directly into vault asset directories[cite: 1].
- Inline Demos: Intercept interactive demo blocks in Markdown and render them within isolated HTML iframe sandboxes[cite: 1].
- Background Pre-Generation: Orchestrate Open Sunsama background daemons and asynchronous cron workers to pre-cache diagnostic quizzes and summary cards prior to calendar study blocks[cite: 1].

## 6. Operating Modes & Assistant Toggles
- General Mode: Handles open-ended multi-source RAG queries (web, user files, vector-chunked notes)[cite: 1].
- Timeline Mode: Parses uploaded course syllabi into granular subtopic timelines and calendar allocations[cite: 1].
- Bot Switching: Ensure UI controls explicitly switch context between the General RAG assistant and the Socratic teaching bot[cite: 1].