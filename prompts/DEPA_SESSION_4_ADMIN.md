# DEPA Session 4: Admin Endpoints

## Prerequisites
Session 3 (Sync Service) must be completed first.

## Context Files to Read First
- `E:\DurianFarm\durico-web-backend\durico-nest-backend\src\depa\depa.service.ts`
- `E:\DurianFarm\durico-web-backend\durico-nest-backend\src\depa\depa.controller.ts`
- `E:\fruit-iq\DEPA_API_SPEC.md` (section 3.3 GetVoucherUsage)
- `E:\fruit-iq\DEPA_BACKEND_PLAN.md`

## Working Directory
`E:\DurianFarm\durico-web-backend\durico-nest-backend`

## Task
Add admin endpoints for DEPA voucher management.

## Requirements

### 1. Create DTOs file

Create `src/depa/dto/depa.dto.ts`:

```typescript
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class LinkVoucherDto {
  @IsString()
  voucherCode: string;

  @IsNumber()
  userId: number;
}

export class UnlinkVoucherDto {
  @IsString()
  voucherCode: string;
}

export class VerifyUsageDto {
  @IsString()
  voucherCode: string;

  @IsString()
  fromDate: string;

  @IsString()
  toDate: string;
}

export class VoucherQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  linked?: 'true' | 'false';
}
```

### 2. Add service methods to depa.service.ts

```typescript
async getVouchers(status?: string, linkedOnly?: boolean) {
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (linkedOnly === true) {
    where.userId = { not: null };
  } else if (linkedOnly === false) {
    where.userId = null;
  }

  const vouchers = await this.prisma.depaVoucher.findMany({
    where,
    include: {
      user: {
        select: {
          userId: true,
          email: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { syncedAt: 'desc' },
  });

  return { ok: true, data: vouchers, count: vouchers.length };
}

async getSyncStatus() {
  const total = await this.prisma.depaVoucher.count();
  const activated = await this.prisma.depaVoucher.count({ where: { status: 'Activated' } });
  const linked = await this.prisma.depaVoucher.count({ where: { userId: { not: null } } });
  const unlinked = await this.prisma.depaVoucher.count({ where: { userId: null, status: 'Activated' } });

  const lastSync = await this.prisma.depaVoucher.findFirst({
    orderBy: { syncedAt: 'desc' },
    select: { syncedAt: true },
  });

  // Get today's usage count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayUsage = await this.prisma.depaUsage.count({
    where: { date: today },
  });

  // Get pending reports (not sent)
  const pendingReports = await this.prisma.depaUsage.count({
    where: { sent: false },
  });

  return {
    ok: true,
    data: {
      vouchers: { total, activated, linked, unlinked },
      usage: { todayCount: todayUsage, pendingReports },
      lastSyncAt: lastSync?.syncedAt || null,
    },
  };
}

async manualLinkVoucher(voucherCode: string, userId: number) {
  const voucher = await this.prisma.depaVoucher.findUnique({
    where: { voucherCode },
  });

  if (!voucher) {
    return { ok: false, error: 'Voucher not found' };
  }

  const user = await this.prisma.user.findUnique({
    where: { userId },
  });

  if (!user) {
    return { ok: false, error: 'User not found' };
  }

  // Check if user already has a voucher
  if (user.depaVoucherCode && user.depaVoucherCode !== voucherCode) {
    return { ok: false, error: `User already linked to voucher ${user.depaVoucherCode}` };
  }

  await this.prisma.depaVoucher.update({
    where: { voucherCode },
    data: { userId },
  });

  await this.prisma.user.update({
    where: { userId },
    data: { depaVoucherCode: voucherCode },
  });

  this.logger.log(`Manually linked voucher ${voucherCode} to user ${userId}`);
  return { ok: true };
}

async unlinkVoucher(voucherCode: string) {
  const voucher = await this.prisma.depaVoucher.findUnique({
    where: { voucherCode },
  });

  if (!voucher) {
    return { ok: false, error: 'Voucher not found' };
  }

  if (voucher.userId) {
    await this.prisma.user.update({
      where: { userId: voucher.userId },
      data: { depaVoucherCode: null },
    });
  }

  await this.prisma.depaVoucher.update({
    where: { voucherCode },
    data: { userId: null },
  });

  this.logger.log(`Unlinked voucher ${voucherCode}`);
  return { ok: true };
}

async verifyUsage(voucherCode: string, fromDate: string, toDate: string) {
  if (!this.apiKey) {
    return { ok: false, error: 'DEPA_API_KEY not configured' };
  }

  try {
    const response = await fetch(
      'https://aitransformapi.depa.or.th/api/dp/GetVoucherUsage',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        body: JSON.stringify({
          voucherCode,
          fromDate,
          toDate,
          isProduction: this.isProduction,
        }),
      },
    );

    if (!response.ok) {
      return { ok: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
```

### 3. Add controller endpoints to depa.controller.ts

Add imports at top:
```typescript
import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { LinkVoucherDto, UnlinkVoucherDto, VerifyUsageDto, VoucherQueryDto } from './dto/depa.dto';
```

Add endpoints:
```typescript
@Get('admin/vouchers')
@UseGuards(AuthGuard)
async getVouchers(@Req() request: any, @Query() query: VoucherQueryDto) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  const linked = query.linked === 'true' ? true : query.linked === 'false' ? false : undefined;
  return this.depaService.getVouchers(query.status, linked);
}

@Get('admin/sync-status')
@UseGuards(AuthGuard)
async getSyncStatus(@Req() request: any) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  return this.depaService.getSyncStatus();
}

@Post('admin/sync')
@UseGuards(AuthGuard)
async triggerSync(@Req() request: any) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  try {
    const result = await this.depaService.syncVouchersFromDepa();
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

@Post('admin/link-voucher')
@UseGuards(AuthGuard)
async linkVoucher(@Req() request: any, @Body() body: LinkVoucherDto) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  return this.depaService.manualLinkVoucher(body.voucherCode, body.userId);
}

@Post('admin/unlink-voucher')
@UseGuards(AuthGuard)
async unlinkVoucher(@Req() request: any, @Body() body: UnlinkVoucherDto) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  return this.depaService.unlinkVoucher(body.voucherCode);
}

@Post('admin/verify-usage')
@UseGuards(AuthGuard)
async verifyUsage(@Req() request: any, @Body() body: VerifyUsageDto) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  return this.depaService.verifyUsage(body.voucherCode, body.fromDate, body.toDate);
}

@Post('admin/auto-link')
@UseGuards(AuthGuard)
async triggerAutoLink(@Req() request: any) {
  if (!request.user?.isAdmin) {
    return { ok: false, error: 'Admin access required' };
  }
  try {
    const result = await this.depaService.autoLinkVouchers();
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error: error.message };
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
- Show all new files created (dto/depa.dto.ts)
- Show all new methods in depa.service.ts
- Show all new endpoints in depa.controller.ts
- Confirm lint and typecheck pass

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /depa/admin/vouchers | List all vouchers with filters |
| GET | /depa/admin/sync-status | Get sync and usage statistics |
| POST | /depa/admin/sync | Trigger voucher sync from DEPA |
| POST | /depa/admin/link-voucher | Manually link voucher to user |
| POST | /depa/admin/unlink-voucher | Unlink voucher from user |
| POST | /depa/admin/verify-usage | Verify usage data in DEPA |
| POST | /depa/admin/auto-link | Trigger auto-link by phone |
