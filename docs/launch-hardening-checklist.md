# MicroAtlas Launch Hardening Checklist

## 1. Build and deployment readiness

- [x] `npm run build` passes locally.
- [x] Production deployment builds successfully.
- [x] `.env.local` is not committed.
- [x] Supabase project URL and publishable key are configured in deployment environment.
- [x] No starter-kit metadata remains visible.
- [x] Public pages have sensible titles/descriptions.
- [x] README.md published with basic description and MVP notice.

## 2. Authentication and account safety

- [x] Email verification is active in Supabase.
- [x] Users can sign up.
- [x] Users can verify email.
- [x] Users can log in and log out.
- [x] Unverified users cannot submit nations.
- [x] Banned users cannot create, edit, submit, or report.

## 3. Privacy and access control

- [x] Public atlas loads without login.
- [x] Public atlas shows approved/public nations only.
- [x] Public nation profiles load without login.
- [x] Draft/submitted/rejected/hidden nations do not appear publicly.
- [x] Users cannot view another user's private draft.
- [x] Users cannot edit another user's nation.
- [x] User emails are hidden by default.
- [x] Public email appears only when explicitly enabled.

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
- [x] Basic bot/honeypot protection exists on public report form.

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
- [x] Feedback collection method prepared.
- [x] Known issues list prepared.
- [x] Closed beta invite list prepared.

## TO DO

1. Replace starter homepage and metadata.
    Done? [x] (Notes: )
2. Add report honeypot/minimum-time protection.
    Done? [x] (Notes: )
3. Test banned logged-in user report submission.
    Done? [x] (Notes: )
4. Test public email visibility.
    Done? [x] (Notes: )
5. Create beta feedback / known issues / invite list docs.
    Done? [x] (Notes: )
6. Final build + production deployment verification.
    Done? [x] (Notes: )
7. README.md published.
    Done? [x] (Notes: )