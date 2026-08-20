# Tasks: Kizuna Haven Core Experience

**Input**: Design documents from `/specs/001-kizuna-haven-core/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Tests**: Tests are included per Constitution Principle II (Test-Driven Verification for state machines & contracts).  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., `[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, SDK 7 dependencies, and testing harness setup

- [ ] T001 Initialize package.json with Decentraland SDK 7, React-ECS, and Vitest in package.json
- [ ] T002 [P] Configure strict TypeScript compiler options in tsconfig.json
- [ ] T003 [P] Create Decentraland World metadata and spawn configuration in scene.json
- [ ] T004 [P] Create world configuration constants, colors, and level tables in src/config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core ECS scene engine, type definitions, and event bus infrastructure

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Implement core TypeScript data models and interfaces in src/types/index.ts
- [ ] T006 [P] Implement base MessageBus network broadcaster and listener in src/network/StateBroadcaster.ts
- [ ] T007 [P] Implement local and session storage adapter in src/network/Persistence.ts
- [ ] T008 Implement main world bootstrap and ECS system registration in src/index.ts
- [ ] T009 [P] Create Vitest mocked ECS engine environment and helpers in tests/setup.ts

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Solo Visitor Warmth & Asynchronous Social Engagement (Priority: P1) 🎯 MVP

**Goal**: Deliver a standalone, living 24/7 world for solo visitors featuring the Daily Question Hearth, Floating Bottle Mail lagoon, and autonomous Lumi spirit companion.

**Independent Test**: A solo visitor logs into the world, answers the 24-hour Daily Prompt, fishes out and reacts to a bottle note in the lagoon, launches a new bottle message, and explores with the Lumi spirit guide.

### Tests for User Story 1

- [ ] T010 [P] [US1] Unit test for deterministic daily prompt date hashing and vote tally in tests/unit/daily-hearth.test.ts
- [ ] T011 [P] [US1] Unit test for bottle mail payload validation, storage, and 20-bottle cap in tests/unit/bottle-lagoon.test.ts
- [ ] T012 [P] [US1] Unit test for Lumi companion FSM transitions (IDLE, FOLLOW, ASSIST) in tests/unit/lumi-companion.test.ts

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement BottleItem and DailyHearth ECS components in src/components/AsynchComponents.ts
- [ ] T014 [P] [US1] Implement LumiCompanion ECS component in src/components/LumiCompanion.ts
- [ ] T015 [US1] Implement DailyHearthSystem for 24-hour question rotation in src/systems/DailyHearthSystem.ts
- [ ] T016 [US1] Implement BottleLagoonSystem for spawning, floating physics, and archiving in src/systems/BottleLagoonSystem.ts
- [ ] T017 [US1] Implement LumiCompanionSystem for autonomous guidance and plate assist in src/systems/LumiCompanionSystem.ts
- [ ] T018 [P] [US1] Implement DailyPromptModal UI component in src/ui/DailyPromptModal.tsx
- [ ] T019 [P] [US1] Implement BottleViewerModal UI component in src/ui/BottleViewerModal.tsx
- [ ] T020 [US1] Assemble campfire, wishing tree, and lagoon 3D environment props in src/scenes/CampfireHubScene.ts

**Checkpoint**: User Story 1 is fully functional and testable as an autonomous solo MVP.

---

## Phase 4: User Story 2 - Real-Time Synchronous Co-Op Micro-Games (Priority: P2)

**Goal**: Enable high-energy, 2-to-4 player cooperative gameplay with *Tandem Bridge Rush* asymmetric platforming and the *Emote Synchro-Dance Floor*.

**Independent Test**: Two players step on the staging pads, complete a full run of *Tandem Bridge Rush* with operator bridge activations and runner checkpoint role-swapping, and dance on the rhythm floor for combo multipliers.

### Tests for User Story 2

- [ ] T021 [P] [US2] Unit test for Tandem Bridge Rush state machine, timer, and role swapping in tests/unit/tandem-bridge.test.ts
- [ ] T022 [P] [US2] Unit test for rhythm beat sync timing and combo multiplier calculation in tests/unit/rhythm-beat.test.ts
- [ ] T023 [P] [US2] Contract test for co-op multiplayer sync payloads in tests/contracts/coop-events.test.ts

### Implementation for User Story 2

- [ ] T024 [P] [US2] Implement CoOpPlatform and DanceFloorTile ECS components in src/components/CoOpComponents.ts
- [ ] T025 [US2] Implement TandemBridgeSystem for real-time bridge activations and role swaps in src/systems/TandemBridgeSystem.ts
- [ ] T026 [US2] Implement RhythmBeatSystem for dance floor timing and combo multipliers in src/systems/RhythmBeatSystem.ts
- [ ] T027 [P] [US2] Implement CoOpPuzzleHUD UI component for timer, roles, and glyph pads in src/ui/CoOpPuzzleHUD.tsx
- [ ] T028 [P] [US2] Implement DanceFloorHUD UI component for beat prompt rings in src/ui/DanceFloorHUD.tsx
- [ ] T029 [US2] Assemble floating canyon puzzle platforms, star shards, and dance floor in src/scenes/CoOpArenaScene.ts

**Checkpoint**: User Stories 1 AND 2 work independently and collaboratively.

---

## Phase 5: User Story 3 - Mobile Touch Ergonomics & Viral Social Sharing (Priority: P3)

**Goal**: Deliver thumb-arc radial social controls, safe-area layout compliance, and an in-world Polaroid camera with deep-link viral warp invites.

**Independent Test**: A mobile user opens the right-thumb radial menu, triggers a high-five with a nearby friend, opens the Polaroid camera, snaps a photo, and copies the coordinate deep-link URL.

### Tests for User Story 3

- [ ] T030 [P] [US3] Unit test for deep-link coordinate URL formatting and profile XP leveling in tests/unit/social-viral.test.ts
- [ ] T031 [P] [US3] Contract test for UI component props and ScreenInsetArea compliance in tests/contracts/ui-contracts.test.ts

### Implementation for User Story 3

- [ ] T032 [P] [US3] Implement MobileHUD top status bar with level tier and camera trigger in src/ui/MobileHUD.tsx
- [ ] T033 [P] [US3] Implement RadialSocialWheel ergonomic right-thumb menu in src/ui/RadialSocialWheel.tsx
- [ ] T034 [P] [US3] Implement PolaroidShareModal with photo frame and 1-tap warp link copy in src/ui/PolaroidShareModal.tsx
- [ ] T035 [US3] Implement SocialGestureSystem for synchronized high-fives and hugs in src/systems/SocialGestureSystem.ts
- [ ] T036 [US3] Wrap all UI overlays with ScreenInsetArea safe-zone container in src/ui/MainAppUI.tsx

**Checkpoint**: All three user stories are completely functional with full mobile touch ergonomics and viral loops.

---

## Phase 6: Polish & Mobile Optimization

**Purpose**: 60 FPS mobile performance tuning, asset optimization, and submission packaging

- [ ] T037 [P] Optimize GLB models and texture atlases with Decentraland Scene Optimizer in models/
- [ ] T038 Validate mobile safe-area insets, 48px tap targets, and touch responsiveness across orientations
- [ ] T039 Run full test suite (`npm test`) and strict TypeScript type-checking (`npm run build`)
- [ ] T040 Update README.md with project architecture, mobile screenshots, and DoraHacks submission details

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phases 3–5)**: Depend on Foundational phase completion.
  - Phase 3 (US1 - Asynchronous Hub) → MVP release.
  - Phase 4 (US2 - Co-Op Games) → High-energy multiplayer.
  - Phase 5 (US3 - Radial Wheel & Polaroid) → Mobile touch & virality.
- **Polish (Phase 6)**: Depends on all user stories being complete.

---

## Parallel Execution Examples

### User Story 1 (Phase 3)
```bash
# Tests in parallel:
T010 (daily-hearth.test.ts) & T011 (bottle-lagoon.test.ts) & T012 (lumi-companion.test.ts)

# UI components in parallel:
T018 (DailyPromptModal.tsx) & T019 (BottleViewerModal.tsx)
```

### User Story 2 (Phase 4)
```bash
# Tests in parallel:
T021 (tandem-bridge.test.ts) & T022 (rhythm-beat.test.ts) & T023 (coop-events.test.ts)

# UI HUDs in parallel:
T027 (CoOpPuzzleHUD.tsx) & T028 (DanceFloorHUD.tsx)
```

---

## Implementation Strategy

1. **MVP First (User Story 1)**: Complete Phases 1, 2, and 3. Launch local/mobile preview to test the cozy solo asynchronous experience.
2. **Incremental Delivery (User Story 2 & 3)**: Layer on the synchronous co-op platforming and mobile radial controls.
3. **Final Polish (Phase 6)**: Optimize assets to guarantee smooth 60 FPS on mobile smartphones before deploying to the live Decentraland World.
