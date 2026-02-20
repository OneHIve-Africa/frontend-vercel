# One Hive API Documentation

Base URL prefix: `/api/`

This document enumerates all API endpoints discovered from the Django URL configurations and views in this codebase. It includes request methods, permissions, request/response schemas, and purpose. Many endpoints use Django REST Framework (DRF) viewsets and serializers; where applicable, fields are listed from serializers.

Authentication uses JWT (SimpleJWT). Registration and login endpoints return `access` and `refresh` tokens.

Note: For schema examples, see drf-yasg live docs exposed at:
- `/swagger/` (Swagger UI)
- `/redoc/` (ReDoc)

---

## Resources

Base: `/api/resources/`

- GET `/api/resources/`
  - Purpose: List resources.
  - Permissions: IsAuthenticated. Admins see all; Farmers see only resources where `accessed_by` contains `"Farmers"`; Investors: `"Investors"`.
  - Response 200: `ResourceSerializer` (many) with fields:
    - `id`, `title`, `desc`, `accessed_by` (array of strings: `Admins|Farmers|Investors`), `created_by_email`, `public_url`, `viewed`, `created_at`, `updated_at`
  - Source: `resources/views.py: ResourceViewSet.list`

- POST `/api/resources/`
  - Purpose: Create a resource.
  - Permissions: IsAuthenticated + Admin only (enforced in `perform_create`).
  - Request: `ResourceSerializer` (server sets `created_by_email` from current user). `accessed_by` must be a non-empty array containing any of `Admins|Farmers|Investors`.
  - Response 201: `ResourceSerializer`
  - Source: `resources/views.py: ResourceViewSet.create`

- GET `/api/resources/{id}/`
  - Purpose: Retrieve a resource. Increments the `viewed` counter.
  - Permissions: IsAuthenticated. Admins any; Farmers/Investors only if their role is contained in `accessed_by`.
  - Response 200: `ResourceSerializer`
  - Source: `resources/views.py: ResourceViewSet.retrieve`

- PUT/PATCH `/api/resources/{id}/`
  - Purpose: Update a resource.
  - Permissions: IsAuthenticated + Admin only (enforced in `perform_update`).
  - Request: `ResourceSerializer`
  - Response 200: `ResourceSerializer`

- DELETE `/api/resources/{id}/`
  - Purpose: Delete a resource.
  - Permissions: IsAuthenticated + Admin only (enforced in `perform_destroy`).
  - Response 204: No content

- PUT `/api/resources/{id}/view/`
  - Purpose: Increment the `viewed` counter without fetching full details flow.
  - Permissions: IsAuthenticated. Same access rules as retrieve.
  - Response 200: `ResourceSerializer`

---

## Feedback

Base: `/api/feedback/`

- POST `/api/feedback/`
  - Purpose: Investors and Farmers submit feedback. Request body contains only the message.
  - Permissions: IsAuthenticated (must be Investor or Farmer)
  - Request: `{ "message": "your feedback text" }`
  - Response 201: `FeedbackOutputSerializer` with fields:
    - `id` (int)
    - `message` (string)
    - `created_at` (datetime)
    - `sender_email` (string)
    - `sender_type` (string: `investor|farmer|admin|user`)
  - Source: `feedback/views.py: FeedbackCreateView.post`

- GET `/api/feedback/admin/`
  - Purpose: Admin lists all feedback with sender info and timestamps.
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Response 200: `FeedbackOutputSerializer` (many)
  - Source: `feedback/views.py: AdminFeedbackListView.get`

---

## Core

Base: `/api/`

- GET `/api/health/`
  - Purpose: Health check.
  - Permissions: AllowAny
  - Response: `{ "status": "ok" }`
  - Source: `core/urls.py` -> `HealthCheckView.get()`

---

## Authentication

Base: `/api/auth/`

- POST `/api/auth/register/`
  - Purpose: Create a user and associated profile (investor by default; supports farmer, admin).
  - Permissions: AllowAny
  - Request (serializer `UserRegistrationSerializer`):
    - `email` (string, required)
    - `password` (string, required)
    - `first_name` (string, required)
    - `last_name` (string, required)
    - `primary_phone` (string, optional)
    - `other_phone` (string, optional)
    - `location` (string, optional)
    - `role` (choice: `investor|farmer|admin`, default `investor`)
  - Response 201: `{ refresh, access, email, role, profile }`
  - Source: `authentication/views.py: RegisterView`

- POST `/api/auth/login/`
  - Purpose: Authenticate and return JWT tokens and user profile.
  - Permissions: AllowAny
  - Request: `email`, `password`
  - Response 200: `{ refresh, access, email, role, profile }`
  - Source: `authentication/views.py: LoginView`

- POST `/api/auth/logout/`
  - Purpose: Blacklist a refresh token.
  - Permissions: AllowAny (note: could be hardened to IsAuthenticated)
  - Request: `{ refresh }`
  - Response 205: `{ "message": "Logout successful" }`
  - Source: `authentication/views.py: LogoutView`

- POST `/api/auth/password-reset/`
  - Purpose: Initiate password reset; generates OTP and emails link.
  - Permissions: AllowAny
  - Request: `{ email }`
  - Response 200: `{ "message": "Password reset email sent" }`
  - Source: `authentication/views.py: PasswordResetRequestView`

- POST `/api/auth/password-reset/verify-otp/`
  - Purpose: Verify OTP for password reset.
  - Permissions: AllowAny
  - Request: `{ email, otp }`
  - Response 200: `{ "message": "OTP verified successfully" }`
  - Source: `authentication/views.py: VerifyOTPView`

- POST `/api/auth/password-reset/set-new-password/`
  - Purpose: Set a new password after OTP verification.
  - Permissions: AllowAny
  - Request: `{ email, password, password_confirm }`
  - Response 200: `{ "message": "Password has been reset successfully" }`
  - Source: `authentication/views.py: SetNewPasswordView`

- PUT `/api/auth/change-password/`
  - Purpose: Change password for authenticated user.
  - Permissions: IsAuthenticated
  - Request: `{ old_password, new_password, new_password2 }`
  - Response 200: `{ status: "success", code: 200, message: "Password updated successfully" }`
  - Source: `authentication/views.py: ChangePasswordView`

---

## Investor Profile

Base: `/api/investor-profile/`

- GET `/api/investor-profile/`
  - Purpose: Retrieve current investor's profile.
  - Permissions: IsAuthenticated, `IsInvestorUser`
  - Response: `InvestorProfileSerializer`
  - Source: `investorprofile/views.py: InvestorProfileView.get`

- PUT `/api/investor-profile/`
  - Purpose: Update current investor's profile (partial update behavior).
  - Permissions: IsAuthenticated, `IsInvestorUser`
  - Request: `InvestorProfileSerializer` (fields include `first_name`, `last_name`, phones, `location`, `user_profile_email` etc.)
  - Response: `InvestorProfileSerializer`
  - Source: `investorprofile/views.py: InvestorProfileView.put`

Admin management via router under same base:

- ViewSet base: `/api/investor-profile/admin/investors/`
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Standard actions:
    - GET `/` list
    - POST `/` create (requires `user` id and profile fields)
    - GET `/{id}/` retrieve
    - PUT/PATCH `/{id}/` update/partial_update
    - DELETE `/{id}/` destroy
  - Serializer: `AdminInvestorManagementSerializer` (includes computed `total_investment`, `total_hives`).
  - Source: `investorprofile/urls.py`, `investorprofile/views.py: AdminInvestorViewSet`

---

## Farmer Profile

Base: `/api/farmer-profile/`

- GET `/api/farmer-profile/`
  - Purpose: Retrieve current farmer's profile.
  - Permissions: IsAuthenticated, `IsFarmerUser`
  - Response: `FarmerProfileSerializer`
  - Source: `farmer_profile/views.py: FarmerProfileView.get`

- PUT `/api/farmer-profile/`
  - Purpose: Update current farmer's profile (partial update behavior).
  - Permissions: IsAuthenticated, `IsFarmerUser`
  - Request: `FarmerProfileSerializer`
  - Response: `FarmerProfileSerializer`
  - Source: `farmer_profile/views.py: FarmerProfileView.put`

Admin management via router under same base:

- ViewSet base: `/api/farmer-profile/admin/farmers/`
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Standard actions:
    - GET `/` list
    - POST `/` create
    - GET `/{id}/` retrieve
    - PUT/PATCH `/{id}/` update/partial_update
    - DELETE `/{id}/` destroy
  - Serializer: `AdminFarmerManagementSerializer`
  - Source: `farmer_profile/urls.py`, `farmer_profile/views.py: AdminFarmerViewSet`

---

## Admin Profile and Messaging

Base: `/api/admin-profile/`

- GET `/api/admin-profile/`
  - Purpose: Retrieve current admin's profile.
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Response: `AdminProfileSerializer`
  - Source: `admin_profile/views.py: AdminProfileView.get`

- PUT `/api/admin-profile/`
  - Purpose: Update current admin's profile (partial update behavior).
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Request: `AdminProfileSerializer`
  - Response: `AdminProfileSerializer`
  - Source: `admin_profile/views.py: AdminProfileView.put`

Super admin management via router under same base:

- ViewSet base: `/api/admin-profile/super/admins/`
  - Permissions: IsAuthenticated, `IsAdminUser` + runtime check for `permission_level == 'super'` on requesting admin for create/update/destroy.
  - Standard actions:
    - GET `/` list (super: all; regular: own profile)
    - POST `/` create (super only)
    - GET `/{id}/` retrieve
    - PUT/PATCH `/{id}/` update/partial_update (super only)
    - DELETE `/{id}/` destroy (super only)
  - Serializer: `SuperAdminProfileManagementSerializer`
  - Source: `admin_profile/urls.py`, `admin_profile/views.py: SuperAdminProfileViewSet`

Admin user creation:

- POST `/api/admin-profile/create-admin/`
  - Purpose: Create a new Django user and linked `AdminProfile` in one step.
  - Permissions: IsAuthenticated, `IsAdminUser` + superuser or admin with `permission_level == 'super'`
  - Request: `AdminUserCreationSerializer` (email, password, first/last name, phones, location, department, position, permission_level)
  - Response 201: `AdminUserCreationSerializer` representation with created profile summary
  - Source: `admin_profile/views.py: AdminUserCreationView.post`

Admin communications:

- POST `/api/admin-profile/communicate/`
  - Purpose: Send a message (email + in-app record) to selected users; records receipts for successful sends.
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Request: `CommunicationSerializer`
    - `user_ids` [int]
    - `title` (string)
    - `content` (string; supports placeholders: `{{firstname}}`, `{{lastname}}`, `{{fullname}}`, `{{email}}`)
    - `cta_link` (URL, optional)
    - `tag` (choice: Investment Updates | Performance Alerts | Events | Announcements | Direct Messages | Important)
  - Response 200: `{ sent_to: [user_id], failed: [{user_id, error}], total_requested, tag }`
  - Source: `admin_profile/views.py: AdminCommunicationView.post`

Admin messages (read-only) via router under same base:

- ViewSet base: `/api/admin-profile/admin/messages/`
  - Permissions: IsAuthenticated, `IsAdminUser`
  - Standard actions:
    - GET `/` list (super: all, regular: messages sent by self)
    - GET `/{id}/` retrieve
  - Serializer: `AdminMessageSerializer`
  - Source: `admin_profile/urls.py`, `admin_profile/views.py: AdminMessageViewSet`

Recipient inbox and read receipts:

- GET `/api/admin-profile/messages/inbox/`
  - Purpose: List messages addressed to the authenticated user.
  - Permissions: IsAuthenticated
  - Query params:
    - `tag` (optional, string) — filter by message tag. Allowed values per `CommunicationSerializer.TAG_CHOICES`:
      `Investment Updates | Performance Alerts | Events | Announcements | Direct Messages | Important`.
  - Response: `RecipientMessageSerializer` with fields:
    - `id` (int)
    - `title` (string)
    - `content` (string)
    - `cta_link` (string|url)
    - `tag` (string)
    - `sent_at` (datetime)
    - `sender_email` (string, sender's email)
    - `read` (bool)
    - `read_at` (datetime|null)
  - Source: `admin_profile/views.py: RecipientMessageListView.get`

- POST `/api/admin-profile/messages/{message_id}/read/`
  - Purpose: Mark a message as read for the current user.
  - Permissions: IsAuthenticated
  - Response 200: `{ message_id, read, read_at }`
  - Source: `admin_profile/views.py: MarkMessageReadView.post`

Alias for frontend compatibility (maps to same inbox view):
- GET `/api/admin/messages/inbox/`
  - Purpose/Behavior: same as above.
  - Source: `backend/urls.py`

---

## Hive Management

Base: `/api/` (via router `hivemgmt/urls.py`)

ViewSet base: `/api/hives/`

- Permissions: IsAuthenticated, IsAdminUser
- Actions:
  - GET `/api/hives/` list — filters: `status`, `needs_maintenance`, `is_colonized`, `location`, `assigned_farmer`; search: `hive_id`, `location`, `assigned_farmer__user__email`; ordering: `created_at`, `status`, `location`, `honey_produced`.
  - POST `/api/hives/` create — body: `HiveSerializer`
  - GET `/api/hives/{id}/` retrieve — returns `HiveSerializer`
  - PUT/PATCH `/api/hives/{id}/` update/partial_update — body: `HiveSerializer`
  - DELETE `/api/hives/{id}/` destroy
- Custom admin actions:
  - POST `/api/hives/bulk-assign/`
    - Purpose: Assign multiple hives to a farmer in one request.
    - Body: `{ "farmer_id": <farmer_profile_id>, "hive_ids": [1,2,3] }`
    - Response 200: `{ updated_count, hive_ids, farmer_id }`
  - POST `/api/hives/assign-investment/`
    - Purpose: Assign all hives linked to an investment to a farmer.
    - Body: `{ "farmer_id": <farmer_profile_id>, "investment_id": <investment_id> }`
    - Response 200: `{ updated_count, hive_ids, farmer_id, investment_id }`
- Serializer: `HiveSerializer` fields: `id, hive_id, location, assigned_farmer, assigned_farmer_name, investment, investment_id, status, needs_maintenance, is_colonized, honey_produced, created_at, updated_at`
- Source: `hivemgmt/views.py: HiveViewSet`

---

## Investments

Base: `/api/investments/`

- GET `/api/investments/`
  - Purpose: List investments. Admins: all. Investors: own.
  - Permissions: IsAuthenticated, `IsAdminOrInvestorUser`
  - Response: `InvestmentSerializer` (many)
  - Source: `investments/views.py: InvestmentListView`

- GET `/api/investments/{id}/`
  - Purpose: Retrieve investment detail (investor: own; admin: any).
  - Permissions: IsAuthenticated, `IsAdminOrInvestorUser`
  - Response: `InvestmentSerializer`
  - Source: `investments/views.py: InvestmentDetailView`

---

## Payments

Base: `/api/payments/`

- GET `/api/payments/`
  - Purpose: List payments. Admins: all. Investors: own.
  - Permissions: IsAuthenticated, `IsAdminOrInvestorUser`
  - Response: `PaymentOutputSerializer` (many)
  - Source: `payments/views.py: PaymentListView`

- POST `/api/payments/confirm/`
  - Purpose: Verify a Paystack transaction by `reference`, create `Payment` and `Investment`, and return both. Also creates `Hive` records for the quantity purchased.
  - Permissions: IsAuthenticated
  - Request body: object with properties `reference` (string), `amount` (string), `currency` (string), `status` (string), `hiveType` (string), `investmentTier` (string), `quantity` (int), `personalDetails` (string), `timestamp` (datetime string). Only `reference, amount, currency, status, timestamp` are required; other fields optional.
  - Response 201: `{ message, payment: PaymentOutputSerializer, investment: InvestmentSerializer }`
  - Errors: 400 verification failed; 404 investor profile missing; 500 secret key not configured
  - Source: `payments/views.py: PaymentConfirmationAPIView.post`

- POST `/api/payments/webhook/`
  - Purpose: Paystack webhook receiver; verifies signature and processes `charge.success` by calling verification flow.
  - Permissions: AllowAny
  - Request: `PaystackWebhookRequestSerializer`
  - Response 200: `{ message }` (for handled events) or generic confirmation
  - Errors: 400 invalid request; 403 invalid signature; 500 internal error
  - Source: `payments/views.py: PaystackWebhookView.post`

(Internal/payment helper endpoints defined but not routed here: `PaymentCreateView`, `PaymentUpdateView` are not exposed via `payments/urls.py`).

---

## Financial Management

Base: `/api/financial/`

- GET `/api/financial/dashboard/`
  - Purpose: Admin dashboard overview metrics.
  - Permissions: IsAuthenticated, IsAdminUser
  - Response: `FinancialOverviewSerializer` (e.g., totals, trends, ROI, rates)
  - Source: `financial_management/views.py: FinancialDashboardView.get`

Viewsets (router under base `/api/financial/`):

- `/api/financial/revenue/` — `RevenueViewSet`
  - Permissions: IsAuthenticated, IsAdminUser
  - Actions:
    - GET `/` list (search `source, description, reference_id`; ordering `amount, transaction_date, source`)
    - POST `/` create
    - GET `/{id}/` retrieve
    - PUT/PATCH `/{id}/` update/partial_update
    - DELETE `/{id}/` destroy
    - GET `/monthly_summary/` (detail=False action): query params `year`, `month`; response `{ year, month, total, breakdown }`
  - Serializer: `RevenueSerializer`

- `/api/financial/honey-production/` — `HoneyProductionViewSet`
  - Permissions: IsAuthenticated, IsAdminUser
  - Standard list/create/retrieve/update/destroy with search/ordering.
  - Serializer: `HoneyProductionSerializer`

- `/api/financial/farmer-payouts/` — `FarmerPayoutViewSet`
  - Permissions: IsAuthenticated, IsAdminUser
  - Actions: standard CRUD; additional actions:
    - POST `/{id}/approve/` — approve a payout; returns `FarmerPayoutSerializer`
    - POST `/{id}/process_payment/` — set transaction reference and mark as paid; returns `FarmerPayoutSerializer`
    - POST `/create_from_production/` — body: `{ honey_production_id, rate_per_liter }`; returns created payout
  - Serializer: list uses `FarmerPayoutListSerializer`, detail uses `FarmerPayoutSerializer`

- `/api/financial/investor-payouts/` — `InvestorPayoutViewSet`
  - Permissions: IsAuthenticated, IsAdminUser
  - Actions: standard CRUD; additional actions:
    - POST `/{id}/approve/`
    - POST `/{id}/process_withdrawal/`
    - POST `/{id}/process_reinvestment/` — body may include `investment_details` object
    - POST `/schedule_upcoming/` — schedules upcoming payouts; returns count
  - Serializer: list uses `InvestorPayoutListSerializer`, detail uses `InvestorPayoutSerializer`

- `/api/financial/reports/` — `FinancialReportViewSet`
  - Permissions: IsAuthenticated, IsAdminUser
  - Actions: standard CRUD; additional:
    - POST `/generate/` — body: `{ report_type, start_date, end_date, title }`; returns created `FinancialReport`
  - Serializer: `FinancialReportSerializer`

---

## User Settings

Base: `/api/settings/`

- GET `/api/settings/`
  - Purpose: Retrieve the current user's notification and policy settings.
  - Permissions: IsAuthenticated
  - Response: `UserSettingsSerializer` (fields: `payout_updates`, `hive_activity_alerts`, `environmental_impact_reports`, `new_investment_opportunities`, `terms_of_service_signed`)
  - Source: `user_settings/views.py: UserSettingsView`

- PUT/PATCH `/api/settings/`
  - Purpose: Update the current user's settings.
  - Permissions: IsAuthenticated
  - Request: `UserSettingsSerializer`
  - Response: `UserSettingsSerializer`
  - Source: `user_settings/views.py: UserSettingsView`

---

## URL Map Summary (by app)

- `backend/urls.py` mounts:
  - `/api/` -> `hivemgmt.urls`, `core.urls`
  - `/api/auth/` -> `authentication.urls`
  - `/api/investor-profile/` -> `investorprofile.urls`
  - `/api/farmer-profile/` -> `farmer_profile.urls`
  - `/api/admin-profile/` -> `admin_profile.urls`
  - `/api/admin/messages/inbox/` -> alias to recipient inbox
  - `/api/payments/` -> `payments.urls`
  - `/api/investments/` -> `investments.urls`
  - `/api/financial/` -> `financial_management.urls`
  - `/api/settings/` -> `user_settings.urls`
  - `/api/feedback/` -> `feedback.urls`
  - `/api/resources/` -> `resources.urls`
  - `/swagger/`, `/redoc/`

---

## Permissions Overview

- `IsAdminUser` in this project is a custom permission under `core.permissions` for role-based access (admins). Additional custom permissions used:
  - `IsInvestorUser` (investor-only profile endpoints)
  - `IsFarmerUser` (farmer-only profile endpoints)
  - `IsAdminOrInvestorUser` (shared admin/investor access e.g., payments and investments)

Where these custom permissions are used, non-authorized roles will receive 403 Forbidden.

---

## Serializer Field References (selected)

- `InvestorProfileSerializer` and `FarmerProfileSerializer` share common fields: `first_name`, `last_name`, `primary_phone`, `other_phone`, `location`, `user_profile_email`, plus type-specific fields.
- `HiveSerializer`: `hive_id`, `location`, `assigned_farmer`, `status`, `needs_maintenance`, `is_colonized`, `honey_produced`.
- `InvestmentSerializer`: `user_profile`, `payment`, `amount`, `investment_date`, `roi`, `interest_earned`, `interest_to_be_earned`, `maturity_date`, `investment_status`, `hive_status`, `number_of_hives`.
- `PaymentOutputSerializer`: `reference`, `amount`, `currency`, `status`, `hiveType`, `investmentTier`, `quantity`, `personal_details`, `timestamp`, `verified`.
- Financial serializers expose human-readable display fields where applicable (e.g., `status_display`, `payout_type_display`).

---

## Notes and Conventions

- All endpoints expect and return JSON.
- Date/time fields are ISO 8601 strings.
- For viewsets, standard DRF routes apply; custom actions are listed explicitly above.
- Email communications sent via `AdminCommunicationView` support placeholders `{{firstname}}`, `{{lastname}}`, `{{fullname}}`, `{{email}}` which are rendered from the recipient's associated profile or the User object.

---

## Error Handling

- Validation errors return HTTP 400 with serializer error details.
- Authentication issues return 401 Unauthorized.
- Permission issues return 403 Forbidden.
- Object not found returns 404 Not Found.