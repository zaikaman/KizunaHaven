<!--
Sync Impact Report
==================
- Version change: 0.1.0 (Template) → 1.0.0 (Ratified)
- Modified principles:
  * [PRINCIPLE_1_NAME] → I. Code Quality & Modular ECS Architecture (Strict TypeScript & Separation of Concerns)
  * [PRINCIPLE_2_NAME] → II. Test-Driven Verification & System Isolation (TDD & Headless Testability)
  * [PRINCIPLE_3_NAME] → III. Mobile-First UX Consistency & Ergonomics (Touch-First & Safe-Area Compliance)
  * [PRINCIPLE_4_NAME] → IV. Mobile Performance Budgets & Resource Efficiency (60 FPS & Memory Limits)
  * [PRINCIPLE_5_NAME] → V. Asynchronous Resilience & Standalone Autonomy (24/7 World Continuity)
- Added sections:
  * Technical Stack & Platform Constraints
  * Development Workflow & Quality Gates
  * Governance & Amendment Rules
- Removed sections: N/A (template placeholders concretized)
- Templates requiring updates:
  * ✅ .specify/templates/plan-template.md (verified alignment with Constitution Check gates)
  * ✅ .specify/templates/spec-template.md (verified alignment with mobile UX and standalone criteria)
  * ✅ .specify/templates/tasks-template.md (verified alignment with ECS modular tasks and testing discipline)
- Follow-up TODOs: None (all placeholder tokens resolved)
-->

# Kizuna Haven Constitution

## Core Principles

### I. Code Quality & Modular ECS Architecture
- **Strict Typing**: All code MUST be written in TypeScript with strict type checking enabled (`strict: true`). Explicit interfaces and types MUST be defined for ECS component schemas, RPC events, and UI state models; usage of `any` is strictly prohibited.
- **Strict ECS Separation**: Logic, state, and visual presentation MUST be decoupled across three distinct layers:
  1. *Components* (`src/components/`): Pure schema definitions and data structures with zero side-effects.
  2. *Systems* (`src/systems/`): Deterministic game loops, state machines, and business logic that query and update components.
  3. *UI & Presentation* (`src/ui/`): Declarative, reactive UI layers implemented via `@dcl/sdk/react-ecs`.
- **Modularity & Single Responsibility**: Every feature, microgame, and social mechanic MUST be isolated in its own module with explicit public interfaces and minimal shared state.

### II. Test-Driven Verification & System Isolation
- **Test-First Discipline (NON-NEGOTIABLE)**: Core algorithms, puzzle resolution rules, leveling math, and state machines MUST follow a test-driven approach where automated test specifications are defined before implementation.
- **Headless Testability**: Game logic in systems and network synchronizers MUST be decoupled from engine-specific rendering so they can run and pass in headless Node.js/Vitest test suites.
- **Contract & Integration Verification**: All cross-module communication, guestbook/bottle mail payloads, daily hearth question schemas, and peer-to-peer sync payloads MUST have validation tests verifying schema compatibility and edge-case boundary conditions.
- **Coverage Standards**: Critical path game logic (scoring, co-op state transitions, daily prompt persistence) MUST maintain at least 80% branch test coverage.

### III. Mobile-First UX Consistency & Ergonomics
- **Touch-First Ergonomics**: All controls and user interfaces MUST be designed primarily for mobile touchscreens (thumb-arc accessibility in the bottom right, navigation in the bottom left).
- **Hitbox & Safe-Area Standards**: Interactive UI elements MUST have a minimum tap target size of $48 \times 48\text{ px}$ with appropriate visual spacing. All UI views MUST respect device safe areas (`ScreenInsetArea`) to avoid obstruction by screen cutouts, notches, or home indicator bars.
- **Tactile & Visual Feedback**: Every user interaction (tap, gesture, puzzle trigger, emote activation) MUST provide immediate audiovisual feedback within 100ms (state change highlight, sound trigger, or particle burst).
- **Design System Cohesion**: All UI screens, radial menus, and modal dialogs MUST share unified design tokens (typography scale, palette contrast, border radiuses, spacing units).

### IV. Mobile Performance Budgets & Resource Efficiency
- **60 FPS Mobile Benchmark**: Systems and scene animations MUST maintain a target frame rate of 60 FPS on standard mobile hardware, keeping frame execution times strictly under 16.6ms with minimal memory allocation churn.
- **Geometry & Draw Call Budgets**: Total scene geometry MUST remain within mobile thresholds ($\le 10,000$ triangles per active render zone; individual interactive props $\le 1,500$ triangles).
- **Texture & Asset Optimization**: All 3D assets (`.glb`) MUST be optimized and deduplicated with compressed textures. The uncompressed scene asset footprint MUST stay below 50MB.
- **Non-Blocking Execution**: Long-running operations, network sync reads, and heavy computations MUST be asynchronously batched or amortized across frames to prevent frame stutter.

### V. Asynchronous Resilience & Standalone Autonomy
- **24/7 Standalone Availability**: The world MUST be completely functional, engaging, and meaningful 24/7 as an autonomous experience without requiring live hosts, moderators, or scheduled events.
- **Solo Visitor Viability**: Solo players MUST have access to rich asynchronous mechanics (Daily Question Hearth, Floating Bottle Mail, Wishing Tree) and autonomous NPC spirit companions (Lumi) to operate collaborative puzzles without blocking.
- **Fault-Tolerant State Handling**: Network interruptions or peer disconnects MUST degrade gracefully without freezing client interaction or losing local player progress.

## Technical Stack & Platform Constraints

- **Platform Target**: Decentraland Mobile App (iOS & Android) and Desktop Web.
- **Core Framework**: Decentraland SDK 7 (`@dcl/sdk/ecs`, `@dcl/sdk/react-ecs`) with TypeScript 5.x.
- **Testing Framework**: Vitest / Node.js test runner with mocked ECS engine adapters.
- **Asset Pipeline**: glTF 2.0 / GLB models conforming to OpenDCL and Decentraland Scene Optimizer specifications.

## Development Workflow & Quality Gates

1. **Specification & Planning**: Every new feature MUST have an approved specification (`spec.md`) and implementation plan (`plan.md`) verifying compliance with the Core Principles.
2. **Quality Gates**:
   - `npm run lint` / `tsc --noEmit` must pass with zero errors and zero warnings.
   - `npm test` must execute and pass all unit and contract tests before merging.
   - Mobile safe-area, touch targets, and polycount budgets must be validated on mobile preview.
3. **Commit & Branch Standards**: Commits must follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `perf:`).

## Governance

- **Supremacy**: This Constitution represents the highest governing technical standard for the Kizuna Haven project. All architectural choices, PRs, and feature implementations MUST strictly comply.
- **Amendments**: Amendments require documented rationale, an assessment of impact on existing systems, and a corresponding version bump.
- **Versioning Policy**:
  - **MAJOR (x.0.0)**: Substantial changes, removals, or incompatible restructurings of core principles.
  - **MINOR (0.x.0)**: Addition of new principles or material expansions of existing guidelines.
  - **PATCH (0.0.x)**: Clarifications, typographic fixes, and non-semantic refinements.
- **Compliance Review**: Every pull request, design review, and feature plan must pass a Constitution Check verifying alignment before deployment.

**Version**: 1.0.0 | **Ratified**: 2026-08-20 | **Last Amended**: 2026-08-20
