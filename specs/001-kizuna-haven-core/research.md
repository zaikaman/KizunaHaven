# Research & Architectural Decisions: Kizuna Haven Core Experience

**Feature**: `specs/001-kizuna-haven-core`  
**Date**: 2026-08-20  
**Status**: Completed

---

## 1. Decentraland SDK 7 Mobile UI & Touch Ergonomics

### Decision
Use `@dcl/sdk/react-ecs` for all 2D mobile UI overlays, paired with `@dcl/sdk/platform` detection and `ScreenInsetArea` safe-zone wrappers.

### Rationale
* SDK 7's `react-ecs` provides declarative, JSX-based Flexbox UI layouts that automatically scale across varying mobile aspect ratios (9:16 portrait, 16:9 landscape, ultra-wide tablets).
* Mobile touch gestures require large hitboxes ($\ge 48\times 48\text{ px}$). By declaring radial menus and buttons in `react-ecs`, touch inputs directly trigger ECS component mutations and network broadcasts.
* Avoiding standard keyboard bindings (`IA_ACTION_3`–`6`) prevents desktop-bias, ensuring 100% of interactions are accessible via thumb touches on mobile.

### Alternatives Considered
* *Standard 3D UI Planes (In-world text billboards):* Hard to read at varying camera distances, prone to occlusion, and difficult to interact with on mobile touchscreens.
* *External Webview Overlay:* Introduces iframe overhead, potential security sandboxing issues, and sluggish frame rates on mobile clients.

---

## 2. Multiplayer State Synchronization & Resilience

### Decision
Implement a hybrid synchronization model:
1. **Ephemeral Interactions (High-fives, dance timing, emote broadcasts):** Use Decentraland's native `MessageBus` / `@dcl/sdk/network` peer-to-peer sync with optimistic local prediction for zero-latency feel.
2. **Co-Op Session State (Tandem Bridge Rush):** Use an authoritative host arbitration pattern (the first player to initiate becomes host; state is replicated with sequence numbers to prevent desync).

### Rationale
* The Friendzone Buildathon requires autonomous 24/7 world operation. A hybrid model guarantees the world remains fully functional even without a dedicated external server backend running.
* Optimistic client-side rendering ensures touch feedback is immediate ($<50\text{ms}$), while host validation maintains game integrity.

### Alternatives Considered
* *Dedicated Node.js WebSocket / Colyseus server only:* Introduces external hosting dependency that could fail or incur server costs during the 24/7 judging period.
* *Pure client-isolated state:* Prevents real-time multiplayer co-op interactions.

---

## 3. Asynchronous Social Layer & Daily Prompt Rotation

### Decision
Implement a deterministic 24-hour cycle generator combined with local/storage state syncing for the *Daily Question Hearth* and *Bottle Mail Lagoon*.

### Rationale
* Deterministic date hashing (`epochDay = Math.floor(Date.now() / 86400000)`) guarantees that all players worldwide see the exact same Daily Prompt on any given calendar day without requiring a central server clock.
* Floating bottle messages are persisted in world memory and client cache, with an automatic archive pipeline that caps active lagoon entities to 20 to preserve mobile draw-call budgets.

### Alternatives Considered
* *Hardcoded single question:* Lacks daily retention value; players have no reason to return the next day.
* *Complex SQL database backend:* Overkill for hackathon scope; introduces point-of-failure risks.

---

## 4. Autonomous Companion AI ("Lumi") for Solo Visitors

### Decision
Build a lightweight, deterministic finite state machine (FSM) for Lumi (`LumiCompanionSystem`) that evaluates player proximity, active co-op zone status, and solo presence.

### Rationale
* When a player is alone, Lumi transitions to `FOLLOW_GUIDE` mode, leading the visitor to interactive points of interest (Campfire, Bottle Lagoon, Wishing Tree).
* If the player stands on a 2-player co-op trigger plate while alone, Lumi automatically steps onto the partner plate (`COOP_ASSIST` mode), allowing solo players to test and experience the full puzzle run.
* FSM execution consumes $<0.2\text{ms}$ of CPU per frame, maintaining the 60 FPS performance budget.

### Alternatives Considered
* *LLM-driven cloud AI agent:* High latency ($>1.5\text{s}$ response), API rate-limiting risks, and recurring API token costs.
* *Static NPC with fixed dialogue:* Boring and non-interactive; cannot assist with multiplayer puzzle mechanics.

---

## 5. Asset Optimization & Mobile Performance Pipeline

### Decision
Source low-poly stylized models exclusively from the **OpenDCL Catalog** and **Genesis Plaza Asset Library**, process all models through the Decentraland Scene Optimizer, and use texture atlases.

### Rationale
* Mobile memory limits require strict budgets: $\le 10,000$ triangles per render view, $\le 50\text{MB}$ total uncompressed assets, and max 1 shared texture atlas for custom props.
* OpenDCL assets are pre-validated for Decentraland SDK 7 performance and collision standards.

### Alternatives Considered
* *High-poly custom sculpts:* Causes thermal throttling, memory crashes, and poor frame rates on mid-range Android/iOS devices.
