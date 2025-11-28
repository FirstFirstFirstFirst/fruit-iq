# DEPA Backend Implementation Plan

**Date:** 2025-11-28
**Scope:** Backend only (NestJS)
**Backend Path:** `E:\DurianFarm\durico-web-backend\durico-nest-backend`

---

## Overview

Implement full DEPA voucher sync and reporting system per API specification.

---

## Phase 1: Database Schema

### 1.1 Add DepaVoucher Model

```prisma
model DepaVoucher {
  id              String    @id @default(cuid())
  voucherCode     String    @unique @db.VarChar(50)
  status          String    @db.VarChar(20)  // "Activated", "Revoked", "Bound"
  registType      String?   @db.VarChar(20)  // "SME", "Farmer"
  registId        String?   @db.VarChar(50)

  // User details from DEPA
  title           String?   @db.VarChar(20)
  firstName       String    @db.VarChar(100)
  lastName        String    @db.VarChar(100)
  idCard          String?   @db.VarChar(20)
  mobileNo        String    @db.VarChar(20)
  email           String?   @db.VarChar(255)

  // Address
  addrNo          String?   @db.VarChar(50)
  moo             String?   @db.VarChar(20)
  provinceName    String?   @db.VarChar(100)
  amphurName      String?   @db.VarChar(100)
  tambonName      String?   @db.VarChar(100)
  postcode        String?   @db.VarChar(10)

  // DEPA metadata
  dpName          String?   @db.VarChar(255)
  productName     String?   @db.VarChar(255)
  bindingTime     DateTime?
  revokingTime    DateTime?
  activatedTime   DateTime?
  revokedTime     DateTime?

  // Link to our user (after auto-matching)
  userId          Int?
  user            User?     @relation("UserDepaVoucher", fields: [userId], references: [userId])

  // Sync metadata
  syncedAt        DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([mobileNo])
  @@index([userId])
  @@index([status])
}
```

### 1.2 Update User Model

Add relation (no new columns needed, just relation):
```prisma
// In User model, add:
depaVoucher      DepaVoucher?  @relation("UserDepaVoucher")
```

### 1.3 Migration

```bash
npx prisma migrate dev --name add_depa_voucher_table
```

---

## Phase 2: DEPA Voucher Sync Service

### 2.1 New Methods in depa.service.ts

```typescript
// Fetch all vouchers from DEPA API with pagination
async syncVouchersFromDepa(): Promise<SyncResult>

// Auto-link vouchers to users by matching mobileNo → User.phone
async autoLinkVouchers(): Promise<LinkResult>

// Get sync status for admin
async getSyncStatus(): Promise<SyncStatus>

// Manual link voucher to user (admin)
async manualLinkVoucher(voucherCode: string, userId: number): Promise<void>
```

### 2.2 Sync Logic

```
1. Call GetDPVouchers (page 1, pageSize 500)
2. Check totalRecords, calculate total pages
3. Loop through all pages
4. Upsert each voucher into DepaVoucher table
5. After sync, run autoLinkVouchers()
6. Log results
```

### 2.3 Auto-Link Logic

```
1. Get all DepaVouchers where userId IS NULL and status = 'Activated'
2. For each voucher:
   a. Normalize mobileNo (remove +66, leading 0, spaces)
   b. Find User where phone matches (normalized)
   c. If found, update DepaVoucher.userId = User.userId
   d. Also update User.depaVoucherCode = voucher.voucherCode
3. Return count of linked vouchers
```

### 2.4 Cron Jobs

```typescript
// Sync vouchers daily at 01:00 Bangkok time
@Cron('0 1 * * *', { timeZone: 'Asia/Bangkok' })
async scheduledVoucherSync()

// Existing: Send usage report at 00:30 Bangkok time
@Cron('30 0 * * *', { timeZone: 'Asia/Bangkok' })
async sendDailyReport()
```

---

## Phase 3: Update Daily Report

### 3.1 Fix VoucherUsage Payload

Current payload is missing `lat` and `lon`. Update to:

```typescript
const vouchersToSend = usages
  .filter((u) => u.user.depaVoucherCode)
  .map((u) => ({
    accessDate: yesterday.toISOString().split('T')[0],
    voucherCode: u.user.depaVoucherCode,
    appUserId: String(u.userId),
    accessCount: u.accessCount,
    accessTime: u.accessTime,
    lat: 0,  // ADD THIS
    lon: 0,  // ADD THIS
  }));
```

### 3.2 Batch Processing

DEPA API limits to 100 records per call. Add batching:

```typescript
// Split into batches of 100
const batches = chunk(vouchersToSend, 100);
for (const batch of batches) {
  await sendBatchToDepa(batch);
}
```

---

## Phase 4: Admin Endpoints

### 4.1 New Controller Endpoints

```typescript
// Get all synced vouchers with link status
GET /depa/admin/vouchers

// Get sync status
GET /depa/admin/sync-status

// Trigger manual sync
POST /depa/admin/sync

// Manual link voucher to user
POST /depa/admin/link-voucher
Body: { voucherCode: string, userId: number }

// Unlink voucher from user
POST /depa/admin/unlink-voucher
Body: { voucherCode: string }

// Verify usage was received by DEPA
POST /depa/admin/verify-usage
Body: { voucherCode: string, fromDate: string, toDate: string }
```

---

## Phase 5: Environment Variables

Ensure these are set:

```env
DEPA_API_KEY=your-api-key-here
DEPA_IS_PRODUCTION=false
DEPA_BASE_URL=https://aitransformapi.depa.or.th
```

---

## Implementation Order

| Step | Task | Depends On |
|------|------|------------|
| 1 | Add DepaVoucher model to schema.prisma | - |
| 2 | Add relation to User model | Step 1 |
| 3 | Run prisma migrate | Steps 1-2 |
| 4 | Create syncVouchersFromDepa() | Step 3 |
| 5 | Create autoLinkVouchers() | Step 4 |
| 6 | Add sync cron job | Step 5 |
| 7 | Fix daily report (add lat/lon, batching) | - |
| 8 | Add admin endpoints | Steps 4-5 |
| 9 | Test full flow | All |

---

## Testing Checklist

- [ ] DepaVoucher table created
- [ ] Sync fetches all vouchers from DEPA
- [ ] Vouchers stored correctly with all fields
- [ ] Auto-link matches by phone number
- [ ] User.depaVoucherCode updated on link
- [ ] Daily report includes lat/lon
- [ ] Batching works for >100 records
- [ ] Admin endpoints work
- [ ] GetVoucherUsage verification works

---

## File Changes Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add DepaVoucher model, update User relation |
| `src/depa/depa.service.ts` | Add sync, link, batch methods |
| `src/depa/depa.controller.ts` | Add admin endpoints |
| `src/depa/dto/*.ts` | Add DTOs for new endpoints |

---

## Notes

- Phone number matching must handle formats: `0812345678`, `+66812345678`, `66812345678`
- DEPA API uses POST for all endpoints (even "GET" operations)
- Max 500 records per GetDPVouchers call
- Max 100 records per VoucherUsage call
- All dates in YYYY-MM-DD format
