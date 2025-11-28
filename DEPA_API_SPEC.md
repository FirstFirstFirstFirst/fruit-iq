# API Specification for AI-Transformation Project

**Version:** 1
**Date:** 2025-11-16

---

## Document Change History

| No. | Date | Version | Add/Edit/Delete | Change Details | Responsible Person |
|-----|------|---------|-----------------|----------------|-------------------|
| 1. | Nov 16, 2025 | 1 | Add | Initial document creation | Adisak Sai-ong |

---

## 1. Introduction

### 1.1 Purpose

This document is created to show the details of various APIs that allow Digital Providers (DP) in the AI-Transformation project to retrieve data and send usage information linked to Vouchers that have been approved by depa.

### 1.2 API Overview

The API consists of 3 parts:

1. **Retrieve approved Voucher list**: Fetch the list of Vouchers approved by depa for each DP
2. **Send daily product usage data**: Submit daily usage data for products linked to activated Vouchers
3. **Retrieve daily product usage data**: Fetch usage data by specifying Voucher code to verify data submitted in section 1.2.2

---

## 2. General Information

**UAT and Production Base URL:** `https://aitransformapi.depa.or.th`

**Authentication:** Uses X-API-KEY for API access authorization

### 2.1 Authentication Setup

**Header Configuration:**
- **Key:** `x-api-key`
- **Value:** Your assigned API key (UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- **Description:** Required for all API endpoints

**API Key Format:**
The API key follows UUID v4 format (example: `3d9a2d47-yyyy-4c2c-xxxx-54f8a1988a17`). Each Digital Provider (DP) will receive a unique API key from depa.

### 2.2 API Performance Expectations

| Endpoint | Expected Response Time | Typical Response Size |
|----------|----------------------|---------------------|
| GetDPVouchers | 1-2 seconds | 1-2 KB (depends on record count) |
| VoucherUsage | 5-60 seconds | 100-200 B |
| GetVoucherUsage | 1-2 seconds | 300-400 B |

**Note:** VoucherUsage endpoint may have longer response times during bulk submissions (up to 100 records).

### 2.3 Environment Setup

**HTTP Client Configuration:**
```
Base URL: https://aitransformapi.depa.or.th
Content-Type: application/json
x-api-key: [Your API Key]
```

---

## 2.4 Response Codes and Error Handling

**HTTP Status Codes:**

| Status Code | Description | Action Required |
|------------|-------------|-----------------|
| 200 OK | Request successful | Process response data |
| 400 Bad Request | Invalid request format or parameters | Check request body format and required fields |
| 401 Unauthorized | Invalid or missing API key | Verify x-api-key header value |
| 403 Forbidden | Valid API key but insufficient permissions | Contact depa administrator |
| 500 Internal Server Error | Server-side error | Retry request or contact support |

**Standard Error Response Format:**
```json
{
  "success": false,
  "errorMessage": "Description of the error",
  "data": null
}
```

**Common Error Scenarios:**

1. **Missing API Key:** 401 Unauthorized - Add `x-api-key` to request headers
2. **Invalid Voucher Code:** 200 OK with empty data array `"data": []`
3. **Exceeding Record Limit (>100 records):** 400 Bad Request - "Maximum 100 records allowed per request"
4. **Invalid Date Format:** 400 Bad Request - "Invalid date format. Use YYYY-MM-DD"

---

## 3. API Details

### 3.1 GET DP Vouchers

| Section | Description |
|---------|-------------|
| **API Name** | GetDPVouchers |
| **End Point** | `{{BaseURL}}/api/dp/GetDPVouchers` |
| **Description** | Retrieve the list of Vouchers approved by depa for the DP |
| **Method** | POST |

**Request Header:**
```
Content-Type: application/json
x-api-key: YOUR_API_KEY
```

**Request Body:**
```json
{
  "pageNumber": 1,
  "pageSize": 500
}
```

**Data Types:**

| Field | Type | Description |
|-------|------|-------------|
| `pageNumber` | int (mandatory) | Page number starting from 1. Calculate total pages: `totalRecords / pageSize` |
| `pageSize` | int (mandatory) | Records per page (max 500) |

**Response Body:**
```json
{
  "success": true,
  "errorMessage": "",
  "totalRecords": 2,
  "pageSize": 500,
  "pageNumber": 1,
  "data": [
    {
      "voucherCode": "DV-97WHHUXXXX",
      "status": "Activated",
      "bindingTime": "2025-11-07 18:52:38",
      "revokingTime": "2026-02-05 18:52:38",
      "activatedTime": "2025-11-13 17:35:40",
      "revokedTime": "",
      "registId": "DV2025102713374000XXXX",
      "registType": "SME",
      "title": "Mr.",
      "firstName": "XXXX",
      "lastName": "YYYY",
      "idCard": "ZZZZZ",
      "mobileNo": "AAAAAA",
      "email": "",
      "addrNo": "79",
      "moo": "",
      "provinceName": "Bangkok",
      "amphurName": "Samphanthawong",
      "tambonName": "Chakrawat",
      "postcode": "10100",
      "dpName": "XXXXX",
      "productName": "YYYYY"
    }
  ]
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `voucherCode` | Unique voucher code (e.g., "DV-97WHHUXXXX") |
| `status` | Voucher status: "Activated", "Revoked", etc. |
| `bindingTime` | When voucher was bound to user |
| `revokingTime` | Scheduled revocation time |
| `activatedTime` | When voucher was activated |
| `revokedTime` | When voucher was revoked (empty if active) |
| `registId` | Registration ID |
| `registType` | Registration type: "SME", "Farmer", etc. |
| `firstName`, `lastName` | User's name |
| `idCard` | User's ID card number |
| `mobileNo` | User's mobile phone number |
| `email` | User's email (may be empty) |
| `provinceName`, `amphurName`, `tambonName` | Address information |
| `dpName` | Digital Provider name |
| `productName` | Product/service name |

---

### 3.2 Voucher Usage

| Section | Description |
|---------|-------------|
| **API Name** | VoucherUsage |
| **End Point** | `{{BaseURL}}/api/dp/VoucherUsage` |
| **Description** | Submit daily product usage data linked to Voucher codes |
| **Method** | POST |
| **Note** | System stores by VoucherCode per day. Duplicates keep latest record |

**Request Body:**
```json
{
  "isProduction": false,
  "vouchers": [
    {
      "accessDate": "2025-11-16",
      "voucherCode": "DV-BHRDV9XXXX",
      "appUserId": "appUserIdYYYYY1",
      "accessCount": 5,
      "accessTime": 180,
      "lat": 13.123456,
      "lon": 100.123456
    }
  ]
}
```

**Data Types:**

| Field | Type | Description |
|-------|------|-------------|
| `isProduction` | bool (mandatory) | `false` for UAT, `true` for Production |
| `vouchers` | List | Max 100 records per call |
| `accessDate` | string (mandatory) | Format: "YYYY-MM-DD" |
| `voucherCode` | string (mandatory) | Approved Voucher code |
| `appUserId` | string (mandatory) | User's app account in DP's system |
| `accessCount` | int (mandatory) | Number of accesses on that date |
| `accessTime` | int (mandatory) | Total time in minutes |
| `lat` | float | Latitude (0 if unavailable) |
| `lon` | float | Longitude (0 if unavailable) |

---

### 3.3 Get Voucher Usage

| Section | Description |
|---------|-------------|
| **API Name** | GetVoucherUsage |
| **End Point** | `{{BaseURL}}/api/dp/GetVoucherUsage` |
| **Description** | Retrieve usage data by Voucher Code (for verification) |
| **Method** | POST |

**Request Body:**
```json
{
  "voucherCode": "DV-BHRDV9XXXX",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "isProduction": false
}
```

**Response Body:**
```json
{
  "success": true,
  "errorMessage": "",
  "data": [
    {
      "voucherCode": "DV-BHRDV9XXXX",
      "accessDate": "2025-11-16",
      "appUserId": "appUserIdYYYYY1",
      "accessCount": 5,
      "accessTime": 180,
      "lat": 13.1235,
      "lon": 100.123,
      "createdTime": "2025-11-16 12:19:52"
    }
  ]
}
```

---

## 4. Integration Flow

### 4.1 Recommended Daily Flow

```
1. Sync Vouchers (GetDPVouchers)
   └── Fetch all approved vouchers with pagination
   └── Store/update in local database
   └── Match to app users by phone/idCard

2. Track Usage (Throughout the day)
   └── Record app opens (accessCount)
   └── Record session duration (accessTime)
   └── Store by userId + date

3. Report Usage (Daily at 00:30)
   └── Get yesterday's usage for voucher-linked users
   └── Format and send to VoucherUsage API (batches of 100)
   └── Mark as sent

4. Verify (Optional)
   └── Use GetVoucherUsage to confirm data was received
```

### 4.2 User-Voucher Linking Strategy

DEPA vouchers come with user details. Match using:

1. **Primary:** `mobileNo` → `User.phone`
2. **Secondary:** `idCard` → `User.idCard` (if stored)
3. **Fallback:** Manual admin linking

---

## 5. cURL Examples

**GetDPVouchers:**
```bash
curl --location 'https://aitransformapi.depa.or.th/api/dp/GetDPVouchers' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY_HERE' \
--data '{
    "pageNumber": 1,
    "pageSize": 500
}'
```

**VoucherUsage:**
```bash
curl --location 'https://aitransformapi.depa.or.th/api/dp/VoucherUsage' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY_HERE' \
--data '{
    "isProduction": false,
    "vouchers": [
        {
            "accessDate": "2025-11-16",
            "voucherCode": "DV-BHRDV9XXXX",
            "appUserId": "user001",
            "accessCount": 5,
            "accessTime": 180,
            "lat": 0,
            "lon": 0
        }
    ]
}'
```

**GetVoucherUsage:**
```bash
curl --location 'https://aitransformapi.depa.or.th/api/dp/GetVoucherUsage' \
--header 'Content-Type: application/json' \
--header 'x-api-key: YOUR_API_KEY_HERE' \
--data '{
    "voucherCode": "DV-BHRDV9XXXX",
    "fromDate": "2025-01-01",
    "toDate": "2025-12-31",
    "isProduction": false
}'
```

---

## 6. Environment Variables

```env
DEPA_API_KEY=your-api-key-here
DEPA_IS_PRODUCTION=false
DEPA_BASE_URL=https://aitransformapi.depa.or.th
```
