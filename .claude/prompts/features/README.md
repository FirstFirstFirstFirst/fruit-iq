# WeighPay Feature Prompts

> **Location**: `.claude/prompts/features/`
> **Purpose**: Standalone prompts for parallel Claude Code sessions

---

## Feature Files

### HIGH Priority
| File | Feature | Complexity | Time |
|------|---------|------------|------|
| [F5-privacy-policy.md](./F5-privacy-policy.md) | Privacy Policy Screen | LOW | 30 min |
| [F1-manual-weight.md](./F1-manual-weight.md) | Manual Weight Entry | MEDIUM | 1-2 hrs |
| [F2-cart-system.md](./F2-cart-system.md) | Multi-Item Cart | HIGH | 3-4 hrs |

### MEDIUM Priority
| File | Feature | Complexity | Time |
|------|---------|------------|------|
| [F3-bulk-pricing.md](./F3-bulk-pricing.md) | Bulk/Custom Pricing | MEDIUM | 1-2 hrs |
| [F4-custom-emoji.md](./F4-custom-emoji.md) | Custom Image Upload | MEDIUM | 2-3 hrs |
| [F6-offline-handling.md](./F6-offline-handling.md) | Offline Mode | MEDIUM | 2 hrs |

### LOW Priority
| File | Feature | Complexity | Time |
|------|---------|------------|------|
| [F7-qr-styling.md](./F7-qr-styling.md) | QR Code Styling | LOW | 30 min |

---

## How to Use

### For a Single Agent
1. Open one prompt file
2. Copy entire content
3. Paste into new Claude Code session
4. Agent will execute the implementation

### For Parallel Sessions
1. Start multiple Claude Code sessions
2. Give each session a different prompt file
3. Non-conflicting features can run simultaneously

### Recommended Parallel Batches
```
Batch 1 (No conflicts):
  - F5-privacy-policy.md
  - F7-qr-styling.md

Batch 2 (No conflicts):
  - F1-manual-weight.md
  - F3-bulk-pricing.md

Batch 3 (No conflicts):
  - F4-custom-emoji.md
  - F6-offline-handling.md

Batch 4 (Run alone - modifies many files):
  - F2-cart-system.md
```

---

## Before Starting Any Feature

1. Read main docs:
   - `DEVELOPMENT_PLAN.md` - Full architecture and specs
   - `PROGRESS.md` - Current status and coordination
   - `CLAUDE.md` - Coding standards

2. Update PROGRESS.md to claim your feature

3. After completion, update PROGRESS.md status

---

## File Conflict Map

These files are shared between features - coordinate changes:

| Shared File | Features |
|-------------|----------|
| `src/components/camera/constants.ts` | F1, F2, F4 |
| `app/(tabs)/camera.tsx` | F1, F2 |
| `src/components/QRPaymentScreen.tsx` | F2, F7 |
| `src/lib/api.ts` | F2, F4, F6 |
