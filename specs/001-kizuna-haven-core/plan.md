# Implementation Plan: Kizuna Haven Core Experience

**Branch**: `main` | **Feature Directory**: `specs/001-kizuna-haven-core` | **Date**: 2026-08-20  
**Spec**: [`specs/001-kizuna-haven-core/spec.md`](spec.md)  
**Input**: Feature specification from `/specs/001-kizuna-haven-core/spec.md`

---

## Summary

Build **Kizuna Haven**, a 24/7 mobile-first social playground and asynchronous gathering world for the Decentraland Friendzone Mobile Buildathon. The technical approach combines Decentraland SDK 7 ECS systems with `@dcl/sdk/react-ecs` for thumb-ergonomic mobile UI overlays, a hybrid peer-to-peer multiplayer state synchronizer for real-time co-op games (*Tandem Bridge Rush*, *Emote Synchro-Dance Floor*), deterministic 24-hour daily prompt rotation (*Daily Question Hearth*), asynchronous message bottle caching (*Bottle Mail Lagoon*), and an autonomous companion state machine (*Lumi*) to ensure solo visitor warmth.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 18+  
**Primary Dependencies**: Decentraland SDK 7 (`@dcl/sdk`, `@dcl/ecs`, `@dcl/react-ecs`, `@dcl/sdk/platform`)  
**Storage**: Decentraland World State / local client storage for profile progression & guestbook cache  
**Testing**: Vitest with mocked ECS world adapters for headless verification  
**Target Platform**: Decentraland Mobile App (iOS & Android) + Desktop Web Client  
**Project Type**: 3D Virtual World Scene & Mobile Social Experience  
**Performance Goals**: 60 FPS on standard mobile smartphones, frame execution $<16.6\text{ms}$, scene load $<3\text{s}$  
**Constraints**: Scene geometry $\le 10,000$ triangles per render zone, total uncompressed assets $\le 50\text{MB}$, min tap targets $48\times 48\text{ px}$, `ScreenInsetArea` safe-zone compliance, 24/7 standalone autonomy  
**Scale/Scope**: 1–50 concurrent players per world instance, 3 co-op micro-games, 3 asynchronous features, 1 viral photo/invite tool  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan Alignment & Status | Status |
| :--- | :--- | :--- | :--- |
| **I. Code Quality & Modular ECS** | Strict TypeScript (`strict: true`), pure ECS separation (`src/components/`, `src/systems/`, `src/ui/`), no `any`. | All models, system interfaces, and UI props strictly typed in TypeScript; logic isolated into systems. | **PASS** |
| **II. Test-Driven Verification** | Core algorithms, scoring, and state transitions tested headlessly before integration. | Vitest test suite configured for headless testing of puzzle state machines, daily prompt hashing, and bottle schemas. | **PASS** |
| **III. Mobile-First UX Ergonomics** | $48\times 48\text{ px}$ hitboxes, thumb-arc radial wheel, `ScreenInsetArea` safe-zones, no desktop keybinds. | Declarative `react-ecs` layouts with automatic notch insets and thumb-reachable radial menus. | **PASS** |
| **IV. Performance Budgets** | 60 FPS mobile target, $\le 10\text{k}$ triangles, $\le 50\text{MB}$ assets, non-blocking frame execution. | OpenDCL pre-optimized low-poly models, texture atlasing, lightweight FSM execution ($<0.2\text{ms}$/frame). | **PASS** |
| **V. Asynchronous Resilience** | 24/7 standalone availability, rich solo visitor mechanics, Lumi companion assist. | Deterministic daily prompts, lagoon bottle archive, and Lumi AI companion for solo puzzle testing. | **PASS** |

*All Constitution gates evaluated: PASS.*

---

## Project Structure

### Documentation (this feature)

```text
specs/001-kizuna-haven-core/
├── plan.md              # Implementation plan (this file)
├── research.md          # Architectural decisions and research findings
├── data-model.md        # Entity definitions, schemas, and state machines
├── quickstart.md        # Developer setup, build, test, and preview guide
├── contracts/           # Event contracts and UI component interfaces
│   ├── events-contract.md
│   └── ui-contract.md
└── checklists/
    └── requirements.md  # Specification quality validation checklist
```

### Source Code Layout

```text
d:/Friendzone/
├── package.json                       # SDK 7 & Vitest dependencies
├── tsconfig.json                      # Strict TypeScript compiler options
├── scene.json                         # DCL World metadata & spawn points
├── models/                            # Low-poly GLB assets from OpenDCL
│   ├── campfire_pit.glb
│   ├── log_bench.glb
│   ├── wishing_tree.glb
│   ├── bottle_mail.glb
│   └── puzzle_platform.glb
├── src/
│   ├── index.ts                       # World lifecycle & scene bootstrap
│   ├── config.ts                      # World coords, colors, tier tables
│   │
│   ├── components/                    # Pure ECS Component Schemas
│   │   ├── CoOpPlatform.ts            # Bridge states & trigger listeners
│   │   ├── BottleItem.ts              # Message payload & author info
│   │   ├── DanceFloorTile.ts          # Rhythm timing & light status
│   │   └── LumiCompanion.ts           # Companion FSM state & target coords
│   │
│   ├── systems/                       # Autonomous Game Loops & Logic
│   │   ├── TandemBridgeSystem.ts      # Real-time co-op puzzle mechanics
│   │   ├── RhythmBeatSystem.ts        # Dance timing & particle triggers
│   │   ├── DailyHearthSystem.ts       # 24hr prompt rotation & vote tally
│   │   ├── BottleLagoonSystem.ts      # Bottle spawning, floating & archiving
│   │   └── LumiCompanionSystem.ts     # Solo NPC bot pathing & puzzle help
│   │
│   ├── ui/                            # React-ECS Declarative Touch UI
│   │   ├── MobileHUD.tsx              # Top bar, level tier, camera trigger
│   │   ├── RadialSocialWheel.tsx      # Ergonomic thumb menu (high-five, hug)
│   │   ├── CoOpPuzzleHUD.tsx          # Timer, partner portrait, combo meter
│   │   ├── DailyPromptModal.tsx       # Question reading & answer submission
│   │   ├── BottleViewerModal.tsx      # Note reading & emoji reaction panel
│   │   └── PolaroidShareModal.tsx     # Photo frame with instant invite link
│   │
│   └── network/                       # State Synchronization
│       ├── StateBroadcaster.ts        # MessageBus multi-client sync
│       └── Persistence.ts             # Local/server storage for guestbook
│
└── tests/                             # Vitest Headless Test Suite
    ├── unit/
    │   ├── daily-hearth.test.ts       # Deterministic prompt calculation tests
    │   ├── tandem-bridge.test.ts      # Co-op state machine & role swap tests
    │   └── bottle-lagoon.test.ts      # Message payload validation & cap tests
    └── contracts/
        ├── events.test.ts             # MessageBus event payload schema tests
        └── ui-contracts.test.ts       # React-ECS props verification tests
```

**Structure Decision**: Single project layout optimized for Decentraland SDK 7 ECS + React-ECS architecture with dedicated headless test directories in accordance with Principle I & II of the Kizuna Haven Constitution.

---

## Complexity Tracking

> *No Constitution violations detected. Zero unjustified architectural complexity.*
