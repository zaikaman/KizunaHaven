# Quickstart: Kizuna Haven Developer Guide

**Feature**: `specs/001-kizuna-haven-core`  
**Date**: 2026-08-20  
**Status**: Completed

---

## 🛠️ Prerequisites

* **Node.js**: v18.x or v20.x
* **NPM**: v9.x or v10.x
* **Decentraland CLI / SDK 7**: Installed locally or run via `npx @dcl/sdk`
* **Mobile App (Optional for mobile preview)**: Decentraland Mobile App on iOS (TestFlight/App Store) or Android (Play Store/APK).

---

## 🚀 Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Preview (Desktop & Mobile QR)
```bash
npm start
```
* **Desktop Browser**: Opens at `http://localhost:8000`.
* **Mobile Preview**: Terminal output will generate a QR Code. Open the Decentraland Mobile App, scan the QR code, and the scene will load instantly on your phone!

### 3. Run Automated Tests
```bash
npm test
```
Runs Vitest unit tests verifying ECS systems, co-op state machines, daily prompt deterministic rotation, and contract schemas.

---

## 📦 Scene Asset Optimization Checks

Before deploying to your Decentraland World:
```bash
# Verify triangle count and asset budgets
npm run build
```
* Scene geometry must stay $\le 10,000$ triangles per render zone.
* Total uncompressed asset footprint must stay under 50MB.

---

## 🌐 Deploying to a Decentraland World

```bash
npx @dcl/sdk/bin/dcl deploy --target-content https://worlds-content-server.decentraland.org
```
Your world will be live 24/7 for hackathon judging and mobile discovery.
