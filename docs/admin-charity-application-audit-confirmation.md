# Admin Charity Application Audit Confirmation

## Issue

### Entities

- Admin
- Charity Application
- AdminActivity

### Workload

Manages the approval workflow for new charities and maintains the system-wide audit trail.

## Status

Done for the backend scope.

## Implemented Backend Coverage

- Admin-only charity application review is wired through `require_role("admin")`.
- Charity applications can be approved or rejected by an admin.
- Only applications with `status = "pending"` can be reviewed.
- Approval requires `organizationName` before any status update happens.
- Approved applicants have their `User.role` updated to `charity`.
- Approved applicants receive a row in the `Charity` table.
- Reviewed applicants receive a notification.
- Admin review actions create an `AdminActivity` audit row.
- Audit insert errors are logged during testing without blocking the approval or rejection flow.
- Admin activity logs are exposed through an admin-only API route.

## Files Added

- `app/backend/models/admin_activity.py`
- `app/backend/services/admin_activity_service.py`
- `app/backend/api/admin_activity.py`

## Files Updated

- `app/backend/main.py`
- `app/backend/api/charity_applications.py`
- `app/backend/services/charity_application_service.py`

## Admin Activity Endpoint

```text
GET /admin-activity/
```

The endpoint requires an authenticated admin user.

Optional query filters:

```text
actionType
targetEntity
userID
limit
```

Example:

```text
GET /admin-activity/?targetEntity=CharityApplication&actionType=approve&limit=100
```

## Review Flow

```text
Admin reviews charity application
-> application is fetched
-> application must exist
-> application must still be pending
-> organizationName is required for approval
-> application status is updated
-> approved applicant becomes charity
-> Charity row is inserted
-> applicant notification is sent
-> AdminActivity row is inserted
```

## Local Verification

The submit to approve to audit flow was tested against the local Supabase database.

Observed result:

```text
updatedRole= charity
charityRows= 1
auditRows= 1
actionType= approve
targetEntity= CharityApplication
```

This confirms:

- the applicant was upgraded to charity,
- the `Charity` table received the charity profile row,
- the `AdminActivity` table received the audit row,
- the audit row targeted `CharityApplication`,
- the audit action was recorded as `approve`.

## Backend Acceptance Result

The backend implementation satisfies the assigned workload:

```text
Manages the approval workflow for new charities and maintains the system-wide audit trail.
```

## Remaining Scope Note

No admin frontend dashboard is included in this confirmation. If the project requires an admin UI, that would be a separate frontend task on top of this completed backend workflow.
