# DEPA AI-Transformation Integration Plan

## Overview

Integrate daily usage reporting to DEPA API for both WeighPay (mobile) and Durico Web.

**What we track:**
- `accessCount`: Number of times user opens the app
- `accessTime`: Total time spent (minutes)
- `voucherCode`: User's DEPA voucher code
- `accessDate`: Date of usage

**DEPA API:** `https://aitransformapi.depa.or.th/api/dp/VoucherUsage`

---

## Phase 1: Gather Context ✅ COMPLETED

### Backend (NestJS) - Context Gathered
| File | Key Findings |
|------|--------------|
| `prisma/schema.prisma` | User model at line 22, WeighPay models at line 464+, can add `depaVoucherCode` to User |
| `src/app.module.ts` | Uses `ScheduleModule.forRoot()`, module pattern clear, add DepaModule to imports |
| `src/sensor/sensor-aggregation.service.ts` | Cron pattern: `@Cron('0,15,30,45 * * * *')`, uses `isProcessing` flag |
| `src/auth/guards/auth.guard.ts` | JWT auth, `request['user'] = payload` sets user with `id` field |

### WeighPay Mobile (React Native/Expo) - Context Gathered
| File | Key Findings |
|------|--------------|
| `app/_layout.tsx` | AuthProvider wraps app, add tracking component inside AuthProvider |
| `src/contexts/AuthContext.tsx` | `isAuthenticated`, `user?.userId` available, `useAuth()` hook |
| `src/lib/api.ts` | `apiClient.post()` pattern, auto token injection, API_BASE_URL = dapi.werapun.com |
| `app/(tabs)/profile.tsx` | Can add voucher input in settings section |

### Durico Web (Next.js) - Context Gathered
| File | Key Findings |
|------|--------------|
| `app/layout.tsx` | AuthProvider wraps app, uses NextAuth session |
| `components/AuthProvider.tsx` | Uses `useAuthStore`, `session.accessToken`, `session.userId` |
| `utils/getTokenFromLocal.ts` | Token in `localStorage.getItem('access_token')` |
| `utils/apiConfig.ts` | `apiUrl` from `NEXT_PUBLIC_API_URL` env var |

---

## Phase 2: Backend Implementation

### 2.1 Update Prisma Schema
Add to `schema.prisma`:
```prisma
// Add field to User model
depaVoucherCode  String?

// Add new table
model DepaUsage {
  id           String   @id @default(cuid())
  userId       Int
  user         User     @relation(fields: [userId], references: [userId])
  date         DateTime @db.Date
  accessCount  Int      @default(0)
  accessTime   Int      @default(0)
  sent         Boolean  @default(false)

  @@unique([userId, date])
  @@index([date, sent])
}
```

### 2.2 Create DEPA Module
Create files:
- `src/depa/depa.module.ts`
- `src/depa/depa.service.ts`
- `src/depa/depa.controller.ts`

### 2.3 Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/depa/open` | Record app open (increment count) |
| POST | `/depa/close` | Record app close (add minutes) |
| GET | `/depa/usage` | Get user's usage stats (optional) |

### 2.4 Cron Job
- Run daily at 00:30 Bangkok time
- Aggregate yesterday's data
- Send to DEPA API
- Mark as sent

---

## Phase 3: WeighPay Mobile Implementation

### 3.1 Create Tracking Hook
Create `src/hooks/useDepaTracking.ts`:
- Listen to `AppState` changes
- Call `/depa/open` when app becomes active
- Call `/depa/close` with duration when app goes to background

### 3.2 Add to Root Layout
Modify `app/_layout.tsx`:
- Add tracking component inside AuthProvider

### 3.3 Voucher Input (Optional for MVP)
Add to profile screen or settings:
- Text input for voucher code
- Save to user profile

---

## Phase 4: Durico Web Implementation

### 4.1 Create Tracking Hook/Component
Create tracking component:
- Listen to `visibilitychange` event
- Call `/depa/open` when tab becomes visible
- Call `/depa/close` with duration when tab becomes hidden

### 4.2 Add to Root Layout
Modify `app/layout.tsx`:
- Add tracking component

### 4.3 Voucher Input
Add to profile/settings page:
- Text input for voucher code
- Save to user profile

---

## Phase 5: Environment Variables

Add to backend `.env`:
```
DEPA_API_KEY=c4fd25ee-bbd1-41e1-8cc3-d53c10164d94
DEPA_IS_PRODUCTION=false
```

---

## Phase 6: Testing

### Manual Testing Checklist
- [ ] Open WeighPay app → check `/depa/open` called
- [ ] Close WeighPay app → check `/depa/close` called with minutes
- [ ] Open Durico web → check `/depa/open` called
- [ ] Switch tab/close → check `/depa/close` called
- [ ] Check database `DepaUsage` table has records
- [ ] Manually trigger cron → check DEPA API receives data

---

## Phase 7: Git Push

After all implementations:
```bash
git add .
git commit -m "feat(depa): add DEPA usage tracking integration

- Add DepaUsage table for daily usage tracking
- Add /depa/open and /depa/close endpoints
- Add daily cron job to report usage to DEPA API
- Add useDepaTracking hook for WeighPay mobile
- Add DepaTracker component for Durico web

Manual testing:
- WeighPay: Open/close app, check usage recorded
- Durico: Open/close tab, check usage recorded
- Backend: Check DepaUsage table, test cron job"

git push origin main
```

---

## File Changes Summary

| Location | Files to Create/Modify |
|----------|----------------------|
| Backend | `prisma/schema.prisma`, `src/depa/*`, `src/app.module.ts` |
| WeighPay | `src/hooks/useDepaTracking.ts`, `app/_layout.tsx` |
| Durico Web | `src/components/DepaTracker.tsx`, `app/layout.tsx` |

---

## Implementation Order

1. ✅ Read context files (understand existing patterns)
2. ✅ Backend: Schema + Migration (added DepaUsage model, depaVoucherCode to User)
3. ✅ Backend: DEPA module (service, controller) - src/depa/*
4. ✅ Backend: Register module in app.module.ts
5. ✅ WeighPay: Create useDepaTracking hook - src/hooks/useDepaTracking.ts
6. ✅ WeighPay: Add to _layout.tsx
7. ✅ Durico Web: Create DepaTracker component - components/DepaTracker.tsx
8. ✅ Durico Web: Add to layout.tsx
9. ⬜ Test all endpoints
10. ⬜ Git push all repos
