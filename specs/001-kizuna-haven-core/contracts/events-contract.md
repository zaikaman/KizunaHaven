# Event Contracts: Kizuna Haven Multi-Client Sync Protocol

**Feature**: `specs/001-kizuna-haven-core`  
**Date**: 2026-08-20  
**Status**: Completed

---

## 1. Overview
All real-time peer-to-peer and multi-client events are transmitted via Decentraland's `MessageBus` channel using strongly typed JSON payloads.

```typescript
export interface BaseEvent<T extends string, P> {
  type: T;
  senderId: string;
  timestamp: number;
  payload: P;
}
```

---

## 2. Event Payloads

### 2.1 Social & Gesture Events

#### `SOCIAL_GESTURE_REQUEST`
Sent when a player triggers a collaborative social gesture from the Radial Menu.
```json
{
  "type": "SOCIAL_GESTURE_REQUEST",
  "senderId": "0x123...abc",
  "timestamp": 1787234000000,
  "payload": {
    "targetUserId": "0x456...def",
    "gestureType": "HIGH_FIVE", // "HIGH_FIVE" | "HUG" | "SPARKLER_DUET"
    "originPosition": { "x": 16.5, "y": 1.0, "z": 24.0 }
  }
}
```

#### `SOCIAL_GESTURE_ACCEPT`
Sent when the target player accepts the collaborative gesture.
```json
{
  "type": "SOCIAL_GESTURE_ACCEPT",
  "senderId": "0x456...def",
  "timestamp": 1787234002000,
  "payload": {
    "initiatorUserId": "0x123...abc",
    "gestureType": "HIGH_FIVE",
    "syncAnimationId": "anim_high_five_duo"
  }
}
```

---

### 2.2 Co-Op Challenge Events (*Tandem Bridge Rush*)

#### `COOP_SESSION_START`
Sent by the session initiator when both players are positioned on staging pads.
```json
{
  "type": "COOP_SESSION_START",
  "senderId": "0x123...abc",
  "timestamp": 1787234010000,
  "payload": {
    "sessionId": "session_8923",
    "operatorId": "0x123...abc",
    "runnerId": "0x456...def",
    "initialSeed": 42
  }
}
```

#### `COOP_BRIDGE_TRIGGER`
Sent when the Operator taps a glyph to activate/deactivate a holographic light bridge.
```json
{
  "type": "COOP_BRIDGE_TRIGGER",
  "senderId": "0x123...abc",
  "timestamp": 1787234015000,
  "payload": {
    "sessionId": "session_8923",
    "bridgeIndex": 2,
    "color": "ORANGE",
    "durationMs": 4000
  }
}
```

#### `COOP_SHARD_COLLECTED`
Sent when the Runner touches a Star Shard.
```json
{
  "type": "COOP_SHARD_COLLECTED",
  "senderId": "0x456...def",
  "timestamp": 1787234018000,
  "payload": {
    "sessionId": "session_8923",
    "shardIndex": 5,
    "totalCollected": 6,
    "currentMultiplier": 2.0
  }
}
```

---

### 2.3 Asynchronous Social Events

#### `BOTTLE_LAUNCH`
Broadcast when a player casts a new message bottle into the lagoon.
```json
{
  "type": "BOTTLE_LAUNCH",
  "senderId": "0x123...abc",
  "timestamp": 1787234050000,
  "payload": {
    "bottleId": "btl_99182",
    "authorName": "Kiko",
    "content": "Sending warmth to whoever finds this ✨ You got this!",
    "ribbonColor": "gold",
    "spawnPosition": { "x": 8.0, "y": 0.5, "z": 12.0 }
  }
}
```

#### `BOTTLE_REACT`
Broadcast when a player adds an emoji reaction to a discovered bottle.
```json
{
  "type": "BOTTLE_REACT",
  "senderId": "0x456...def",
  "timestamp": 1787234060000,
  "payload": {
    "bottleId": "btl_99182",
    "reactionType": "HEART" // "HEART" | "STAR" | "HANDSHAKE"
  }
}
```
