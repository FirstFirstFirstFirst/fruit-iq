# DEPA Session 3: Voucher Sync Service

## Prerequisites
Session 1 (Schema) must be completed first.

## Context Files to Read First
- `E:\DurianFarm\durico-web-backend\durico-nest-backend\src\depa\depa.service.ts`
- `E:\DurianFarm\durico-web-backend\durico-nest-backend\prisma\schema.prisma`
- `E:\fruit-iq\DEPA_API_SPEC.md` (section 3.1 GetDPVouchers)
- `E:\fruit-iq\DEPA_BACKEND_PLAN.md`

## Working Directory
`E:\DurianFarm\durico-web-backend\durico-nest-backend`

## Task
Implement voucher sync from DEPA API and auto-linking to users in depa.service.ts.

## Requirements

### 1. Add interfaces at top of depa.service.ts

```typescript
interface DepaVoucherResponse {
  success: boolean;
  errorMessage: string;
  totalRecords: number;
  pageSize: number;
  pageNumber: number;
  data: DepaVoucherData[];
}

interface DepaVoucherData {
  voucherCode: string;
  status: string;
  bindingTime: string;
  revokingTime: string;
  activatedTime: string;
  revokedTime: string;
  registId: string;
  registType: string;
  title: string;
  firstName: string;
  lastName: string;
  idCard: string;
  mobileNo: string;
  email: string;
  addrNo: string;
  moo: string;
  provinceName: string;
  amphurName: string;
  tambonName: string;
  postcode: string;
  dpName: string;
  productName: string;
}

interface SyncResult {
  totalFetched: number;
  created: number;
  updated: number;
  linked: number;
  errors: string[];
}

interface LinkResult {
  totalUnlinked: number;
  linked: number;
  notFound: number;
}
```

### 2. Add phone normalization helper

```typescript
private normalizePhone(phone: string): string {
  if (!phone) return '';
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  if (normalized.startsWith('+66')) {
    normalized = '0' + normalized.slice(3);
  } else if (normalized.startsWith('66') && normalized.length === 11) {
    normalized = '0' + normalized.slice(2);
  }
  return normalized;
}
```

### 3. Add syncVouchersFromDepa method

```typescript
async syncVouchersFromDepa(): Promise<SyncResult> {
  if (!this.apiKey) {
    throw new Error('DEPA_API_KEY not configured');
  }

  const result: SyncResult = { totalFetched: 0, created: 0, updated: 0, linked: 0, errors: [] };
  let pageNumber = 1;
  const pageSize = 500;
  let hasMore = true;

  this.logger.log('Starting DEPA voucher sync...');

  while (hasMore) {
    try {
      const response = await fetch(
        'https://aitransformapi.depa.or.th/api/dp/GetDPVouchers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey,
          },
          body: JSON.stringify({ pageNumber, pageSize }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: DepaVoucherResponse = await response.json();

      if (!data.success) {
        throw new Error(data.errorMessage || 'Unknown error');
      }

      for (const voucher of data.data) {
        try {
          const existing = await this.prisma.depaVoucher.findUnique({
            where: { voucherCode: voucher.voucherCode },
          });

          const parseDate = (dateStr: string): Date | null => {
            if (!dateStr || dateStr.trim() === '') return null;
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
          };

          const voucherData = {
            voucherCode: voucher.voucherCode,
            status: voucher.status,
            registType: voucher.registType || null,
            registId: voucher.registId || null,
            title: voucher.title || null,
            firstName: voucher.firstName,
            lastName: voucher.lastName,
            idCard: voucher.idCard || null,
            mobileNo: voucher.mobileNo,
            email: voucher.email || null,
            addrNo: voucher.addrNo || null,
            moo: voucher.moo || null,
            provinceName: voucher.provinceName || null,
            amphurName: voucher.amphurName || null,
            tambonName: voucher.tambonName || null,
            postcode: voucher.postcode || null,
            dpName: voucher.dpName || null,
            productName: voucher.productName || null,
            bindingTime: parseDate(voucher.bindingTime),
            revokingTime: parseDate(voucher.revokingTime),
            activatedTime: parseDate(voucher.activatedTime),
            revokedTime: parseDate(voucher.revokedTime),
          };

          if (existing) {
            await this.prisma.depaVoucher.update({
              where: { voucherCode: voucher.voucherCode },
              data: voucherData,
            });
            result.updated++;
          } else {
            await this.prisma.depaVoucher.create({ data: voucherData });
            result.created++;
          }
          result.totalFetched++;
        } catch (err) {
          result.errors.push(`${voucher.voucherCode}: ${err.message}`);
        }
      }

      const totalPages = Math.ceil(data.totalRecords / pageSize);
      hasMore = pageNumber < totalPages;
      pageNumber++;

      this.logger.log(`Synced page ${pageNumber - 1}, total so far: ${result.totalFetched}`);

    } catch (err) {
      this.logger.error(`Sync error on page ${pageNumber}: ${err.message}`);
      result.errors.push(`Page ${pageNumber}: ${err.message}`);
      hasMore = false;
    }
  }

  this.logger.log(`Sync complete: ${result.totalFetched} fetched, ${result.created} created, ${result.updated} updated`);

  // Auto-link after sync
  const linkResult = await this.autoLinkVouchers();
  result.linked = linkResult.linked;
  this.logger.log(`Auto-link: ${linkResult.linked} vouchers linked to users`);

  return result;
}
```

### 4. Add autoLinkVouchers method

```typescript
async autoLinkVouchers(): Promise<LinkResult> {
  const result: LinkResult = { totalUnlinked: 0, linked: 0, notFound: 0 };

  const unlinkedVouchers = await this.prisma.depaVoucher.findMany({
    where: {
      userId: null,
      status: 'Activated',
    },
  });

  result.totalUnlinked = unlinkedVouchers.length;

  for (const voucher of unlinkedVouchers) {
    const normalizedPhone = this.normalizePhone(voucher.mobileNo);

    if (!normalizedPhone) {
      result.notFound++;
      continue;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { phone: voucher.mobileNo },
          { phone: normalizedPhone.replace(/^0/, '') },
        ],
      },
    });

    if (user) {
      await this.prisma.depaVoucher.update({
        where: { id: voucher.id },
        data: { userId: user.userId },
      });

      await this.prisma.user.update({
        where: { userId: user.userId },
        data: { depaVoucherCode: voucher.voucherCode },
      });

      result.linked++;
      this.logger.log(`Linked voucher ${voucher.voucherCode} to user ${user.userId}`);
    } else {
      result.notFound++;
    }
  }

  return result;
}
```

### 5. Add daily sync cron job

```typescript
@Cron('0 1 * * *', {
  name: 'depa-voucher-sync',
  timeZone: 'Asia/Bangkok',
})
async scheduledVoucherSync() {
  this.logger.log('Running scheduled DEPA voucher sync...');
  try {
    await this.syncVouchersFromDepa();
  } catch (error) {
    this.logger.error('Scheduled voucher sync failed:', error);
  }
}
```

## Validation
Run after changes:
```bash
npm run lint:fix
npm run lint
npm run typecheck
```

## Output
- Show all new methods added to depa.service.ts
- Confirm lint and typecheck pass
