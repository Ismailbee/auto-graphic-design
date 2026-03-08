# Token Management & Plan Upgrade System Implementation

## CONTEXT
I want to implement a comprehensive token and subscription plan management system for my Vue 3 + Ionic application with Node.js backend. The system should display token counts and plan information in two locations:
1. **User Settings page** (when logged in) - Full token management dashboard
2. **Header of every page** - Compact token count indicator with icon

---

## 🎯 PART 1: FRONTEND REQUIREMENTS (Vue 3 + Ionic + TypeScript)

### A. Header Token Display Component

**File:** `src/components/HeaderTokenDisplay.vue`

**Requirements:**
- Display current token balance as a compact badge/chip in the page header
- Show token icon (💎 or custom SVG) next to the count
- Make it clickable - navigates to full TokensAndPlans page
- Update in real-time when tokens change (use Pinia store)
- Show loading skeleton while fetching initial data
- Position: Top-right corner of header, next to user profile/menu
- Responsive: Hide text on mobile, show only icon + count

**Example UI:**
```
Desktop: [💎 Icon] 1,250 tokens
Mobile: [💎] 1,250
```

---

### B. User Dashboard Page - TokensAndPlans.vue

**File:** `src/views/TokensAndPlans.vue`

**Page Structure (4 main sections):**

#### Section 1: Current Plan Display
- **Visual card** showing active plan tier with colored badge:
  - Basic: Gray badge with 🆓 icon
  - Premium: Gold badge with ⭐ icon  
  - Pro: Purple/Diamond badge with 💎 icon
- **Plan details:**
  - Plan name (large, bold)
  - Expiry date (for Premium/Pro only, format: "Expires on DD MMM YYYY")
  - Days remaining counter (e.g., "23 days left")
- **Action button:**
  - If Basic: "Upgrade Plan" (primary button, prominent)
  - If Premium: "Upgrade to Pro" (secondary button)
  - If Pro: "Current Plan" (disabled button)

#### Section 2: Token Balance Dashboard
- **Large token count display:**
  - Main number: Font size 48px, bold
  - Token icon (💎) next to number
  - Label: "Available Tokens"
- **Usage statistics:**
  - Total designs generated (counter with animation)
  - Tokens used this month (with progress bar)
  - Average tokens per design
- **Visual progress indicator:**
  - Circular progress chart OR horizontal bar
  - Show percentage of tokens used vs remaining
- **"Buy More Tokens" button** (large, primary color)

#### Section 3: Token Purchase Options
**Layout:** Responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)

**Token packages (6 buttons):**
1. ₦100 → 100 tokens
2. ₦200 → 200 tokens  
3. ₦300 → 300 tokens
4. ₦500 → 500 tokens
5. ₦1,000 → 1,000 tokens
6. ₦1,200 → 1,200 tokens ⭐ **"Best Value" badge**

**Each button must display:**
- Naira amount (top, large font)
- Token count (middle, with icon)
- "Best Value" badge (only for ₦1,200 option)
- Hover effect: Scale up slightly, show shadow

**On click behavior:**
1. Show loading spinner on clicked button
2. Call `POST /api/payments/initialize` with token purchase data
3. Open Paystack payment popup with returned authorization URL
4. Handle payment callbacks (success/cancel/error)

#### Section 4: Plan Upgrade Cards
**Layout:** 3 cards side-by-side (responsive: stack on mobile)

**Card 1: Basic Plan (Free)**
- Title: "Basic Plan"
- Icon: 🆓
- Price: "Free Forever"
- Features list:
  - ✓ Pay-per-design model
  - ✓ No monthly commitment
  - ✗ No free tokens
  - ✗ Standard support
- Button: 
  - If current plan: "Current Plan" (disabled, gray)
  - If on higher tier: "Downgrade" (secondary, with confirmation modal)

**Card 2: Premium Plan**
- Title: "Premium Plan"
- Icon: ⭐
- Price: "₦2,500 / 2 months"
- Paystack Plan ID: `PLN_5x6n9kfpr8z34lu`
- Features list:
  - ✓ 1,000 free tokens on signup
  - ✓ Priority email support
  - ✓ Early access to new features
  - ✓ No ads
- Button: "Upgrade to Premium" (primary color)
- Badge: "Most Popular" (if applicable)

**Card 3: Pro Plan**
- Title: "Pro Plan"
- Icon: 💎
- Price: "₦5,000 / 2 months"
- Paystack Plan ID: `PLN_31ofmv6h9jplglk`
- Features list:
  - ✓ 1,500 free tokens on signup
  - ✓ Unlimited designs
  - ✓ Priority 24/7 support
  - ✓ Advanced AI features
  - ✓ Custom branding options
- Button: "Upgrade to Pro" (premium color, gradient)
- Badge: "Best Value" (prominent)

**Upgrade flow:**
1. User clicks upgrade button
2. Show confirmation modal with:
   - Plan comparison table
   - What they'll get immediately (free tokens)
   - Billing cycle (2 months)
   - Total amount
   - "Confirm Upgrade" and "Cancel" buttons
3. On confirm, call `POST /api/payments/initialize` with plan data including `planId`
4. Open Paystack popup
5. Handle success/failure

#### Section 5: Payment History Table
**File:** `src/components/PaymentHistory.vue`

**Table columns:**
1. Date (format: "DD MMM YYYY, HH:mm")
2. Type (badge: "Token Purchase" or "Plan Upgrade")
3. Description (e.g., "500 tokens" or "Premium Plan")
4. Amount (₦X,XXX)
5. Status (colored badge: Success/Pending/Failed)
6. Reference (Paystack reference, copyable)

**Features:**
- Pagination: 10 items per page
- Filters:
  - Type dropdown: All / Token Purchase / Plan Upgrade
  - Date range picker: Last 7 days / Last 30 days / Last 90 days / Custom
- Sort by: Date (newest first by default)
- Empty state: "No transactions yet" with illustration
- Loading state: Skeleton rows

---

### C. Paystack Integration (Frontend)

**File:** `src/services/payment.service.ts`

**Library:** Use `@paystack/inline-js` (install: `npm install @paystack/inline-js`)

**Payment initialization function:**

```typescript
interface PaymentConfig {
  email: string;
  amount: number; // In kobo (Naira × 100)
  reference: string;
  metadata: {
    userId: string;
    type: 'token_purchase' | 'plan_upgrade';
    tokens?: number;
    plan?: 'Premium' | 'Pro';
    planId?: string;
  };
  onSuccess: (response: any) => void;
  onCancel: () => void;
}
```

**Token purchase metadata example:**
```json
{
  "userId": "user_123",
  "type": "token_purchase",
  "tokens": 500
}
```

**Premium upgrade metadata example:**
```json
{
  "userId": "user_123",
  "type": "plan_upgrade",
  "plan": "Premium",
  "planId": "PLN_5x6n9kfpr8z34lu"
}
```

**Pro upgrade metadata example:**
```json
{
  "userId": "user_123",
  "type": "plan_upgrade",
  "plan": "Pro",
  "planId": "PLN_31ofmv6h9jplglk"
}
```

**Reference generation:**
- Token purchase: `TKN_${userId}_${timestamp}`
- Plan upgrade: `PLN_${userId}_${timestamp}`

**Success callback behavior:**
1. Show success toast: "Payment successful! Your tokens/plan will be updated shortly."
2. Optimistically update UI (add tokens or change plan badge)
3. Call `GET /api/payments/verify/:reference` to confirm
4. Refresh user data from `GET /api/users/:userId`
5. If verification fails, revert optimistic update and show error

**Cancel callback behavior:**
1. Show info toast: "Payment cancelled. No charges were made."
2. Re-enable purchase buttons

---

### D. State Management (Pinia Store)

**File:** `src/stores/user.store.ts`

**State:**
```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    plan: 'Basic' | 'Premium' | 'Pro';
    planExpiryDate: Date | null;
    tokens: number;
    totalDesignsGenerated: number;
  } | null;
  loading: boolean;
  error: string | null;
}
```

**Actions:**
- `fetchUser()` - Load user data
- `updateTokens(amount: number)` - Optimistically update token count
- `deductTokens(amount: number)` - Called when design is generated
- `upgradePlan(plan: string, expiryDate: Date, freeTokens: number)` - Update plan

**Getters:**
- `hasTokens` - Boolean, true if tokens > 0
- `isPremium` - Boolean
- `isPro` - Boolean
- `daysUntilExpiry` - Number of days until plan expires

---

### E. UI/UX Requirements

**Component Library:** Ionic Vue components
- `<ion-card>` for plan cards and sections
- `<ion-button>` for all action buttons
- `<ion-badge>` for plan tiers and status indicators
- `<ion-grid>`, `<ion-row>`, `<ion-col>` for responsive layouts
- `<ion-list>`, `<ion-item>` for payment history
- `<ion-modal>` for confirmation dialogs
- `<ion-loading>` for async operations
- `<ion-toast>` for notifications
- `<ion-skeleton-text>` for loading states

**Styling:** Tailwind CSS for custom styles
- Use Ionic CSS variables for theming
- Implement dark mode support
- Mobile-first responsive design

**Animations:**
- Vue `<Transition>` for page/component transitions
- Number counter animation for token balance (use `vue3-autocounter` or similar)
- Smooth fade-in for loaded content
- Button ripple effects (Ionic default)

**Loading States:**
- Skeleton screens for initial page load
- Spinner on buttons during payment processing
- Disabled state for buttons during async operations
- Progress bar for long operations

**Error Handling:**
- User-friendly error messages (no technical jargon)
- Retry buttons for failed operations
- Fallback UI for missing data
- Network error detection with offline indicator

**Real-time Updates:**
- WebSocket connection for token balance updates (optional, can use polling)
- OR: Poll `GET /api/users/:userId` every 30 seconds when page is active
- Update header token display immediately when balance changes

---

## 🔧 PART 2: BACKEND REQUIREMENTS (Node.js + Express + TypeScript)

### A. Database Schema

**Users Collection/Table:**
```typescript
interface User {
  id: string;                          // UUID or Firebase UID
  name: string;
  email: string;                       // Unique, indexed
  plan: 'Basic' | 'Premium' | 'Pro';
  planExpiryDate: Date | null;         // Null for Basic plan
  tokens: number;                      // Current token balance
  totalDesignsGenerated: number;       // Lifetime counter
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
- `email` (unique)
- `planExpiryDate` (for expiry cron job)

**Payments Collection/Table:**
```typescript
interface Payment {
  id: string;                          // UUID
  userId: string;                      // Foreign key to Users
  amount: number;                      // Amount in Naira (not kobo)
  type: 'token_purchase' | 'plan_upgrade';
  reference: string;                   // Paystack reference (unique, indexed)
  status: 'pending' | 'success' | 'failed';
  tokens: number | null;               // Number of tokens purchased (null for plan upgrades)
  plan: 'Premium' | 'Pro' | null;      // Plan upgraded to (null for token purchases)
  planId: string | null;               // Paystack Plan ID (e.g., PLN_5x6n9kfpr8z34lu)
  metadata: object;                    // Full Paystack metadata
  createdAt: Date;
  verifiedAt: Date | null;             // When payment was verified
}
```

**Indexes:**
- `userId` (for user payment history queries)
- `reference` (unique, for webhook lookups)
- `status` (for admin queries)

---

### B. API Endpoints

#### User Endpoints

**1. GET /api/users/:userId**
- **Auth:** Required (JWT or Firebase Auth)
- **Authorization:** User can only access their own data OR admin can access any
- **Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "Premium",
  "planExpiryDate": "2025-12-25T00:00:00Z",
  "tokens": 1250,
  "totalDesignsGenerated": 45
}
```
- **Error cases:**
  - 401: Unauthorized (no auth token)
  - 403: Forbidden (accessing another user's data)
  - 404: User not found

**2. PATCH /api/users/:userId/tokens**
- **Auth:** Required
- **Purpose:** Deduct tokens when a design is generated
- **Request body:**
```json
{
  "deduct": 10
}
```
- **Response:**
```json
{
  "tokens": 1240,
  "totalDesignsGenerated": 46
}
```
- **Error cases:**
  - 400: Insufficient tokens
  - 400: Invalid deduct amount (must be positive integer)

**3. GET /api/users/:userId/payments**
- **Auth:** Required
- **Query params:**
  - `page` (default: 1)
  - `limit` (default: 10, max: 50)
  - `type` (optional: 'token_purchase' | 'plan_upgrade')
  - `startDate` (optional: ISO date string)
  - `endDate` (optional: ISO date string)
- **Response:**
```json
{
  "payments": [
    {
      "id": "pay_123",
      "amount": 500,
      "type": "token_purchase",
      "tokens": 500,
      "status": "success",
      "reference": "TKN_user123_1234567890",
      "createdAt": "2025-10-20T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Payment Endpoints

**4. POST /api/payments/initialize**
- **Auth:** Required
- **Purpose:** Initialize Paystack payment and create pending payment record
- **Request body (token purchase):**
```json
{
  "userId": "user_123",
  "amount": 500,
  "type": "token_purchase",
  "tokens": 500
}
```
- **Request body (plan upgrade):**
```json
{
  "userId": "user_123",
  "amount": 2500,
  "type": "plan_upgrade",
  "plan": "Premium",
  "planId": "PLN_5x6n9kfpr8z34lu"
}
```
- **Backend logic:**
  1. Validate request body (use Zod schema)
  2. Generate unique reference
  3. Create pending payment record in database
  4. Call Paystack Initialize Transaction API
  5. Return authorization URL and reference
- **Response:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "TKN_user123_1234567890",
  "accessCode": "abc123xyz"
}
```
- **Error cases:**
  - 400: Invalid request body
  - 400: Invalid plan ID
  - 500: Paystack API error

**5. POST /api/payments/webhook**
- **Auth:** None (public endpoint, but verify Paystack signature)
- **Purpose:** Handle Paystack webhook events
- **Security:** Verify `x-paystack-signature` header
- **Webhook verification code:**
```typescript
const crypto = require('crypto');
const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
  
if (hash !== req.headers['x-paystack-signature']) {
  return res.status(400).send('Invalid signature');
}
```
- **Event handling:**
  - Only process `charge.success` events
  - Extract `data.reference` from webhook payload
  - Find payment record by reference
  - If payment already processed (status = 'success'), return 200 (idempotency)
  - Update payment status to 'success'
  - Set `verifiedAt` timestamp
  - **If token purchase:**
    - Add `payment.tokens` to user's token balance
  - **If plan upgrade:**
    - Update user's plan to `payment.plan`
    - Set `planExpiryDate` to current date + 2 months
    - Add free tokens based on plan:
      - Premium (PLN_5x6n9kfpr8z34lu): 1,000 tokens
      - Pro (PLN_31ofmv6h9jplglk): 1,500 tokens
  - Send confirmation email to user (optional)
- **Response:** Always return 200 OK to Paystack
- **Error handling:** Log errors but still return 200 to prevent webhook retries

**6. GET /api/payments/verify/:reference**
- **Auth:** Required
- **Purpose:** Manually verify payment status (called by frontend after payment)
- **Backend logic:**
  1. Find payment by reference
  2. If already verified, return current status
  3. Call Paystack Verify Transaction API
  4. Update payment status based on Paystack response
  5. Process payment (same logic as webhook)
- **Response:**
```json
{
  "status": "success",
  "amount": 500,
  "type": "token_purchase",
  "tokens": 500,
  "verifiedAt": "2025-10-20T10:35:00Z"
}
```

#### Admin Endpoints

**7. GET /api/admin/users**
- **Auth:** Required (admin role only)
- **Query params:** `page`, `limit`, `plan`, `search`
- **Response:** Paginated list of all users

**8. GET /api/admin/payments**
- **Auth:** Required (admin role only)
- **Query params:** `page`, `limit`, `status`, `type`, `startDate`, `endDate`
- **Response:** Paginated list of all payments

**9. GET /api/admin/analytics**
- **Auth:** Required (admin role only)
- **Response:**
```json
{
  "totalUsers": 1250,
  "totalRevenue": 125000,
  "planDistribution": {
    "Basic": 800,
    "Premium": 350,
    "Pro": 100
  },
  "revenueByMonth": [...]
}
```

---

### C. Business Logic

#### Token Purchase Flow
1. User clicks token button (e.g., ₦500 → 500 tokens)
2. Frontend calls `POST /api/payments/initialize`:
   ```json
   {
     "userId": "user_123",
     "amount": 500,
     "type": "token_purchase",
     "tokens": 500
   }
   ```
3. Backend:
   - Generates reference: `TKN_user123_1698765432`
   - Creates pending payment record
   - Calls Paystack Initialize API with:
     - `email`: user's email
     - `amount`: 50000 (₦500 × 100 kobo)
     - `reference`: `TKN_user123_1698765432`
     - `metadata`: `{ userId, type, tokens }`
   - Returns authorization URL
4. Frontend opens Paystack popup with authorization URL
5. User completes payment on Paystack
6. Paystack sends webhook to `POST /api/payments/webhook`
7. Backend:
   - Verifies webhook signature
   - Finds payment by reference
   - Updates status to 'success'
   - Adds 500 tokens to user balance
   - Sets `verifiedAt` timestamp
8. Frontend receives success callback
9. Frontend calls `GET /api/payments/verify/:reference` to confirm
10. Frontend updates UI with new token balance

#### Plan Upgrade Flow
1. User clicks "Upgrade to Premium" button
2. Frontend shows confirmation modal:
   - "Upgrade to Premium Plan?"
   - "You'll get 1,000 free tokens immediately"
   - "Billing: ₦2,500 every 2 months"
   - "Confirm" / "Cancel"
3. User clicks "Confirm"
4. Frontend calls `POST /api/payments/initialize`:
   ```json
   {
     "userId": "user_123",
     "amount": 2500,
     "type": "plan_upgrade",
     "plan": "Premium",
     "planId": "PLN_5x6n9kfpr8z34lu"
   }
   ```
5. Backend:
   - Generates reference: `PLN_user123_1698765432`
   - Creates pending payment record (stores `planId`)
   - Calls Paystack Initialize API
   - Returns authorization URL
6. User completes payment
7. Paystack webhook triggers
8. Backend:
   - Verifies signature
   - Finds payment by reference
   - Updates payment status
   - Updates user:
     - `plan`: "Premium"
     - `planExpiryDate`: current date + 2 months
     - `tokens`: current + 1,000 (free tokens)
9. Frontend updates UI:
   - Plan badge changes to Premium ⭐
   - Token balance increases by 1,000
   - Shows success message: "Welcome to Premium! 1,000 tokens added."

#### Design Generation Flow
1. User generates a design (assume it costs 10 tokens)
2. Frontend calls `PATCH /api/users/:userId/tokens`:
   ```json
   { "deduct": 10 }
   ```
3. Backend:
   - Checks if `user.tokens >= 10`
   - If yes:
     - Deducts 10 tokens: `user.tokens -= 10`
     - Increments counter: `user.totalDesignsGenerated += 1`
     - Saves user
     - Returns updated balance
   - If no:
     - Returns 400 error: "Insufficient tokens"
4. Frontend:
   - If success: Updates token display, proceeds with design generation
   - If error: Shows modal: "You need more tokens. Buy now?"

#### Plan Expiry Handling
**Cron job (runs daily at 00:00 UTC):**

**File:** `src/jobs/plan-expiry.job.ts`

**Logic:**
1. Query users where `planExpiryDate < now()` AND `plan != 'Basic'`
2. For each expired user:
   - Update `plan` to 'Basic'
   - Set `planExpiryDate` to null
   - Send email: "Your [Premium/Pro] plan has expired. Upgrade to continue enjoying benefits."
3. Log results: "Downgraded X users due to plan expiry"

**Implementation:** Use `node-cron` or cloud scheduler (AWS EventBridge, Google Cloud Scheduler)

---

### D. Paystack Integration (Backend)

**Library:** `npm install axios` (use Paystack REST API directly)

**Environment Variables (.env):**
```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**File:** `src/services/paystack.service.ts`

**Functions:**

1. **initializeTransaction()**
   - Endpoint: `POST https://api.paystack.co/transaction/initialize`
   - Headers: `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`
   - Body:
   ```json
   {
     "email": "user@example.com",
     "amount": 50000,
     "reference": "TKN_user123_1234567890",
     "metadata": {
       "userId": "user_123",
       "type": "token_purchase",
       "tokens": 500
     },
     "callback_url": "https://yourapp.com/payment/callback"
   }
   ```
   - Returns: `{ authorization_url, access_code, reference }`

2. **verifyTransaction(reference)**
   - Endpoint: `GET https://api.paystack.co/transaction/verify/${reference}`
   - Headers: `Authorization: Bearer ${PAYSTACK_SECRET_KEY}`
   - Returns: `{ status, amount, metadata, ... }`

3. **verifyWebhookSignature(payload, signature)**
   - Use crypto.createHmac to verify signature
   - Return boolean

**Plan ID Mapping:**
```typescript
const PLAN_CONFIG = {
  'PLN_5x6n9kfpr8z34lu': {
    name: 'Premium',
    freeTokens: 1000,
    durationMonths: 2
  },
  'PLN_31ofmv6h9jplglk': {
    name: 'Pro',
    freeTokens: 1500,
    durationMonths: 2
  }
};
```

---

### E. Security & Validation

**Input Validation (use Zod):**

**File:** `src/validators/payment.validator.ts`

```typescript
import { z } from 'zod';

export const initializePaymentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().int(),
  type: z.enum(['token_purchase', 'plan_upgrade']),
  tokens: z.number().positive().int().optional(),
  plan: z.enum(['Premium', 'Pro']).optional(),
  planId: z.string().optional()
}).refine(data => {
  if (data.type === 'token_purchase') {
    return data.tokens !== undefined;
  }
  if (data.type === 'plan_upgrade') {
    return data.plan !== undefined && data.planId !== undefined;
  }
  return true;
}, {
  message: "Invalid payment data for type"
});
```

**Authentication Middleware:**

**File:** `src/middleware/auth.middleware.ts`

- Verify JWT token or Firebase Auth token
- Attach `req.user` with user ID and role
- Return 401 if invalid/missing token

**Admin Middleware:**

**File:** `src/middleware/admin.middleware.ts`

- Check if `req.user.role === 'admin'`
- Return 403 if not admin

**Rate Limiting:**

**File:** `src/middleware/rate-limit.middleware.ts`

- Use `express-rate-limit`
- Payment endpoints: 10 requests per minute per IP
- Webhook endpoint: No rate limit (Paystack needs to retry)

**Idempotency (Webhook):**
- Check if payment with reference already has status 'success'
- If yes, return 200 immediately without processing
- Prevents duplicate token additions if webhook is retried

**Audit Logging:**
- Log all payment transactions to separate log file
- Include: timestamp, userId, amount, type, status, reference
- Use Winston or Pino for structured logging

---

## 📦 DELIVERABLES

### Frontend Files (Vue 3 + Ionic + TypeScript)

1. **src/components/HeaderTokenDisplay.vue**
   - Compact token display for page header
   - Real-time updates from Pinia store
   - Clickable, navigates to TokensAndPlans page

2. **src/views/TokensAndPlans.vue**
   - Main dashboard page with all 5 sections
   - Responsive layout
   - Integrates all child components

3. **src/components/PlanCard.vue**
   - Reusable plan card component
   - Props: plan name, price, features, planId, isActive
   - Emits: upgrade event

4. **src/components/TokenButton.vue**
   - Reusable token purchase button
   - Props: amount (Naira), tokens, isBestValue
   - Emits: purchase event
   - Loading state

5. **src/components/PaymentHistory.vue**
   - Payment history table with pagination
   - Filters and sorting
   - Empty and loading states

6. **src/services/payment.service.ts**
   - `initializePayment(config)` - Calls backend and opens Paystack popup
   - `verifyPayment(reference)` - Verifies payment status
   - `getPaymentHistory(userId, filters)` - Fetches payment history

7. **src/services/user.service.ts**
   - `getUser(userId)` - Fetch user data
   - `updateTokens(userId, amount)` - Update token balance
   - `deductTokens(userId, amount)` - Deduct tokens

8. **src/types/payment.types.ts**
   - TypeScript interfaces for Payment, User, PaymentConfig, etc.

9. **src/stores/user.store.ts**
   - Pinia store for user state management
   - Actions, getters, state

10. **src/router/index.ts**
    - Add route: `/tokens-and-plans` → TokensAndPlans.vue
    - Require authentication

### Backend Files (Node.js + Express + TypeScript)

1. **src/routes/users.routes.ts**
   - GET /api/users/:userId
   - PATCH /api/users/:userId/tokens
   - GET /api/users/:userId/payments

2. **src/routes/payments.routes.ts**
   - POST /api/payments/initialize
   - POST /api/payments/webhook
   - GET /api/payments/verify/:reference

3. **src/routes/admin.routes.ts**
   - GET /api/admin/users
   - GET /api/admin/payments
   - GET /api/admin/analytics

4. **src/controllers/payments.controller.ts**
   - Controller functions for all payment routes
   - Business logic for payment processing

5. **src/services/paystack.service.ts**
   - Paystack API integration
   - initializeTransaction, verifyTransaction, verifyWebhookSignature

6. **src/middleware/auth.middleware.ts**
   - JWT/Firebase Auth verification

7. **src/middleware/admin.middleware.ts**
   - Admin role check

8. **src/middleware/rate-limit.middleware.ts**
   - Rate limiting configuration

9. **src/models/User.model.ts**
   - User schema/model (Mongoose/Sequelize/Prisma)

10. **src/models/Payment.model.ts**
    - Payment schema/model

11. **src/validators/payment.validator.ts**
    - Zod schemas for request validation

12. **src/utils/webhook-validator.ts**
    - Webhook signature verification utility

13. **src/jobs/plan-expiry.job.ts**
    - Cron job for plan expiry handling

14. **.env.example**
    ```
    PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
    PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
    PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
    DATABASE_URL=mongodb://localhost:27017/myapp
    JWT_SECRET=your_jwt_secret
    ```

15. **README.md**
    - Setup instructions
    - Environment variables
    - API documentation
    - Paystack plan IDs reference
    - Testing guide

16. **postman_collection.json** (optional)
    - API examples for all endpoints
    - Include sample requests for token purchase and plan upgrades

---

## ✅ TESTING REQUIREMENTS

### Paystack Test Mode
- Use test keys: `sk_test_...` and `pk_test_...`
- Test card: 4084 0840 8408 4081 (success)
- Test card: 4084 0840 8408 4084 (declined)

### Test Cases

**Frontend:**
1. Header token display updates when balance changes
2. Token purchase flow (success, failure, cancellation)
3. Plan upgrade flow with confirmation modal
4. Payment history pagination and filters
5. Responsive design on mobile/tablet/desktop
6. Loading states and error handling
7. Real-time token updates

**Backend:**
1. Payment initialization creates pending record
2. Webhook signature verification rejects invalid signatures
3. Webhook processes token purchase correctly
4. Webhook processes plan upgrade correctly (adds free tokens, sets expiry)
5. Idempotency: duplicate webhook doesn't double-add tokens
6. Token deduction fails when insufficient balance
7. Plan expiry cron job downgrades expired users
8. Admin endpoints require admin role
9. Rate limiting blocks excessive requests

**Integration:**
1. End-to-end token purchase flow
2. End-to-end plan upgrade flow
3. Verify payment after Paystack callback
4. Test with Paystack test events (use Paystack dashboard to send test webhooks)

---

## 🎨 DESIGN PREFERENCES

### Color Scheme
- **Basic Plan:** Gray (#6B7280)
- **Premium Plan:** Gold (#F59E0B)
- **Pro Plan:** Purple/Diamond (#8B5CF6)
- **Success:** Green (#10B981)
- **Error:** Red (#EF4444)
- **Warning:** Yellow (#F59E0B)

### Icons
- Basic: 🆓
- Premium: ⭐
- Pro: 💎
- Tokens: 💎 or custom SVG

### Typography
- Headings: Bold, large (24-32px)
- Body: Regular, readable (14-16px)
- Numbers (token count): Extra bold, large (48px for main display)

### Spacing
- Use Ionic's default spacing scale
- Consistent padding/margin (16px, 24px, 32px)

### Buttons
- Primary: Solid color, white text
- Secondary: Outline, colored border
- Disabled: Gray, low opacity
- Loading: Spinner inside button, disabled state

### Animations
- Page transitions: Fade + slide (300ms)
- Number counter: Count up animation (1000ms)
- Button hover: Scale 1.05, shadow
- Success feedback: Confetti or checkmark animation

### Responsive Breakpoints
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

---

## 📝 ADDITIONAL NOTES

### Code Quality
- **TypeScript:** Strict mode enabled, no `any` types
- **Vue 3:** Composition API with `<script setup>`
- **Pinia:** For state management (not Vuex)
- **ESLint + Prettier:** Consistent code formatting
- **Comments:** Document complex logic, especially payment flows
- **Error boundaries:** Catch and display errors gracefully

### Production Readiness
- Environment-based configuration (dev/staging/prod)
- Proper error logging (Winston/Pino)
- Database indexes for performance
- API response caching where appropriate
- Security headers (Helmet.js)
- CORS configuration
- HTTPS enforcement in production

### Documentation
- Inline code comments for complex logic
- README with setup instructions
- API documentation (Swagger/OpenAPI optional)
- Paystack plan IDs clearly documented
- Environment variables explained

### Modularity
- Separate concerns (routes, controllers, services, models)
- Reusable components (PlanCard, TokenButton)
- DRY principle (don't repeat yourself)
- Single responsibility principle

---

## 🎯 CRITICAL REQUIREMENTS SUMMARY

1. **Header token display** must be visible on ALL pages when logged in
2. **Plan IDs** must be correctly mapped:
   - Premium: `PLN_5x6n9kfpr8z34lu` → 1,000 free tokens
   - Pro: `PLN_31ofmv6h9jplglk` → 1,500 free tokens
3. **Webhook idempotency** is critical to prevent duplicate token additions
4. **Plan expiry** must be handled automatically with cron job
5. **Token deduction** must check balance before allowing design generation
6. **Payment verification** must happen both via webhook AND manual verify endpoint
7. **Security:** Webhook signature verification is mandatory
8. **UX:** Show loading states, error messages, and success feedback
9. **Responsive:** Must work perfectly on mobile, tablet, and desktop
10. **TypeScript:** All code must be properly typed

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Core Functionality)
1. Backend: User and Payment models
2. Backend: Payment initialization and webhook endpoints
3. Frontend: TokensAndPlans page with token purchase
4. Frontend: Paystack integration
5. Testing: Token purchase flow end-to-end

### Phase 2 (Plan Upgrades)
1. Backend: Plan upgrade logic in webhook
2. Frontend: Plan cards and upgrade flow
3. Frontend: Confirmation modals
4. Testing: Plan upgrade flow end-to-end

### Phase 3 (Polish)
1. Frontend: Header token display
2. Frontend: Payment history table
3. Backend: Plan expiry cron job
4. Backend: Admin endpoints
5. Testing: All edge cases and error scenarios

### Phase 4 (Production)
1. Switch to Paystack live keys
2. Security audit
3. Performance testing
4. Deploy to production
5. Monitor webhook logs