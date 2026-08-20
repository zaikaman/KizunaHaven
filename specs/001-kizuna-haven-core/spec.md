# Feature Specification: Kizuna Haven Core Experience

**Feature Directory**: `specs/001-kizuna-haven-core`  
**Created**: 2026-08-20  
**Status**: Draft  
**Input**: User description: "IDEA.md — Kizuna Haven: The 24/7 Mobile-First Social Playground & Asynchronous Gathering World for Decentraland Mobile"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Solo Visitor Warmth & Asynchronous Social Engagement (Priority: P1)

As a solo mobile visitor entering the virtual world on my phone during my commute or late at night, I want to immediately feel welcomed and connected to a living community through asynchronous interactions, daily icebreakers, and autonomous companionship so that the world never feels like an empty, abandoned ghost town.

**Why this priority**: Solves the fundamental problem of virtual worlds being dead when low concurrency occurs. It delivers immediate standalone value for single players without requiring anyone else to be online simultaneously.

**Independent Test**: A user logs in as the sole visitor, reads and answers the Daily Prompt, casts a bottle into the lagoon, fishes out a note left by a previous traveler, and explores guided by the spirit companion.

**Acceptance Scenarios**:
1. **Given** a solo player spawns near the central campfire, **When** they approach the central flame monument, **Then** the current 24-hour Daily Prompt is displayed with live community answer distribution, and the player can submit their response in under 30 seconds.
2. **Given** a player is near the lagoon shoreline, **When** they interact with a floating bottle, **Then** the note left by another player opens with options to read, react with an emoji stamp, or cast a new bottle message.
3. **Given** a player is exploring the world alone, **When** they approach puzzle gates or points of interest, **Then** the autonomous spirit guide (Lumi) greets them, offers contextual hints, and can trigger cooperative switches to enable solo puzzle trial runs.

---

### User Story 2 — Real-Time Synchronous Co-Op Micro-Games (Priority: P2)

As two or more friends (or friendly strangers) exploring together, we want to play fast-paced, intuitive collaborative micro-games that require coordination and teamwork so that we experience shared joy, laugh together, and build memorable bonds.

**Why this priority**: Delivers high-energy multiplayer fun and directly addresses the social core of the Friendzone hackathon criteria.

**Independent Test**: Two players step onto the co-op puzzle activation pads, start a session of *Tandem Bridge Rush*, coordinate role switches across checkpoints, and earn combined sync rewards.

**Acceptance Scenarios**:
1. **Given** two players stand on the *Tandem Bridge Rush* staging area, **When** both confirm ready, **Then** an asymmetric puzzle run starts where Player 1 (Operator) activates colored holographic bridges while Player 2 (Runner) traverses platforms to collect star shards before timers lapse.
2. **Given** players reach a midpoint checkpoint in a co-op challenge, **When** they step on the synchronization pad, **Then** their roles dynamically swap and their combined combo multiplier increases.
3. **Given** two or more players stand on the *Emote Synchro-Dance Floor*, **When** rhythm beats trigger on the floor, **Then** matching prompt inputs trigger synchronized fireworks, escalating party lighting, and collaborative reward points.

---

### User Story 3 — Mobile Touch Ergonomics & Viral Social Sharing (Priority: P3)

As a mobile touchscreen user, I want quick, ergonomic one-tap social interactions and an in-world Polaroid camera with deep-link invites so that I can easily express emotions with my thumb and invite my friends from external apps to join me in real-time.

**Why this priority**: Optimizes the interface specifically for mobile touch devices and drives organic social viral loops.

**Independent Test**: A player taps the bottom-right radial menu with one thumb to trigger a high-five gesture, opens the Polaroid camera, snaps a photo with custom frames, and copies an instant join link.

**Acceptance Scenarios**:
1. **Given** a player is moving or standing, **When** they tap or swipe the bottom-right screen area, **Then** a radial touch wheel opens within natural thumb reach showing quick social actions (High-Five, Hug, Emotes, Sparkler).
2. **Given** a player is near another user, **When** they select a collaborative social action (like High-Five), **Then** an interactive prompt appears for the nearby player to accept and trigger a synchronized animation.
3. **Given** a player wants to invite a friend, **When** they open the Polaroid Photo-Booth and tap snapshot, **Then** a framed digital photo is generated with usernames and a one-click button to copy a deep-link URL that warps friends straight to the player's exact coordinates.

---

### Edge Cases

- **Interrupted Network Connection:** If a player experiences brief network packet loss during a co-op challenge, the system maintains local player control and smoothly reconciles entity states upon reconnection without resetting puzzle progress.
- **Solo Player Abandoned in Co-Op Run:** If a co-op partner disconnects midway through a puzzle, the system automatically offers the remaining player the option to summon the spirit guide to finish or cleanly exit with collected rewards.
- **Lagoon Message Bottle Cap:** When the maximum display limit for floating message bottles in the lagoon is reached, the system prioritizes recent and highly-rated notes while gracefully archiving older entries into the lagoon archive ledger.
- **Screen Cutouts & Device Notches:** On mobile devices with irregular screen aspect ratios, camera punch holes, or bottom gesture bars, all interactive UI elements dynamically inset to remain strictly within safe touch areas.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a persistent, autonomous 24/7 central campfire hub that operates without requiring a live human moderator or event host.
- **FR-002**: System MUST display a rotating 24-hour Daily Prompt at the central hearth, record user responses, and visualize community participation distributions.
- **FR-003**: System MUST provide an asynchronous Bottle Mail mechanism allowing players to write, launch, discover, read, and react to community messages floating in the lagoon.
- **FR-004**: System MUST include an autonomous companion entity (Lumi) that provides contextual guidance to solo visitors and can act as an auxiliary co-op partner for puzzle testing.
- **FR-005**: System MUST provide a 2-player asymmetric cooperative puzzle (*Tandem Bridge Rush*) featuring operator bridge activation, timed runner navigation, and role-swap checkpoints.
- **FR-006**: System MUST provide an interactive rhythm dance floor that detects synchronized player timing and rewards teams with combo multipliers and celebratory visual effects.
- **FR-007**: System MUST provide a mobile-optimized radial action wheel positioned in the primary thumb arc for one-tap social emotes and greetings.
- **FR-008**: System MUST provide an in-game Polaroid snapshot tool that creates shareable stamped photo cards and generates 1-click coordinate deep-link join URLs.
- **FR-009**: System MUST track player social progression (Kizuna Level) through daily check-ins, prompt responses, and co-op completions, unlocking portable social toys.
- **FR-010**: All interactive touch targets MUST have a minimum physical tap area of at least $48 \times 48\text{ px}$ and comply with device safe-area insets.

---

### Key Entities

- **KizunaProfile**: Represents a visitor's session and social state (visitor identifier, Kizuna Level, earned social stamps, unlocked portable props).
- **DailyPrompt**: Represents the active 24-hour icebreaker question, expiration timestamp, active responses, and category tag.
- **BottleMessage**: Represents a player-generated floating note (author signature, timestamp, message content, positive reaction count, ribbon color).
- **CoOpSession**: Represents an active cooperative challenge instance (participating players, current phase, role assignments, elapsed timer, star shards collected, combo multiplier).
- **DanceFloorPerformance**: Represents an active rhythm dance session (participating dancers, rhythm accuracy stream, party energy bar level, active visual intensity tier).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Solo visitors can discover the Daily Prompt and submit an answer within 45 seconds of entering the world.
- **SC-002**: Two players can initiate and complete a full round of the *Tandem Bridge Rush* co-op challenge in under 3 minutes with zero tutorial confusion.
- **SC-003**: 100% of interactive UI buttons and social menus are fully reachable and operational on mobile touchscreens without requiring any desktop keyboard shortcuts.
- **SC-004**: The scene maintains a consistent target execution rate of 60 FPS on standard mobile client hardware with smooth visual transitions.
- **SC-005**: Players can generate and copy a friend invite deep-link URL via the Polaroid tool in under 3 taps from the main viewport.
- **SC-006**: The world remains 100% functional and interactive 24 hours a day, 7 days a week, with zero dependence on live staffing or scheduled events.

---

## Assumptions

- **Target Hardware**: Users run the experience primarily via the Decentraland Mobile App on iOS and Android devices, with backward compatibility for desktop browsers.
- **Connectivity**: Mobile users have active internet connectivity; transient packet delays are handled with graceful client-side interpolation.
- **Content Moderation**: User-submitted bottle notes and daily prompt answers adhere to standard platform safety guidelines, with basic automated profanity filtering applied.
- **Open Standards**: Scene assets and entity structures follow open-source, low-poly standards compatible with standard mobile memory budgets ($\le 50\text{MB}$ total assets).
