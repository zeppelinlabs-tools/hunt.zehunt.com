# Module M01 — Identity & Authentication

## Objective
Provide secure identity management for developers and AI-agent authorization.

## Features
- Sign up (credentials + GitHub / Google OAuth)
- Sign in
- Sign out
- Email verification
- Password reset
- Session management & active device inspection
- AI-agent service tokens
- Account deletion (sets `status = deleted`)

## User Data Model
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  status: 'active' | 'pending_verification' | 'disabled' | 'deleted';
}
```

## JSON-Backend API Endpoints
- `POST /api/auth/signin`
- `POST /api/auth/signup`
- `POST /api/auth/signout`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/:id`
- `DELETE /api/auth/account`
