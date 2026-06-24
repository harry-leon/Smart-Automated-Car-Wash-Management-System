# AutoWash Pro - API Contracts & Integration Specifications

**Purpose:** Complete specification of all API endpoints, request/response formats, error handling, and frontend-backend integration patterns for AI implementation.

---

## Table of Contents

1. [API Design Principles](#1-api-design-principles)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Base Response Structure](#3-base-response-structure)
4. [Error Handling](#4-error-handling)
5. [EPIC 1: Authentication APIs](#5-epic-1-authentication-apis)
6. [EPIC 2: User Profile APIs](#6-epic-2-user-profile-apis)
7. [EPIC 3: Vehicle Management APIs](#7-epic-3-vehicle-management-apis)
8. [EPIC 4: Booking APIs](#8-epic-4-booking-apis)
9. [EPIC 5: Operations & Staff APIs](#9-epic-5-operations--staff-apis)
10. [EPIC 6: Loyalty & Points APIs](#10-epic-6-loyalty--points-apis)
11. [EPIC 7: Promotions & Vouchers APIs](#11-epic-7-promotions--vouchers-apis)
12. [EPIC 8: Admin APIs](#12-epic-8-admin-apis)
13. [EPIC 9: Notification APIs](#13-epic-9-notification-apis)
14. [WebSocket & Real-time Events](#14-websocket--real-time-events)
15. [Data Validation Rules](#15-data-validation-rules)
16. [Common DTOs & Enums](#16-common-dtos--enums)

---

## 1. API Design Principles

### 1.1 General Guidelines

- **Base URL:** `https://api.autowash.local/api/v1`
- **Protocol:** HTTPS only
- **Format:** JSON (application/json)
- **Version Strategy:** API versioning via URL path (`/api/v1`, `/api/v2`, etc.)
- **Rate Limiting:** 100 requests/minute per user
- **Timeout:** 30 seconds for all requests

### 1.2 HTTP Conventions

| Method | Purpose |
|--------|---------|
| `GET` | Retrieve resource(s) |
| `POST` | Create new resource or trigger action |
| `PUT` | Full update of resource |
| `PATCH` | Partial update of resource |
| `DELETE` | Soft delete (mark as inactive/deleted) |

### 1.3 Pagination Standard

For list endpoints (GET):

```json
{
  "success": true,
  "data": [
    { /* items */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

**Query Parameters:** `?page=1&limit=20&sort=createdAt&order=desc`

### 1.4 Sorting & Filtering

```
GET /api/v1/bookings?status=CONFIRMED&dateFrom=2026-01-01&dateTo=2026-01-31&customerId=123&sort=bookingDate&order=desc
```

---

## 2. Authentication & Authorization

### 2.1 JWT Token Structure

```
Header.Payload.Signature
```

**Payload (decoded):**
```json
{
  "sub": "user_id_123",
  "email": "customer@example.com",
  "phone": "0901234567",
  "role": "CUSTOMER",
  "tier": "SILVER",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### 2.2 Token Storage (Frontend)

- **Access Token:** 1-hour expiry, stored in secure HTTP-only cookie OR memory
- **Refresh Token:** 30-day expiry, stored in secure HTTP-only cookie
- **Local Storage:** Only non-sensitive data (user preferences, UI state)

### 2.3 Authorization Header

```
Authorization: Bearer {accessToken}
```

### 2.4 Role-Based Access Control

| Role | Accessible Endpoints | Workspace |
|------|---------------------|-----------|
| `CUSTOMER` | UI `/customer/*`; API `/customers/*`, user, booking, loyalty, notification endpoints | Customer portal |
| `STAFF` | UI `/staff/*`; API `/operations/*`, public endpoints | Staff operations |
| `ADMIN` | `/admin/*`, all endpoints | Admin dashboard |
| `GUEST` | Public endpoints only | Homepage |

### 2.5 Permission Examples

```java
@PreAuthorize("hasRole('CUSTOMER')")
GET /api/v1/customers/profile

@PreAuthorize("hasRole('STAFF')")
POST /api/v1/operations/wash-sessions/{id}/check-in

@PreAuthorize("hasRole('ADMIN')")
POST /api/v1/admin/packages

@PreAuthorize("permitAll()")
GET /api/v1/packages
```

---

## 3. Base Response Structure

### 3.1 Success Response (2xx)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    /* response payload */
  },
  "timestamp": "2026-05-23T10:30:00Z"
}
```

### 3.2 List Response (2xx)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Records retrieved",
  "data": [
    { /* item 1 */ },
    { /* item 2 */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  },
  "timestamp": "2026-05-23T10:30:00Z"
}
```

### 3.3 Error Response (4xx, 5xx)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_FORMAT"
    },
    {
      "field": "phone",
      "message": "Phone must be Vietnamese format",
      "code": "INVALID_PHONE"
    }
  ],
  "timestamp": "2026-05-23T10:30:00Z"
}
```

### 3.4 Paginated Error Response

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED",
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "JWT token has expired",
    "action": "REFRESH_TOKEN"
  },
  "timestamp": "2026-05-23T10:30:00Z"
}
```

---

## 4. Error Handling

### 4.1 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH |
| `201` | Created | Successful POST (resource created) |
| `202` | Accepted | Async operation started |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error, malformed request |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Token valid but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists (e.g., duplicate phone) |
| `422` | Unprocessable Entity | Business rule violation |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

### 4.2 Common Error Codes

```
Authentication & Authorization
├── TOKEN_MISSING
├── TOKEN_INVALID
├── TOKEN_EXPIRED
├── INSUFFICIENT_PERMISSION
├── ACCOUNT_BLOCKED
└── ACCOUNT_SUSPENDED

Validation
├── VALIDATION_ERROR
├── INVALID_FORMAT
├── INVALID_PHONE
├── INVALID_EMAIL
├── PASSWORD_WEAK
└── REQUIRED_FIELD_MISSING

Business Rules
├── BUSINESS_RULE_VIOLATION
├── DUPLICATE_PHONE
├── DUPLICATE_PLATE
├── MAX_VEHICLES_EXCEEDED
├── MAX_ACTIVE_BOOKINGS_EXCEEDED
├── INSUFFICIENT_POINTS
├── VOUCHER_EXPIRED
├── VOUCHER_ALREADY_USED
└── PROMOTION_NOT_APPLICABLE

Resource
├── RESOURCE_NOT_FOUND
├── RESOURCE_ALREADY_EXISTS
├── RESOURCE_LOCKED
└── RESOURCE_DELETED

System
├── INTERNAL_SERVER_ERROR
├── SERVICE_UNAVAILABLE
├── RATE_LIMIT_EXCEEDED
└── PAYMENT_GATEWAY_ERROR
```

### 4.3 Example Error Responses

**400 Bad Request (Validation):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "phone",
      "message": "Phone must start with 0 and be 10 digits",
      "code": "INVALID_PHONE"
    }
  ]
}
```

**401 Unauthorized (Token Expired):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication failed",
  "errorCode": "UNAUTHORIZED",
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "JWT token has expired",
    "action": "REFRESH_TOKEN"
  }
}
```

**422 Unprocessable Entity (Business Rule):**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Business rule violation",
  "errorCode": "BUSINESS_RULE_VIOLATION",
  "error": {
    "code": "DUPLICATE_PHONE",
    "message": "Phone number already registered",
    "suggestion": "Try logging in or use forgot password"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "error": {
    "resourceType": "Vehicle",
    "resourceId": "999",
    "message": "Vehicle with ID 999 not found"
  }
}
```

---

## 5. EPIC 1: Authentication APIs

### 5.1 POST /auth/register

**Register new customer account**

**Request:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "password": "SecurePassword123",
  "passwordConfirm": "SecurePassword123"
}
```

**Validation Rules:**
- `fullName`: 1-100 characters, required
- `phone`: Vietnamese format (0XXXXXXXXX), 10 digits, unique, required
- `email`: Valid email format, optional
- `password`: Min 8 chars, at least 1 uppercase, 1 number, 1 special char, required
- `passwordConfirm`: Must match password, required

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please verify OTP.",
  "data": {
    "userId": "user_123",
    "phone": "0901234567",
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "status": "PENDING",
    "requiresOtpVerification": true,
    "otpExpiresIn": 300
  }
}
```

**Error Responses:**
- `400` - Validation error (see validation rules above)
- `409` - Phone already registered (DUPLICATE_PHONE)

**Frontend Behavior:**
1. Show registration form with all fields
2. Validate each field in real-time
3. On submit: call endpoint
4. On success: redirect to `/verify` page with phone pre-filled
5. On error: show specific error messages per field

---

### 5.2 POST /auth/otp/send

**Request OTP code (usually auto-triggered after registration)**

**Request:**
```json
{
  "phone": "0901234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent successfully",
  "data": {
    "phone": "0901234567",
    "otpExpiresIn": 300,
    "maskedPhone": "0901****67",
    "message": "OTP has been sent to your phone"
  }
}
```

**Frontend Behavior:**
1. Show OTP input screen
2. Auto-send OTP on registration completion or manual request
3. Display countdown timer (5 minutes)
4. Show "Resend OTP" button after timer expires
5. Handle rate limiting on resend

---

### 5.3 POST /auth/otp/verify

**Verify OTP and activate account**

**Request:**
```json
{
  "phone": "0901234567",
  "otp": "123456"
}
```

**Validation:**
- `otp`: Exactly 6 digits, required
- Phone must match registration

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified. Account activated.",
  "data": {
    "userId": "user_123",
    "phone": "0901234567",
    "status": "ACTIVE",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "role": "CUSTOMER",
    "tier": "MEMBER"
  }
}
```

**Error Responses:**
- `400` - Invalid OTP format
- `422` - OTP incorrect or expired (INVALID_OTP, OTP_EXPIRED)
- `422` - Too many failed attempts (RATE_LIMIT_EXCEEDED)

**Frontend Behavior:**
1. Display OTP input with 6 digit fields (optional)
2. Show countdown timer
3. On success: store tokens, redirect to `/customer/home`
4. Show error message inline if OTP wrong
5. Allow retry up to 3 times

---

### 5.4 POST /auth/login

**Login with phone and password**

**Request:**
```json
{
  "phone": "0901234567",
  "password": "SecurePassword123",
  "rememberMe": false
}
```

**Validation:**
- `phone`: Required, Vietnamese format
- `password`: Required
- `rememberMe`: Optional, boolean

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "userId": "user_123",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "tier": "SILVER",
    "loyaltyBalance": 1250,
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `401` - Invalid credentials (INVALID_CREDENTIALS)
- `422` - Account blocked (ACCOUNT_BLOCKED)
- `422` - Account suspended (ACCOUNT_SUSPENDED)

**Frontend Behavior:**
1. Show login form (phone + password)
2. Optional "Remember me" checkbox
3. "Forgot password?" link
4. On success: store tokens, redirect to home based on role
5. Handle credential error gracefully
6. Show account status error if blocked/suspended

---

### 5.5 POST /auth/refresh

**Refresh access token using refresh token**

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token (TOKEN_INVALID, TOKEN_EXPIRED)

**Frontend Behavior:**
1. Automatically call on 401 response with expired access token
2. Store new access token
3. Retry original request
4. If refresh fails: redirect to login

---

### 5.6 POST /auth/logout

**Logout and revoke tokens**

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful"
}
```

**Frontend Behavior:**
1. Clear tokens from storage
2. Clear user session
3. Redirect to homepage
4. Clear any cached user data

---

### 5.7 POST /auth/forgot-password/request

**Request password reset**

**Request:**
```json
{
  "phone": "0901234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP sent to your phone",
  "data": {
    "phone": "0901234567",
    "otpExpiresIn": 300
  }
}
```

**Frontend Behavior:**
1. Show phone number input
2. On submit: call endpoint
3. Redirect to password reset verification screen
4. Wait for OTP

---

### 5.8 POST /auth/forgot-password/reset

**Verify OTP and reset password**

**Request:**
```json
{
  "phone": "0901234567",
  "otp": "123456",
  "newPassword": "NewSecurePassword123",
  "newPasswordConfirm": "NewSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful",
  "data": {
    "phone": "0901234567",
    "message": "Your password has been changed. Please login with new password."
  }
}
```

**Frontend Behavior:**
1. Show password reset form (OTP + new password fields)
2. Validate password strength in real-time
3. On success: redirect to login with message "Password changed successfully"
4. Clear any stored tokens

---

## 6. EPIC 2: User Profile APIs

### 6.1 GET /users/profile

**Get authenticated user's profile**

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved",
  "data": {
    "userId": "user_123",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "nguyenvana@example.com",
    "status": "ACTIVE",
    "role": "CUSTOMER",
    "tier": "SILVER",
    "isNewCustomer": true,
    "loyaltyBalance": 1250,
    "registeredAt": "2026-01-15T10:30:00Z",
    "preferences": {
      "language": "VI",
      "theme": "LIGHT",
      "notificationsEnabled": true
    }
  }
}
```

**Frontend Behavior:**
1. Call on app initialization for authenticated users
2. Cache profile data
3. Use for UI personalization (name, tier, loyalty balance)

---

### 6.2 PUT /users/profile

**Update user profile**

**Request:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "newemail@example.com",
  "phone": "0901234567"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "userId": "user_123",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "newemail@example.com",
    "updatedAt": "2026-05-23T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Phone already in use (DUPLICATE_PHONE)

**Frontend Behavior:**
1. Show profile edit form with current values
2. Validate each field in real-time
3. Show loading state on submit
4. On success: update cached profile, show success toast
5. Handle duplicate phone error

---

### 6.3 GET /users/preferences

**Get user's language and theme preferences**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preferences retrieved",
  "data": {
    "userId": "user_123",
    "language": "VI",
    "theme": "LIGHT",
    "notificationsEnabled": true,
    "emailNotifications": false,
    "smsNotifications": true
  }
}
```

---

### 6.4 PUT /users/preferences

**Update user preferences**

**Request:**
```json
{
  "language": "VI",
  "theme": "DARK",
  "notificationsEnabled": true,
  "emailNotifications": true,
  "smsNotifications": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Preferences updated",
  "data": {
    "language": "VI",
    "theme": "DARK",
    "notificationsEnabled": true,
    "updatedAt": "2026-05-23T10:30:00Z"
  }
}
```

**Frontend Behavior:**
1. Show settings page with toggle/select options
2. Apply changes immediately (optimistic update)
3. Show loading state
4. Persist language/theme to localStorage
5. Refresh UI if language/theme changed

---

## 7. EPIC 3: Vehicle Management APIs

### 7.1 POST /customers/vehicles

**Create new vehicle for customer**

**Request:**
```json
{
  "plate": "30H-123456",
  "type": "CAR",
  "brand": "Toyota",
  "model": "Camry",
  "year": 2023,
  "color": "Silver",
  "licensePlateImage": "base64_string_optional"
}
```

**Validation:**
- `plate`: Required, unique per customer, format like "30H-123456" or "51A-123456"
- `type`: Required, enum: CAR, SUV, TRUCK, MOTORBIKE, VAN
- `brand`: Required, 1-50 chars
- `model`: Required, 1-50 chars
- `year`: Required, 4-digit year
- `color`: Optional, 1-30 chars

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Vehicle created successfully",
  "data": {
    "vehicleId": "vehicle_456",
    "customerId": "user_123",
    "plate": "30H-123456",
    "type": "CAR",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2023,
    "color": "Silver",
    "status": "ACTIVE",
    "isPrimary": false,
    "createdAt": "2026-05-23T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Plate already exists for this customer (DUPLICATE_PLATE)

**Frontend Behavior:**
1. Show vehicle form with image upload
2. Validate plate format in real-time
3. On success: add vehicle to list, refresh vehicle dropdown
4. Allow setting as primary on creation

---

### 7.2 GET /customers/vehicles

**List all vehicles for authenticated customer**

**Query Parameters:**
- `page=1` - Page number
- `limit=20` - Items per page
- `status=ACTIVE` - Filter by status

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vehicles retrieved",
  "data": [
    {
      "vehicleId": "vehicle_456",
      "plate": "30H-123456",
      "type": "CAR",
      "brand": "Toyota",
      "model": "Camry",
      "color": "Silver",
      "isPrimary": true,
      "status": "ACTIVE",
      "lastServiceDate": "2026-05-20T14:00:00Z",
      "totalServices": 5
    },
    {
      "vehicleId": "vehicle_789",
      "plate": "51B-456789",
      "type": "SUV",
      "brand": "Honda",
      "model": "CR-V",
      "color": "Black",
      "isPrimary": false,
      "status": "ACTIVE",
      "lastServiceDate": "2026-04-10T10:00:00Z",
      "totalServices": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**Frontend Behavior:**
1. Display vehicle list with cards showing: plate, brand/model, type icon, status
2. Show "Set as Primary" button for non-primary vehicles
3. Add "Edit" button for each vehicle
4. Add "Delete" button for each vehicle
5. Show last service date if available
6. Total services count for reference

---

### 7.3 GET /customers/vehicles/{vehicleId}

**Get single vehicle details**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vehicle retrieved",
  "data": {
    "vehicleId": "vehicle_456",
    "customerId": "user_123",
    "plate": "30H-123456",
    "type": "CAR",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2023,
    "color": "Silver",
    "status": "ACTIVE",
    "isPrimary": true,
    "createdAt": "2026-01-15T10:30:00Z",
    "lastServiceDate": "2026-05-20T14:00:00Z",
    "totalServices": 5,
    "activeBookings": 0,
    "nextScheduledService": "2026-06-10T09:00:00Z"
  }
}
```

---

### 7.4 PUT /customers/vehicles/{vehicleId}

**Update vehicle details**

**Request:**
```json
{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "color": "Red"
}
```

**Note:** Plate cannot be changed

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vehicle updated",
  "data": {
    "vehicleId": "vehicle_456",
    "plate": "30H-123456",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "color": "Red",
    "updatedAt": "2026-05-23T10:30:00Z"
  }
}
```

---

### 7.5 POST /customers/vehicles/{vehicleId}/set-primary

**Set vehicle as primary for bookings**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Primary vehicle set",
  "data": {
    "vehicleId": "vehicle_456",
    "plate": "30H-123456",
    "isPrimary": true,
    "updatedAt": "2026-05-23T10:30:00Z"
  }
}
```

**Frontend Behavior:**
1. Remove primary flag from previously primary vehicle (optimistic)
2. Set primary flag on selected vehicle
3. Show success toast

---

### 7.6 DELETE /customers/vehicles/{vehicleId}

**Delete/deactivate vehicle**

**Response (204 No Content):**
```
No response body
```

Or with response:
```json
{
  "success": true,
  "statusCode": 204,
  "message": "Vehicle deleted"
}
```

**Error Responses:**
- `422` - Cannot delete vehicle with active bookings (RESOURCE_LOCKED)

**Frontend Behavior:**
1. Show confirmation dialog before delete
2. Display error if vehicle has active bookings
3. Remove from vehicle list on success
4. If was primary: set another as primary automatically

---

## 8. EPIC 4: Booking APIs

### 8.1 GET /packages

**List available service packages**

**Query Parameters:**
- `page=1`
- `limit=20`
- `status=ACTIVE` (optional, default shows only ACTIVE)
- `category=PREMIUM` (optional filter)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Packages retrieved",
  "data": [
    {
      "packageId": "pkg_001",
      "name": "Basic Wash",
      "description": "Standard wash and dry",
      "basePrice": 150000,
      "duration": 30,
      "category": "BASIC",
      "features": ["Exterior wash", "Dry", "Vacuum interior"],
      "image": "https://...",
      "status": "ACTIVE",
      "popularity": "HIGH"
    },
    {
      "packageId": "pkg_002",
      "name": "Premium Clean",
      "description": "Comprehensive cleaning service",
      "basePrice": 350000,
      "duration": 60,
      "category": "PREMIUM",
      "features": ["Exterior wash", "Interior vacuum", "Window cleaning", "Dashboard polish"],
      "image": "https://...",
      "status": "ACTIVE",
      "popularity": "MEDIUM"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**Frontend Behavior:**
1. Display package cards with name, description, price, duration
2. Show features as checklist
3. Add to cart or book immediately
4. Show "Most Popular" badge if applicable

---

### 8.2 GET /services

**List available service services**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "services retrieved",
  "data": [
    {
      "addonId": "addon_001",
      "name": "Interior Deep Clean",
      "description": "Deep carpet and upholstery cleaning",
      "price": 150000,
      "duration": 30,
      "category": "INTERIOR",
      "image": "https://...",
      "applicableToPackages": ["pkg_001", "pkg_002"],
      "status": "ACTIVE"
    },
    {
      "addonId": "addon_002",
      "name": "Wax Coating",
      "description": "Protective wax coating for exterior",
      "price": 200000,
      "duration": 15,
      "category": "PROTECTION",
      "applicableToPackages": ["pkg_002", "pkg_003"],
      "status": "ACTIVE"
    }
  ]
}
```

**Frontend Behavior:**
1. Show services as checkboxes during checkout
2. Display price increase for each selected service
3. Filter services based on selected package
4. Show duration estimate updates as services are selected

---

### 8.3 GET /combos/available

**List available combo packages**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Available combos",
  "data": [
    {
      "comboId": "combo_001",
      "name": "Monthly Unlimited",
      "description": "Unlimited wash services for one month",
      "basePrice": 500000,
      "durationDays": 30,
      "maxServices": 4,
      "benefits": ["Unlimited basic wash", "Priority scheduling", "5% loyalty bonus"],
      "image": "https://...",
      "isActive": true,
      "canUpgrade": false,
      "upgradePriceFrom": 0
    }
  ]
}
```

---

### 8.4 POST /bookings/validate-voucher

**Validate voucher code before booking**

**Request:**
```json
{
  "voucherCode": "WELCOME20",
  "packageId": "pkg_001",
  "amount": 150000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Voucher is valid",
  "data": {
    "voucherCode": "WELCOME20",
    "isValid": true,
    "discountType": "PERCENT",
    "discountValue": 20,
    "discountAmount": 30000,
    "finalAmount": 120000,
    "expiresAt": "2026-12-31T23:59:59Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Voucher validation failed",
  "errorCode": "BUSINESS_RULE_VIOLATION",
  "error": {
    "code": "VOUCHER_EXPIRED",
    "message": "This voucher has expired",
    "action": "USE_DIFFERENT_VOUCHER"
  }
}
```

**Error Codes:**
- `VOUCHER_NOT_FOUND` - Code doesn't exist
- `VOUCHER_EXPIRED` - Date passed
- `VOUCHER_ALREADY_USED` - Used up all redemptions
- `VOUCHER_CUSTOMER_LIMIT_REACHED` - Already used N times
- `NEW_CUSTOMER_ONLY` - Customer is not new
- `AMOUNT_TOO_LOW` - Below minimum amount

**Frontend Behavior:**
1. Show voucher input field with "Check" button
2. Call endpoint on blur or button click
3. Display validation result (green checkmark or error)
4. Update final amount display if valid
5. Auto-check if voucher entered

---

### 8.5 POST /customers/bookings

**Create new booking (checkout)**

**Request:**
```json
{
  "vehicleId": "vehicle_456",
  "packageId": "pkg_001",
  "addons": ["addon_001", "addon_002"],
  "bookingDate": "2026-06-10",
  "bookingTime": "14:00",
  "voucherCode": "WELCOME20",
  "paymentMethod": "E_WALLET",
  "comboId": "combo_001"
}
```

**Validation:**
- `vehicleId`: Required, must be customer's vehicle
- `packageId` or `comboId`: One required
- `bookingDate`: Required, future date, within acceptance window
- `bookingTime`: Required, HH:MM format
- `paymentMethod`: Required, enum: BANK_TRANSFER, E_WALLET, CASH_AT_COUNTER
- `voucherCode`: Optional

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Booking created successfully",
  "data": {
    "bookingId": "BK_20260523_001",
    "customerId": "user_123",
    "vehicleId": "vehicle_456",
    "vehiclePlate": "30H-123456",
    "packageId": "pkg_001",
    "packageName": "Basic Wash",
    "addons": [
      {
        "addonId": "addon_001",
        "name": "Interior Deep Clean",
        "price": 150000
      }
    ],
    "basePrice": 150000,
    "addonsTotal": 150000,
    "voucherDiscount": 30000,
    "finalAmount": 270000,
    "bookingDate": "2026-06-10",
    "bookingTime": "14:00",
    "estimatedDuration": 75,
    "paymentMethod": "E_WALLET",
    "paymentStatus": "CONFIRMED",
    "status": "CONFIRMED",
    "createdAt": "2026-05-23T10:30:00Z",
    "confirmationNumber": "BK_20260523_001"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `422` - Max 3 active bookings exceeded (MAX_ACTIVE_BOOKINGS_EXCEEDED)
- `422` - Vehicle not found or not owned (RESOURCE_NOT_FOUND)
- `422` - Package/combo not available (BUSINESS_RULE_VIOLATION)

**Frontend Behavior:**
1. Show multi-step checkout form
   - Step 1: Select vehicle
   - Step 2: Select package/combo
   - Step 3: Select services
   - Step 4: Choose date/time
   - Step 5: Enter voucher code
   - Step 6: Select payment method
   - Step 7: Review & confirm
2. Real-time price calculation as items are selected
3. On success: show confirmation screen with booking details
4. Offer print/share booking confirmation
5. Redirect to booking details after delay

---

### 8.6 GET /customers/bookings

**List customer's bookings**

**Query Parameters:**
- `page=1`
- `limit=20`
- `status=CONFIRMED` (optional filter)
- `dateFrom=2026-01-01` (optional)
- `dateTo=2026-12-31` (optional)
- `sort=bookingDate&order=desc`

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings retrieved",
  "data": [
    {
      "bookingId": "BK_20260523_001",
      "vehiclePlate": "30H-123456",
      "servicePackageName": "Basic Wash",
      "bookingDate": "2026-06-10",
      "bookingTime": "14:00",
      "finalAmount": 270000,
      "status": "CONFIRMED",
      "washStatus": null,
      "createdAt": "2026-05-23T10:30:00Z"
    },
    {
      "bookingId": "BK_20260520_012",
      "vehiclePlate": "30H-123456",
      "packageName": "Premium Clean",
      "bookingDate": "2026-05-20",
      "bookingTime": "10:00",
      "finalAmount": 350000,
      "status": "COMPLETED",
      "washStatus": "COMPLETED",
      "completedAt": "2026-05-20T11:15:00Z",
      "createdAt": "2026-05-20T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "hasMore": true
  }
}
```

**Frontend Behavior:**
1. Display booking list with status badges (Confirmed, In Progress, Completed, Cancelled)
2. Show vehicle plate, package name, date/time, amount, status
3. Add filter by status, date range
4. Sorting options: newest first, oldest first
5. Click row to open booking details
6. Add "Cancel Booking" button for CONFIRMED status
7. Add "Rate Service" for COMPLETED status

---

### 8.7 GET /customers/bookings/{bookingId}

**Get booking details**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking retrieved",
  "data": {
    "bookingId": "BK_20260523_001",
    "confirmationNumber": "BK_20260523_001",
    "customerId": "user_123",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "vehicleId": "vehicle_456",
    "vehiclePlate": "30H-123456",
    "vehicleBrand": "Toyota",
    "vehicleModel": "Camry",
    "packageId": "pkg_001",
    "packageName": "Basic Wash",
    "addons": [
      {
        "addonId": "addon_001",
        "name": "Interior Deep Clean",
        "price": 150000
      }
    ],
    "pricing": {
      "basePrice": 150000,
      "addonsTotal": 150000,
      "subtotal": 300000,
      "voucherCode": "WELCOME20",
      "voucherDiscount": 30000,
      "finalAmount": 270000,
      "currency": "VND"
    },
    "scheduling": {
      "bookingDate": "2026-06-10",
      "bookingTime": "14:00",
      "estimatedDuration": 75,
      "estimatedEndTime": "15:15"
    },
    "payment": {
      "method": "E_WALLET",
      "status": "CONFIRMED",
      "transactionId": "TXN_20260523_001",
      "paidAt": "2026-05-23T10:30:00Z"
    },
    "status": "CONFIRMED",
    "washSessionId": null,
    "staffName": null,
    "washStatus": null,
    "notes": "Please be gentle with new paint",
    "createdAt": "2026-05-23T10:30:00Z"
  }
}
```

**Frontend Behavior:**
1. Show full booking details in structured layout
2. Display price breakdown
3. Show vehicle info with photo
4. Display scheduled date/time prominently
5. Show payment status and method
6. If pending: show check-in instructions
7. If in progress: show real-time status updates
8. If completed: show rating option and completion details
9. Show "Cancel Booking" button if status allows

---

### 8.8 POST /customers/bookings/{bookingId}/cancel

**Cancel booking**

**Request:**
```json
{
  "reason": "Cannot make it to appointment"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking cancelled successfully",
  "data": {
    "bookingId": "BK_20260523_001",
    "status": "CANCELLED",
    "cancelledAt": "2026-05-23T10:45:00Z",
    "refundAmount": 270000,
    "refundStatus": "INITIATED",
    "refundMessage": "Refund will be processed within 3-5 business days"
  }
}
```

**Cancellation Rules:**
- `200` - Booking can be cancelled while `PENDING` or `CONFIRMED`

**Error Responses:**
- `422` - Cannot cancel (IN_PROGRESS or COMPLETED) - RESOURCE_LOCKED

**Frontend Behavior:**
1. Show confirmation dialog with warning
2. Optional reason text area
3. Show refund amount
4. On success: mark booking as cancelled, show refund message
5. Prevent further actions on cancelled booking

---

## 9. EPIC 5: Operations & Staff APIs

### 9.1 POST /operations/wash-sessions

**Create wash session from confirmed booking (Admin/Operations)**

**Request:**
```json
{
  "bookingId": "BK_20260523_001",
  "staffId": "staff_123",
  "preferredStartTime": "2026-06-10T14:00:00Z",
  "station": "BAY_1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Wash session created",
  "data": {
    "washSessionId": "WS_20260610_001",
    "bookingId": "BK_20260523_001",
    "bookingCode": "BK_20260523_001",
    "staffId": "staff_123",
    "staffName": "Trần Văn B",
    "customerName": "Nguyễn Văn A",
    "vehiclePlate": "30H-123456",
    "packageName": "Basic Wash",
    "scheduledTime": "2026-06-10T14:00:00Z",
    "estimatedDuration": 75,
    "estimatedEndTime": "2026-06-10T15:15:00Z",
    "status": "PENDING",
    "createdAt": "2026-05-23T10:30:00Z"
  }
}
```

**Error Responses:**
- `404` - Booking not found
- `422` - Booking not CONFIRMED (BUSINESS_RULE_VIOLATION)
- `422` - Staff not ACTIVE or too busy (RESOURCE_LOCKED)

**Frontend Behavior:**
1. Show modal to select staff and time for booking
2. Validate staff availability/capacity
3. On success: redirect to operations queue
4. Show session created confirmation

---

### 9.2 POST /operations/wash-sessions/{sessionId}/check-in

**Check-in: verify plate and mark session as checked in**

**Request:**
```json
{
  "vehiclePlate": "30H-123456",
  "plateVerified": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Check-in successful",
  "data": {
    "washSessionId": "WS_20260610_001",
    "status": "CHECKED_IN",
    "checkedInAt": "2026-06-10T13:58:00Z",
    "customerName": "Nguyễn Văn A",
    "vehiclePlate": "30H-123456",
    "nextAction": "START_WASHING"
  }
}
```

**Error Responses:**
- `422` - Plate doesn't match (PLATE_MISMATCH)
- `404` - Session not found

**Frontend Behavior:**
1. Show check-in panel with vehicle photo/details
2. Scan plate or manual entry
3. Show plate verification checkbox (mandatory)
4. Show "Start Washing" button once verified
5. Display error if plate doesn't match

---

### 9.3 POST /operations/wash-sessions/{sessionId}/start

**Start washing**

**Request:**
```json
{
  "startTime": "2026-06-10T14:00:00Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Washing started",
  "data": {
    "washSessionId": "WS_20260610_001",
    "status": "IN_PROGRESS",
    "startedAt": "2026-06-10T14:00:00Z",
    "estimatedEndTime": "2026-06-10T15:15:00Z",
    "timerDisplay": "75 minutes",
    "nextAction": "COMPLETE_WASH"
  }
}
```

**Frontend Behavior:**
1. Show timer counting down estimated duration
2. Display vehicle details and package info
3. Show "Complete Wash" button
4. Optional: show photos/notes fields for staff
5. Show timer with alerts at 5 min, 1 min before end

---

### 9.4 POST /operations/wash-sessions/{sessionId}/complete

**Mark wash as completed**

**Request:**
```json
{
  "notes": "Service completed successfully",
  "actualDuration": 72
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Wash completed",
  "data": {
    "washSessionId": "WS_20260610_001",
    "status": "COMPLETED",
    "completedAt": "2026-06-10T15:12:00Z",
    "actualDuration": 72,
    "bookingId": "BK_20260523_001",
    "paymentStatus": "CONFIRMED",
    "loyaltyPointsEarned": 27,
    "message": "Thank you for using AutoWash!"
  }
}
```

**Frontend Behavior:**
1. Show completion confirmation
2. Display points earned
3. Show completion time
4. Allow adding service notes/photos
5. Show "Next booking" or "Finish" button
6. Clear timer and return to queue

---

### 9.5 GET /operations/queue

**Get wash queue for staff (real-time operations board)**

**Query Parameters:**
- `status=PENDING,CHECKED_IN,IN_PROGRESS` (optional, comma-separated)
- `staffId=staff_123` (optional, filter by staff)
- `dateFrom=2026-06-10` (optional)
- `searchQuery=30H-123456` (optional, plate/customer search)
- `page=1&limit=50`

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Queue retrieved",
  "data": [
    {
      "washSessionId": "WS_20260610_001",
      "bookingCode": "BK_20260523_001",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "vehiclePlate": "30H-123456",
      "vehicleBrand": "Toyota",
      "vehicleModel": "Camry",
      "packageName": "Basic Wash",
      "staffName": "Trần Văn B",
      "scheduledTime": "2026-06-10T14:00:00Z",
      "checkedInAt": "2026-06-10T13:58:00Z",
      "estimatedEndTime": "2026-06-10T15:15:00Z",
      "status": "IN_PROGRESS",
      "timeRemaining": 15,
      "nextAction": "COMPLETE_WASH",
      "priority": "NORMAL"
    },
    {
      "washSessionId": "WS_20260610_002",
      "bookingCode": "BK_20260523_002",
      "customerName": "Trần Thị C",
      "customerPhone": "0912345678",
      "vehiclePlate": "30H-654321",
      "vehicleBrand": "Honda",
      "vehicleModel": "CR-V",
      "packageName": "Premium Clean",
      "staffName": "Unassigned",
      "scheduledTime": "2026-06-10T15:30:00Z",
      "checkedInAt": null,
      "estimatedEndTime": "2026-06-10T17:00:00Z",
      "status": "PENDING",
      "timeUntilStart": 90,
      "nextAction": "ASSIGN_STAFF_AND_CHECK_IN",
      "priority": "NORMAL"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1,
    "hasMore": false
  }
}
```

**Frontend Behavior:**
1. Display queue as Kanban board (columns: Pending, Checked-In, In Progress, Completed)
2. Show session cards with: booking code, customer name, vehicle, package, time, status
3. Color-code by priority (red=urgent, yellow=soon, green=normal)
4. Auto-refresh every 30 seconds
5. Click to expand session details
6. Drag to change status (optional, if supporting drag-and-drop)
7. Show timer for in-progress sessions
8. Search/filter capabilities

---

### 9.6 GET /admin/operations/dashboard

**Admin operations dashboard with metrics**

**Query Parameters:**
- `dateFrom=2026-06-10` (optional)
- `dateTo=2026-06-15` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard data retrieved",
  "data": {
    "metrics": {
      "todayTotal": 12,
      "todayCompleted": 8,
      "todayInProgress": 2,
      "todayPending": 2,
      "averageWashTime": 65,
      "utilizationRate": 0.85,
      "noShowCount": 1,
      "cancelledCount": 0
    },
    "queue": [
      {
        "washSessionId": "WS_20260610_001",
        "bookingCode": "BK_20260523_001",
        "customerName": "Nguyễn Văn A",
        "vehiclePlate": "30H-123456",
        "packageName": "Basic Wash",
        "staffName": "Trần Văn B",
        "scheduledTime": "2026-06-10T14:00:00Z",
        "status": "IN_PROGRESS"
      }
    ],
    "staffStatus": [
      {
        "staffId": "staff_123",
        "staffName": "Trần Văn B",
        "status": "ACTIVE",
        "currentLoad": 1,
        "capacity": 3,
        "availableSlots": 2
      }
    ]
  }
}
```

---

## 10. EPIC 6: Loyalty & Points APIs

### 10.1 GET /loyalty/account

**Get customer's loyalty account details**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Loyalty account retrieved",
  "data": {
    "customerId": "user_123",
    "loyaltyAccountId": "loyalty_456",
    "currentTier": "SILVER",
    "totalPoints": 2500,
    "availableBalance": 1250,
    "nextTierThreshold": 5000,
    "pointsUntilNextTier": 2500,
    "tierBenefits": {
      "name": "Silver",
      "pointMultiplier": 1.2,
      "benefits": ["Priority booking", "5% discount on services", "Free tier upgrade token"]
    },
    "lastTierReviewDate": "2026-05-01T00:00:00Z",
    "nextTierReviewDate": "2026-06-01T00:00:00Z",
    "expiringPointsWarnings": [
      {
        "expiringPoints": 300,
        "expiresAt": "2026-05-25T23:59:59Z",
        "daysUntilExpiry": 2
      }
    ],
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Frontend Behavior:**
1. Display loyalty card with tier, points balance prominently
2. Show tier benefits and progress to next tier
3. Display expiring points warning if any
4. Show tier upgrade date
5. Add "Redeem Points" and "View Transactions" buttons

---

### 10.2 POST /loyalty/redeem-points

**Redeem points for voucher**

**Request:**
```json
{
  "points": 100
}
```

**Validation:**
- `points`: 50-200 range, whole number

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Points redeemed successfully",
  "data": {
    "redemptionId": "redemption_123",
    "voucherCode": "REDEEM_ABC123XYZ",
    "pointsRedeemed": 100,
    "voucherValue": 100000,
    "currency": "VND",
    "expiresAt": "2026-08-23T23:59:59Z",
    "remainingPoints": 1150,
    "message": "Voucher created! Use code REDEEM_ABC123XYZ at checkout."
  }
}
```

**Error Responses:**
- `422` - Insufficient points (INSUFFICIENT_POINTS)
- `422` - Max active vouchers reached (MAX_VOUCHERS_EXCEEDED)
- `422` - Account blocked (ACCOUNT_BLOCKED)

**Frontend Behavior:**
1. Show redemption dialog with points slider (50-200 range)
2. Display value in VND dynamically (1 point = 1,000 VND)
3. Show balance after redemption
4. Confirmation dialog before submit
5. On success: show voucher code with copy button
6. Show expiry date and instruction to use at checkout
7. Close dialog and update loyalty balance

---

### 10.3 POST /bookings/{bookingId}/apply-points

**Apply points to booking for discount**

**Request:**
```json
{
  "pointsToRedeem": 50
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Points applied",
  "data": {
    "bookingId": "BK_20260523_001",
    "pointsApplied": 50,
    "pointValue": 50000,
    "originalAmount": 270000,
    "adjustedAmount": 220000,
    "pointsSavings": 50000,
    "remainingPoints": 1200,
    "message": "Discount applied successfully!"
  }
}
```

**Error Responses:**
- `422` - Insufficient points or amount too high (INSUFFICIENT_POINTS)
- `422` - Cannot redeem for this booking (BUSINESS_RULE_VIOLATION)

**Frontend Behavior:**
1. Show points application slider during checkout
2. Display savings amount in real-time
3. Show remaining points after use
4. Validate before payment
5. Include applied points in final total display

---

### 10.4 GET /loyalty/transactions

**Get point transaction history**

**Query Parameters:**
- `page=1&limit=20`
- `type=EARN,REDEEM,EXPIRE` (optional filter)
- `dateFrom=2026-01-01` (optional)
- `dateTo=2026-12-31` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transactions retrieved",
  "data": [
    {
      "transactionId": "txn_001",
      "type": "EARN",
      "amount": 27,
      "balance": 1250,
      "reference": "BK_20260520_012",
      "description": "Booking completion - Premium Clean",
      "createdAt": "2026-05-20T11:15:00Z"
    },
    {
      "transactionId": "txn_002",
      "type": "REDEEMED_AT_CHECKOUT",
      "amount": -50,
      "balance": 1200,
      "reference": "BK_20260515_008",
      "description": "Points used for booking discount",
      "createdAt": "2026-05-15T10:00:00Z"
    },
    {
      "transactionId": "txn_003",
      "type": "REDEEMED_FOR_VOUCHER",
      "amount": -100,
      "balance": 1250,
      "reference": "redemption_123",
      "description": "Redeemed for voucher code REDEEM_ABC123XYZ",
      "createdAt": "2026-05-10T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

**Frontend Behavior:**
1. Show transaction list with type, amount, balance, date, description
2. Color-code: green for earn, red for redeem/expire
3. Filter by transaction type
4. Sort by date (newest first)
5. Click transaction for details

---

## 11. EPIC 7: Promotions & Vouchers APIs

### 11.1 GET /promotions

**Get active promotions**

**Query Parameters:**
- `page=1&limit=20`

Customer tier is resolved from the authenticated customer token; clients do not pass another customer's tier.

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Promotions retrieved",
  "data": [
    {
      "promotionId": "promo_001",
      "name": "Summer Flash Sale",
      "description": "20% off all services",
      "discountType": "PERCENT",
      "discountValue": 20,
      "startDate": "2026-06-01T00:00:00Z",
      "endDate": "2026-08-31T23:59:59Z",
      "targetingMode": "ALL_TIERS",
      "applicableTiers": ["MEMBER", "SILVER", "GOLD", "PLATINUM"],
      "maxUsagePerCustomer": 1,
      "status": "ACTIVE",
      "createdAt": "2026-05-23T10:30:00Z",
      "updatedAt": "2026-05-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### 11.2 GET /vouchers/available

**Get available vouchers for customer**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Available vouchers",
  "data": [
    {
      "voucherId": "voucher_001",
      "code": "WELCOME20",
      "description": "20% off first booking",
      "discountType": "PERCENT",
      "discountValue": 20,
      "minAmount": 50000,
      "maxAmount": null,
      "expiresAt": "2026-12-31T23:59:59Z",
      "remaining": 950,
      "isNew": false
    },
    {
      "voucherId": "voucher_002",
      "code": "NEWYEAR50K",
      "description": "50,000 VND discount",
      "discountType": "FIXED_AMOUNT",
      "discountValue": 50000,
      "minAmount": 200000,
      "maxAmount": null,
      "expiresAt": "2026-12-31T23:59:59Z",
      "remaining": 500,
      "isNew": true
    }
  ]
}
```

---

### 11.3 GET /combos

**Get available combos**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Combos retrieved",
  "data": [
    {
      "comboId": "combo_001",
      "name": "Monthly Unlimited",
      "description": "Unlimited wash for 30 days",
      "basePrice": 500000,
      "durationDays": 30,
      "maxServices": 4,
      "benefits": ["Unlimited basic wash", "Priority booking", "5% loyalty bonus"],
      "image": "https://...",
      "status": "ACTIVE",
      "isActive": false,
      "canUpgrade": false
    }
  ]
}
```

---

### 11.4 POST /customers/combos/{comboId}/activate

**Activate combo subscription**

**Request:**
```json
{
  "vehicleId": "vehicle_456"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Combo activated",
  "data": {
    "activeComboId": "activeCombo_123",
    "comboId": "combo_001",
    "comboName": "Monthly Unlimited",
    "vehicleId": "vehicle_456",
    "vehiclePlate": "30H-123456",
    "startDate": "2026-05-23T00:00:00Z",
    "expiresAt": "2026-06-23T23:59:59Z",
    "daysRemaining": 30,
    "servicesIncluded": 4,
    "servicesUsed": 0,
    "pointsEarned": 250,
    "message": "Combo activated! Enjoy unlimited services."
  }
}
```

**Error Responses:**
- `422` - User already has active combo (BUSINESS_RULE_VIOLATION)
- `422` - No vehicles (BUSINESS_RULE_VIOLATION)

**Frontend Behavior:**
1. Show combo details with benefits
2. Select vehicle to apply combo to
3. Show payment/charge info
4. On success: show activation confirmation
5. Show expiry date and services included
6. Update customer home to show active combo

---

## 12. EPIC 8: Admin APIs

### 12.1 GET /admin/dashboard/metrics

**Get admin dashboard KPI metrics**

**Query Parameters:**
- `dateFrom=2026-06-01` (optional)
- `dateTo=2026-06-30` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard metrics retrieved",
  "data": {
    "metrics": {
      "totalBookings": 125,
      "completedBookings": 110,
      "pendingBookings": 10,
      "cancelledBookings": 5,
      "totalRevenue": 35250000,
      "averageOrderValue": 282000,
      "totalCustomers": 156,
      "newCustomersThisMonth": 23,
      "loyaltyPointsIssued": 3525,
      "loyaltyPointsRedeemed": 890,
      "activePromotions": 3,
      "noShowCount": 2,
      "noShowRate": 0.016
    },
    "recentBookings": [
      {
        "bookingId": "BK_20260523_001",
        "customerName": "Nguyễn Văn A",
        "amount": 270000,
        "status": "COMPLETED",
        "date": "2026-05-23T10:30:00Z"
      }
    ],
    "topPackages": [
      {
        "packageId": "pkg_001",
        "name": "Basic Wash",
        "bookingCount": 45,
        "revenue": 6750000
      }
    ]
  }
}
```

---

### 12.2 GET /admin/bookings

**Get all bookings (admin view)**

**Query Parameters:**
- `page=1&limit=20`
- `status=CONFIRMED,IN_PROGRESS` (optional)
- `dateFrom=2026-01-01` (optional)
- `dateTo=2026-12-31` (optional)
- `customerId=user_123` (optional)
- `searchQuery=30H-123456` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Bookings retrieved",
  "data": [
    {
      "bookingId": "BK_20260523_001",
      "confirmationNumber": "BK_20260523_001",
      "customerId": "user_123",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "vehiclePlate": "30H-123456",
      "servicePackageId": "pkg_001",
      "packageName": "Basic Wash",
      "bookingDate": "2026-06-10",
      "bookingTime": "14:00",
      "finalAmount": 270000,
      "paymentMethod": "E_WALLET",
      "paymentStatus": "CONFIRMED",
      "status": "CONFIRMED",
      "sessionId": null,
      "washStatus": null,
      "createdAt": "2026-05-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7,
    "hasMore": true
  }
}
```

---

### 12.3 GET /admin/bookings/{bookingId}

**Get booking detail (admin view)**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking retrieved",
  "data": {
    "bookingId": "BK_20260523_001",
    "confirmationNumber": "BK_20260523_001",
    "customer": {
      "customerId": "user_123",
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@example.com",
      "tier": "SILVER",
      "status": "ACTIVE"
    },
    "vehicle": {
      "vehicleId": "vehicle_456",
      "plate": "30H-123456",
      "brand": "Toyota",
      "model": "Camry",
      "color": "Silver"
    },
    "service": {
      "packageId": "pkg_001",
      "packageName": "Basic Wash",
      "addons": ["addon_001"],
      "duration": 75
    },
    "pricing": {
      "basePrice": 150000,
      "addonsTotal": 150000,
      "voucherDiscount": 30000,
      "finalAmount": 270000
    },
    "scheduling": {
      "bookingDate": "2026-06-10",
      "bookingTime": "14:00",
      "estimatedDuration": 75
    },
    "payment": {
      "method": "E_WALLET",
      "status": "CONFIRMED",
      "transactionId": "TXN_20260523_001"
    },
    "operationalStatus": {
      "status": "CONFIRMED",
      "washSessionId": null,
      "assignedStaff": null,
      "checkedInAt": null,
      "completedAt": null
    },
    "actions": {
      "canAssignStaff": true,
      "canAssignDifferentStaff": false,
      "canEditStaff": false
    }
  }
}
```

---

### 12.4 PUT /admin/bookings/{bookingId}/assign-staff

**Assign staff to booking wash session**

**Request:**
```json
{
  "staffId": "staff_456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Staff assigned",
  "data": {
    "bookingId": "BK_20260523_001",
    "washSessionId": "WS_20260610_001",
    "staffId": "staff_456",
    "staffName": "Phạm Văn C",
    "assignedAt": "2026-05-23T10:45:00Z"
  }
}
```

---

### 12.5 GET /admin/customers

**Get customer directory**

**Query Parameters:**
- `page=1&limit=20`
- `status=ACTIVE` (optional)
- `tier=SILVER,GOLD` (optional)
- `searchQuery=Nguyễn` (optional)
- `registeredFrom=2026-01-01` (optional)
- `registeredTo=2026-12-31` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customers retrieved",
  "data": [
    {
      "customerId": "user_123",
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@example.com",
      "status": "ACTIVE",
      "tier": "SILVER",
      "loyaltyBalance": 1250,
      "totalBookings": 5,
      "lastBookingDate": "2026-05-20T11:15:00Z",
      "totalSpent": 1350000,
      "registeredAt": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

### 12.6 GET /admin/customers/{customerId}

**Get customer detail**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer retrieved",
  "data": {
    "customerId": "user_123",
    "profile": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "email": "nguyenvana@example.com",
      "status": "ACTIVE",
      "tier": "SILVER",
      "registeredAt": "2026-01-15T10:30:00Z"
    },
    "loyalty": {
      "currentPoints": 1250,
      "tier": "SILVER",
      "updatedAt": "2026-05-20T11:15:00Z"
    },
    "summary": {
      "totalBookings": 5,
      "completedBookings": 4,
      "cancelledBookings": 1,
      "totalWashSessions": 4,
      "totalSpent": 1350000,
      "totalPointsEarned": 135,
      "totalPointsSpent": 50,
      "lastBookingDate": "2026-05-20T11:15:00Z",
      "lastBookingAmount": 350000
    }
  }
}
```

---

### 12.7 GET /admin/customers/{customerId}/bookings

**Get customer's bookings (admin view)**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer bookings retrieved",
  "data": [
    {
      "bookingId": "BK_20260523_001",
      "vehiclePlate": "30H-123456",
      "packageName": "Basic Wash",
      "amount": 270000,
      "status": "CONFIRMED",
      "bookingDate": "2026-06-10",
      "createdAt": "2026-05-23T10:30:00Z"
    }
  ]
}
```

---

### 12.8 GET /admin/customers/{customerId}/wash-sessions

**Get customer's completed wash sessions**

**Query Parameters:**
- `page=1&limit=20`
- `dateFrom=2026-01-01T00:00:00Z` (optional)
- `dateTo=2026-12-31T23:59:59Z` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer wash sessions retrieved",
  "data": [
    {
      "sessionId": "81e6f022-c58f-42fe-8ae2-d1eb512bd8ad",
      "bookingId": "BK_20260523_001",
      "vehiclePlate": "30H-123456",
      "servicePackage": { "id": "pkg_001", "name": "Basic Wash" },
      "status": "COMPLETED",
      "bookingDate": "2026-06-10",
      "bookingTime": "14:00",
      "startedAt": "2026-06-10T07:15:00Z",
      "completedAt": "2026-06-10T07:45:00Z",
      "fee": { "amount": 270000, "currency": "VND" },
      "pointsAwarded": 27
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1,
    "hasMore": false
  }
}
```

Alias for compatibility: `GET /api/v1/admin/customers/{customerId}/wash-history`.

---

### 12.9 GET /admin/customers/{customerId}/point-transactions

**Get customer's loyalty point transactions**

**Query Parameters:**
- `page=1&limit=20`
- `type=EARN` (optional; valid values: `EARN`, `REDEEM`, `TIER_UPGRADE`, `ADJUST`, `EXPIRE`)
- `dateFrom=2026-01-01T00:00:00Z` (optional)
- `dateTo=2026-12-31T23:59:59Z` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer point transactions retrieved",
  "data": [
    {
      "transactionId": "7b4be8cf-bab0-4073-8922-166ff2cf64b1",
      "type": "EARN",
      "points": 27,
      "balanceAfter": 27,
      "reason": "Wash completed",
      "referenceId": "81e6f022-c58f-42fe-8ae2-d1eb512bd8ad",
      "createdAt": "2026-06-10T07:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasMore": false
  }
}
```

Alias for compatibility: `GET /api/v1/admin/customers/{customerId}/point-history`.

---

### 12.10 PUT /admin/customers/{customerId}/status

**Update customer status (block/suspend)**

**Request:**
```json
{
  "status": "BLOCKED",
  "reason": "Repeated cancellations"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Customer status updated",
  "data": {
    "customerId": "user_123",
    "status": "BLOCKED",
    "updatedAt": "2026-05-23T10:45:00Z"
  }
}
```

---

### 12.9 GET /admin/staff

**Get staff list**

**Query Parameters:**
- `page=1&limit=20`
- `status=ACTIVE` (optional)
- `department=WASHER` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Staff retrieved",
  "data": [
    {
      "staffId": "staff_123",
      "name": "Trần Văn B",
      "phone": "0912345678",
      "employeeId": "EMP_001",
      "status": "ACTIVE",
      "department": "WASHER",
      "currentLoad": 1,
      "capacity": 3,
      "availableSlots": 2,
      "hireDate": "2025-06-01"
    }
  ]
}
```

---

### 12.10 POST /admin/packages

**Create new package**

**Request:**
```json
{
  "name": "Basic Wash",
  "description": "Standard wash and dry",
  "basePrice": 150000,
  "duration": 30,
  "category": "BASIC",
  "features": ["Exterior wash", "Dry", "Vacuum interior"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Package created",
  "data": {
    "packageId": "pkg_001",
    "name": "Basic Wash",
    "basePrice": 150000,
    "status": "ACTIVE",
    "createdAt": "2026-05-23T10:30:00Z"
  }
}
```

---

### 12.11 POST /admin/promotions

**Create promotion**

**Request:**
```json
{
  "name": "Summer Sale",
  "description": "20% off all services",
  "discountType": "PERCENT",
  "discountValue": 20,
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-08-31T23:59:59Z",
  "targetingMode": "ALL_TIERS",
  "applicableTiers": null,
  "maxUsagePerCustomer": 1,
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Promotion created",
  "data": {
    "promotionId": "promo_001",
    "name": "Summer Sale",
    "description": "20% off all services",
    "discountType": "PERCENT",
    "discountValue": 20,
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-08-31T23:59:59Z",
    "targetingMode": "ALL_TIERS",
    "applicableTiers": ["MEMBER", "SILVER", "GOLD", "PLATINUM"],
    "maxUsagePerCustomer": 1,
    "status": "ACTIVE",
    "createdAt": "2026-05-23T10:30:00Z",
    "updatedAt": "2026-05-23T10:30:00Z"
  }
}
```

**Admin promotion endpoints:**
- `GET /api/v1/admin/promotions?page=1&limit=20` - List all promotions for admin.
- `GET /api/v1/admin/promotions/{promotionId}` - Get promotion by id.
- `PUT /api/v1/admin/promotions/{promotionId}` - Update promotion with the same request shape as create.
- `DELETE /api/v1/admin/promotions/{promotionId}` - Deactivate promotion by setting `status=INACTIVE`.

**Validation:**
- `startDate <= endDate`
- `discountType=PERCENT` requires `discountValue` between 1 and 100
- `targetingMode=SELECTED_TIERS` requires at least one `applicableTiers` value from `MEMBER`, `SILVER`, `GOLD`, `PLATINUM`

---

### 12.12 GET /admin/reports/{reportType}

**Generate business reports**

**Supported Report Types:**
- `booking_trends` - Booking volume and trends
- `promotion_effectiveness` - Promo usage and ROI
- `point_summaries` - Loyalty points issued/redeemed
- `no_show_metrics` - No-show analysis
- `revenue` - Revenue by package/method
- `customer_acquisition` - New customer trends

**Query Parameters:**
- `dateFrom=2026-01-01` (required)
- `dateTo=2026-12-31` (required)
- `groupBy=DAY,WEEK,MONTH` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Report generated",
  "data": {
    "reportType": "booking_trends",
    "dateRange": {
      "from": "2026-01-01",
      "to": "2026-12-31"
    },
    "dataPoints": [
      {
        "date": "2026-05-01",
        "totalBookings": 15,
        "completed": 14,
        "cancelled": 1,
        "noShow": 0,
        "revenue": 4050000
      }
    ]
  }
}
```

---

## 13. EPIC 9: Notification APIs

### 13.1 GET /customers/notifications

**Get customer's notifications**

**Query Parameters:**
- `page=1&limit=20`
- `type=REMINDER,CONFIRMATION` (optional)
- `read=false` (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notifications retrieved",
  "data": [
    {
      "notificationId": "notif_001",
      "type": "BOOKING_REMINDER",
      "title": "Booking Reminder",
      "content": "Your booking BK_20260523_001 is scheduled in 1 hour",
      "read": false,
      "createdAt": "2026-06-10T13:00:00Z",
      "actionUrl": "/customer/bookings/BK_20260523_001"
    },
    {
      "notificationId": "notif_002",
      "type": "POINTS_EXPIRY_WARNING",
      "title": "Points Expiring Soon",
      "content": "You have 300 points expiring in 7 days",
      "read": true,
      "createdAt": "2026-05-16T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### 13.2 PUT /customers/notifications/{notificationId}/read

**Mark notification as read**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notification marked as read",
  "data": {
    "notificationId": "notif_001",
    "read": true
  }
}
```

---

### 13.3 GET /customers/wash-tracking/active

**Get the customer's active wash tracking session**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Active wash tracking retrieved",
  "data": {
    "bookingId": "BK_20260523_001",
    "washSessionId": "WS_20260610_001",
    "status": "IN_PROGRESS",
    "startedAt": "2026-06-10T14:00:00Z",
    "estimatedFinishAt": "2026-06-10T15:00:00Z",
    "elapsedSeconds": 900,
    "estimatedDurationSeconds": 3600,
    "progressPercent": 25,
    "stage": "Foam wash"
  }
}
```

**Empty State (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "No active wash tracking",
  "data": null
}
```

---

### 13.4 GET /customers/wash-tracking/{washSessionId}

**Get a progress snapshot for one wash session**

**Response:** Same payload shape as `GET /customers/wash-tracking/active`.

---

## 14. WebSocket & Real-time Events

### 14.1 WebSocket Connection

**URL:** `wss://api.autowash.local/ws`

**Authentication:**
```
Connection Header: Authorization: Bearer {accessToken}
```

### 14.2 Events Subscribed by Client

**Operations Queue Updates:**
```json
{
  "event": "operations:queue:updated",
  "data": {
    "washSessions": [
      {
        "washSessionId": "WS_20260610_001",
        "status": "IN_PROGRESS",
        "timeRemaining": 15
      }
    ]
  }
}
```

**Booking Status Changes:**
```json
{
  "event": "booking:status:changed",
  "data": {
    "bookingId": "BK_20260523_001",
    "oldStatus": "CONFIRMED",
    "newStatus": "CHECKED_IN",
    "changedAt": "2026-06-10T14:00:00Z"
  }
}
```

**Real-time Notifications:**
```json
{
  "event": "notification:received",
  "data": {
    "notificationId": "notif_001",
    "type": "BOOKING_REMINDER",
    "content": "Your booking is in 1 hour",
    "createdAt": "2026-06-10T13:00:00Z"
  }
}
```

**Loyalty Points Update:**
```json
{
  "event": "loyalty:points:updated",
  "data": {
    "customerId": "user_123",
    "newBalance": 1250,
    "transaction": {
      "type": "EARN",
      "amount": 27
    }
  }
}
```

---

## 15. Data Validation Rules

### 15.1 Phone Number

- **Format:** Vietnamese phone (0XXXXXXXXX)
- **Length:** Exactly 10 digits
- **Starts with:** 0
- **Pattern:** `/^0[0-9]{9}$/`
- **Example:** 0901234567

### 15.2 Email

- **Format:** Valid email address
- **Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Example:** nguyenvana@example.com

### 15.3 Password

- **Min length:** 8 characters
- **Max length:** 128 characters
- **Requirements:**
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit
  - At least 1 special character (!@#$%^&*)
- **Example:** `SecurePassword123!`

### 15.4 License Plate

- **Format:** Vietnamese license plate
- **Pattern:** `[0-9]{2}[A-Z]{1}-[0-9]{6}` or similar variations
- **Example:** 30H-123456, 51B-456789

### 15.5 Vietnamese Address (optional)

- **Format:** Free text
- **Max length:** 255 characters
- **Required fields:** None (optional)

### 15.6 Currency & Pricing

- **Currency:** VND (Vietnamese Dong)
- **Min amount:** 0
- **Max amount:** 999,999,999 VND
- **Decimal places:** 0 (no cents)
- **Example:** 150000

### 15.7 Dates & Times

- **Format:** ISO 8601
- **Date:** `YYYY-MM-DD` (2026-05-23)
- **DateTime:** `YYYY-MM-DDTHH:mm:ssZ` (2026-05-23T10:30:00Z)
- **Time:** `HH:mm` (14:00)

---

## 16. Common DTOs & Enums

### 16.1 User Roles

```
enum UserRole {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
  GUEST = "GUEST"
}
```

### 16.2 User Status

```
enum UserStatus {
  PENDING = "PENDING",           // Profile incomplete
  PENDING_VERIFY = "PENDING_VERIFY", // Awaiting OTP verification
  ACTIVE = "ACTIVE",             // Verified and active
  INACTIVE = "INACTIVE",         // Inactive account
  SUSPENDED = "SUSPENDED",       // Temporary suspension
  BLOCKED = "BLOCKED",           // Admin blocked
  DELETED = "DELETED"            // Soft deleted
}
```

### 16.3 Loyalty Tiers

```
enum LoyaltyTier {
  MEMBER = "MEMBER",             // 0 - 1000 points
  SILVER = "SILVER",             // 1001 - 3000 points
  GOLD = "GOLD",                 // 3001 - 6000 points
  PLATINUM = "PLATINUM"          // 6001+ points
}
```

### 16.4 Booking Status

```
enum BookingStatus {
  PENDING = "PENDING",           // Awaiting payment
  CONFIRMED = "CONFIRMED",       // Paid, awaiting service
  CHECKED_IN = "CHECKED_IN",     // Customer arrived, checked in
  IN_PROGRESS = "IN_PROGRESS",   // Wash in progress
  COMPLETED = "COMPLETED",       // Service completed
  CANCELLED = "CANCELLED",       // Customer cancelled
  NO_SHOW = "NO_SHOW"            // Didn't show up
}
```

### 16.5 Wash Session Status

```
enum WashSessionStatus {
  PENDING = "PENDING",           // Created, awaiting check-in
  CHECKED_IN = "CHECKED_IN",     // Plate verified
  IN_PROGRESS = "IN_PROGRESS",   // Wash started
  COMPLETED = "COMPLETED",       // Wash finished
  CANCELLED = "CANCELLED"        // Session cancelled
}
```

### 16.6 Payment Methods

```
enum PaymentMethod {
  BANK_TRANSFER = "BANK_TRANSFER",
  E_WALLET = "E_WALLET",
  CASH_AT_COUNTER = "CASH_AT_COUNTER",
  CREDIT_CARD = "CREDIT_CARD"
}
```

### 16.7 Payment Status

```
enum PaymentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}
```

### 16.8 Discount Types

```
enum DiscountType {
  PERCENT = "PERCENT",           // Percentage discount (e.g., 20%)
  FIXED_AMOUNT = "FIXED_AMOUNT", // Fixed VND amount (e.g., 50,000 VND)
  FREE_SERVICE = "FREE_SERVICE"  // Free service
}
```

### 16.9 Vehicle Types

```
enum VehicleType {
  CAR = "CAR",
  SUV = "SUV",
  TRUCK = "TRUCK",
  MOTORBIKE = "MOTORBIKE",
  VAN = "VAN"
}
```

### 16.10 Point Transaction Types

```
enum PointTransactionType {
  EARN = "EARN",                           // Earned from booking
  REDEEMED_AT_CHECKOUT = "REDEEMED_AT_CHECKOUT",  // Used for discount
  REDEEMED_FOR_VOUCHER = "REDEEMED_FOR_VOUCHER",  // Converted to voucher
  EXPIRED = "EXPIRED",                     // Expired after 365 days
  ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT"   // Admin adjustment
}
```

### 16.11 Staff Status

```
enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE"
}
```

### 16.12 Language & Theme

```
enum Language {
  VI = "VI",  // Vietnamese
  EN = "EN"   // English
}

enum Theme {
  LIGHT = "LIGHT",
  DARK = "DARK"
}
```

---

## Appendix: Integration Checklist for Frontend Developer

- [ ] Implement JWT token storage and refresh logic
- [ ] Create error handling middleware with automatic token refresh
- [ ] Build responsive forms with real-time validation
- [ ] Implement optimistic updates for better UX
- [ ] Add loading states and error toasts
- [ ] Cache API responses appropriately
- [ ] Implement pagination for list views
- [ ] Setup WebSocket connection for real-time updates
- [ ] Create notification center with sound/badge
- [ ] Implement image upload for vehicles (optional)
- [ ] Setup deep linking for notifications
- [ ] Add analytics/tracking events
- [ ] Implement offline queue for critical operations
- [ ] Test with slow network conditions
- [ ] Setup password strength meter
- [ ] Implement biometric login (if mobile)

---

**End of API Contracts Document**

Version: 1.0  
Last Updated: May 23, 2026  
Maintainer: AutoWash Backend Team
