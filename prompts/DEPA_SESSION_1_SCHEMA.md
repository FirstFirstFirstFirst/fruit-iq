# DEPA Session 1: Schema & Migration

## Context Files to Read First
- `E:\DurianFarm\durico-web-backend\durico-nest-backend\prisma\schema.prisma`
- `E:\fruit-iq\DEPA_API_SPEC.md` (section 3.1 GetDPVouchers response)
- `E:\fruit-iq\DEPA_BACKEND_PLAN.md`

## Working Directory
`E:\DurianFarm\durico-web-backend\durico-nest-backend`

## Task
Add the DepaVoucher model to Prisma schema and update User model relation.

## Requirements

### 1. Add DepaVoucher model to prisma/schema.prisma

```prisma
model DepaVoucher {
  id              String    @id @default(cuid())
  voucherCode     String    @unique @db.VarChar(50)
  status          String    @db.VarChar(20)
  registType      String?   @db.VarChar(20)
  registId        String?   @db.VarChar(50)
  title           String?   @db.VarChar(20)
  firstName       String    @db.VarChar(100)
  lastName        String    @db.VarChar(100)
  idCard          String?   @db.VarChar(20)
  mobileNo        String    @db.VarChar(20)
  email           String?   @db.VarChar(255)
  addrNo          String?   @db.VarChar(50)
  moo             String?   @db.VarChar(20)
  provinceName    String?   @db.VarChar(100)
  amphurName      String?   @db.VarChar(100)
  tambonName      String?   @db.VarChar(100)
  postcode        String?   @db.VarChar(10)
  dpName          String?   @db.VarChar(255)
  productName     String?   @db.VarChar(255)
  bindingTime     DateTime?
  revokingTime    DateTime?
  activatedTime   DateTime?
  revokedTime     DateTime?
  userId          Int?
  user            User?     @relation("UserDepaVoucher", fields: [userId], references: [userId])
  syncedAt        DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([mobileNo])
  @@index([userId])
  @@index([status])
}
```

### 2. Update User model
Add this relation to the existing User model (DO NOT add new columns, just the relation):

```prisma
depaVoucher      DepaVoucher?  @relation("UserDepaVoucher")
```

### 3. DO NOT run migration
Just update the schema file. Migration will be run manually after all sessions complete.

## Validation
- Ensure DepaVoucher model includes all fields from DEPA API GetDPVouchers response
- Ensure relation names match: "UserDepaVoucher"
- Run `npx prisma validate` to check schema is valid

## Output
- Show the changes made to schema.prisma
- Confirm schema validation passes
