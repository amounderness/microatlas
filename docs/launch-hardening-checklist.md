# MicroAtlas Launch Hardening Checklist

## 1. Build and deployment readiness

- [ ] `npm run build` passes locally.
- [ ] Production deployment builds successfully.
- [ ] `.env.local` is not committed.
- [ ] Supabase project URL and publishable key are configured in deployment environment.
- [ ] No starter-kit metadata remains visible.
- [ ] Public pages have sensible titles/descriptions.

## 2. Authentication and account safety

- [ ] Email verification is active in Supabase.
- [ ] Users can sign up.
- [ ] Users can verify email.
- [ ] Users can log in and log out.
- [ ] Unverified users cannot submit nations.
- [ ] Banned users cannot create, edit, submit, or report.

## 3. Privacy and access control

- [ ] Public atlas loads without login.
- [ ] Public atlas shows approved/public nations only.
- [ ] Public nation profiles load without login.
- [ ] Draft/submitted/rejected/hidden nations do not appear publicly.
- [ ] Users cannot view another user's private draft.
- [ ] Users cannot edit another user's nation.
- [ ] User emails are hidden by default.
- [ ] Public email appears only when explicitly enabled.

## 4. Moderation workflow

- [ ] User can create draft nation.
- [ ] User can draw and edit map claim.
- [ ] User can upload allowed flag format.
- [ ] User can submit complete nation for review.
- [ ] Admin can approve submission.
- [ ] Admin can reject submission.
- [ ] Admin can request changes.
- [ ] Admin can hide approved nation.
- [ ] Admin can restore hidden nation.
- [ ] Admin can ban user.
- [ ] Admin can unban user.
- [ ] Moderation actions are logged.

## 5. Reporting and abuse handling

- [ ] Logged-out visitor can submit a report.
- [ ] Logged-in user can submit a report.
- [ ] Report appears in admin moderation queue.
- [ ] Admin can mark report as reviewing.
- [ ] Admin can resolve report.
- [ ] Admin can dismiss report.
- [ ] Basic bot/honeypot protection exists on public report form.

## 6. Bad submission tests

- [ ] Blank/nonsense nation tested.
- [ ] Excessive claim tested.
- [ ] Suspicious URL tested.
- [ ] Disallowed flag file type tested.
- [ ] Oversized flag file tested.
- [ ] Hidden nation public URL tested.
- [ ] Banned user workflow tested.

## 7. Closed beta readiness

- [ ] At least 10 test submissions reviewed end-to-end.
- [ ] At least 3 intentionally bad/spam submissions tested.
- [ ] Feedback collection method prepared.
- [ ] Known issues list prepared.
- [ ] Closed beta invite list prepared.