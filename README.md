# "Use It First" (UIF) — Core Mobile Ecosystem & Microservices

> **"Save Food. Save Money. Waste Less."**

Production-grade implementation of the Use It First (UIF) mobile client and backend processing microservices.

---

## Workspace Architecture

```
/Users/danger_beast/Downloads/Use It First/
├── UIF_SYSTEM_ARCHITECTURE.md        # Definitive Enterprise System Specification
├── mobile/                           # React Native Mobile Client Layer
│   ├── src/
│   │   ├── types/                    # Zod validation schemas & domain TypeScript types
│   │   │   └── pantry.ts
│   │   ├── theme/                    # Emerald & Forest tokens, Typography, Radii, Elevation
│   │   │   └── tokens.ts
│   │   ├── components/
│   │   │   ├── BrandGauge.tsx        # High-performance SVG 180° speedo gauge (Red/Amber/Green)
│   │   │   ├── RecipeBanner.tsx      # Dynamic expiring ingredients callout banner
│   │   │   ├── FilterBar.tsx         # Dual-tier location tabs + state filter chips
│   │   │   ├── PantryItemCard.tsx    # Gesture swipeable card (Consume/Waste/Open) + accessible triggers
│   │   │   ├── FabActionModal.tsx    # Floating Action Button (+) with animated radial expansion
│   │   │   └── ErrorBoundary.tsx     # Crash isolation & error recovery boundary
│   │   ├── screens/
│   │   │   ├── SmartPantryScreen.tsx # Virtualized dashboard with live search & state
│   │   │   ├── CameraScanScreen.tsx  # Viewfinder with bill framing & corner reticles
│   │   │   └── ReceiptVerificationModal.tsx # Editable parsed items & shelf-life stepper
│   │   └── state/
│   │       └── pantryStore.ts        # Zustand reactive offline-first store
├── backend/                          # Node.js + TypeScript Microservices
│   ├── src/
│   │   ├── types/                    # DTOs, Zod request/response contracts
│   │   ├── services/
│   │   │   ├── ShelfLifeEstimator.ts # Food taxonomy database & opened decay calculator
│   │   │   ├── ReceiptProcessingService.ts # Pre-processing, OCR pipeline & non-food filter
│   │   │   ├── RecipeGenerationService.ts  # Zero-Waste Chef LLM engine with fallback
│   │   │   └── NotificationDaemon.ts       # Anti-fatigue timezone-aware batching daemon
│   │   ├── test-runner.ts            # Verification test suite (4/4 passing)
│   │   └── index.ts                  # Microservice controller & handlers
└── package.json
```

---

## Running Verification Tests

```bash
cd backend
npm test # or: ./node_modules/.bin/tsc -p tsconfig.json && node dist/test-runner.js
```

### Verified Test Results
- **Test 1: ShelfLifeEstimator** — Accurately determines shelf life for Produce, Dairy (decay acceleration on open status: 180d $\to$ 3d), and Pantry grains.
- **Test 2: ReceiptProcessingService** — Filters out store banners, taxes, GST, and non-food items (soap, bags) while parsing genuine food items.
- **Test 3: RecipeGenerationService** — Synthesizes structured zero-waste recipes (Palak Paneer, Sauté) with $94\%$ rescue score.
- **Test 4: NotificationDaemon** — Aggregates expiring items per user into a single actionable push alert.
