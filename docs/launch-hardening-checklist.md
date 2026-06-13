# MicroAtlas Launch Hardening Checklist

## 1. Build and deployment readiness

- [~] `npm run build` passes locally.
- [~] Production deployment builds successfully.
- [x] `.env.local` is not committed.
- [x] Supabase project URL and publishable key are configured in deployment environment.
- [~] No starter-kit metadata remains visible.
- [~] Public pages have sensible titles/descriptions.

## 2. Authentication and account safety

- [x] Email verification is active in Supabase.
- [x] Users can sign up.
- [x] Users can verify email.
- [x] Users can log in and log out.
- [x] Unverified users cannot submit nations.
- [~] Banned users cannot create, edit, submit, or report.

## 3. Privacy and access control

- [x] Public atlas loads without login.
- [x] Public atlas shows approved/public nations only.
- [x] Public nation profiles load without login.
- [x] Draft/submitted/rejected/hidden nations do not appear publicly.
- [x] Users cannot view another user's private draft.
- [x] Users cannot edit another user's nation.
- [x] User emails are hidden by default.
- [~] Public email appears only when explicitly enabled.

## 4. Moderation workflow

- [x] User can create draft nation.
- [x] User can draw and edit map claim.
- [x] User can upload allowed flag format.
- [x] User can submit complete nation for review.
- [x] Admin can approve submission.
- [x] Admin can reject submission.
- [x] Admin can request changes.
- [x] Admin can hide approved nation.
- [x] Admin can restore hidden nation.
- [x] Admin can ban user.
- [x] Admin can unban user.
- [x] Moderation actions are logged.

## 5. Reporting and abuse handling

- [x] Logged-out visitor can submit a report.
- [x] Logged-in user can submit a report.
- [x] Report appears in admin moderation queue.
- [x] Admin can mark report as reviewing.
- [x] Admin can resolve report.
- [x] Admin can dismiss report.
- [ ] Basic bot/honeypot protection exists on public report form.

## 6. Bad submission tests

- [x] Blank/nonsense nation tested.
- [x] Excessive claim tested.
- [x] Suspicious URL tested.
- [x] Disallowed flag file type tested.
- [x] Oversized flag file tested.
- [x] Hidden nation public URL tested.
- [x] Banned user workflow tested.

## 7. Closed beta readiness

- [x] At least 10 test submissions reviewed end-to-end.
- [x] At least 3 intentionally bad/spam submissions tested.
- [ ] Feedback collection method prepared.
- [ ] Known issues list prepared.
- [ ] Closed beta invite list prepared.