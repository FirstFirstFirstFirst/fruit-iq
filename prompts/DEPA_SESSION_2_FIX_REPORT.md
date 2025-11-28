# DEPA Session 2: Fix Daily Report

## Context Files to Read First
- `E:\DurianFarm\durico-web-backend\durico-nest-backend\src\depa\depa.service.ts`
- `E:\fruit-iq\DEPA_API_SPEC.md` (section 3.2 VoucherUsage)
- `E:\fruit-iq\DEPA_BACKEND_PLAN.md`

## Working Directory
`E:\DurianFarm\durico-web-backend\durico-nest-backend`

## Task
Fix the existing daily report in depa.service.ts:
1. Add missing `lat` and `lon` fields (set to 0)
2. Add batch processing for >100 records (DEPA API limit)

## Requirements

### 1. Add chunk helper method to DepaService class

```typescript
private chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

### 2. Fix vouchersToSend mapping
Add `lat: 0` and `lon: 0` to the payload:

```typescript
.map((u) => ({
  accessDate: yesterday.toISOString().split('T')[0],
  voucherCode: u.user.depaVoucherCode,
  appUserId: String(u.userId),
  accessCount: u.accessCount,
  accessTime: u.accessTime,
  lat: 0,
  lon: 0,
}));
```

### 3. Replace single API call with batch processing
Replace the existing fetch call with batched processing:

```typescript
const batches = this.chunkArray(vouchersToSend, 100);
let successCount = 0;
let failCount = 0;
const successIds: string[] = [];

for (const batch of batches) {
  try {
    const response = await fetch(
      'https://aitransformapi.depa.or.th/api/dp/VoucherUsage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify({
          isProduction: this.isProduction,
          vouchers: batch,
        }),
      },
    );

    if (response.ok) {
      successCount += batch.length;
      // Collect IDs for marking as sent
      batch.forEach(v => {
        const usage = usages.find(u => u.user.depaVoucherCode === v.voucherCode);
        if (usage) successIds.push(usage.id);
      });
    } else {
      failCount += batch.length;
      const errorText = await response.text();
      this.logger.error(`DEPA batch failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    failCount += batch.length;
    this.logger.error(`DEPA batch error: ${error}`);
  }
}

// Mark successful as sent
if (successIds.length > 0) {
  await this.prisma.depaUsage.updateMany({
    where: { id: { in: successIds } },
    data: { sent: true, sentAt: new Date() },
  });
}

this.logger.log(`DEPA report: ${successCount} sent, ${failCount} failed`);
```

## Validation
Run after changes:
```bash
npm run lint:fix
npm run lint
npm run typecheck
```

## Output
- Show the updated sendDailyReport method
- Confirm lint and typecheck pass
