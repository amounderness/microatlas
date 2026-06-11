# MicroAtlas MVP Specification

**Version:** 0.1  
**Status:** Draft MVP specification  
**Date:** 11 June 2026  
**Proposed domain:** microatlas.xyz  
**Product owner:** Keenan Clough  

## 1. Executive Summary

MicroAtlas is a serious public atlas and registry for micronations, self-declared states, and experimental civic projects. The MVP will allow verified users to submit a mapped micronational claim, add basic descriptive information, upload a flag, and send the entry for admin review. Approved entries appear on a public world map and have a public nation profile.

The product should not launch as a general social network, roleplay game, diplomacy simulator, or chat platform. Those features may be valuable later, but the first release must prove the core registry model: verified identity, private-by-default contact information, mapped submissions, controlled publication, and moderation-first governance.

**MVP statement:** A verified-user public atlas of micronational claims, with admin review before publication.

## 2. Product Positioning

MicroAtlas should feel archival, cartographic, civic, and lightly social. It should serve serious micronationalists, researchers, historians, worldbuilding-adjacent hobbyists, and curious visitors without encouraging low-effort LARP mechanics.

The product should be framed as:

> A public atlas and registry for micronations, self-declared states, and experimental civic projects.

The product should not be framed as:

- A game.
- A diplomacy simulator.
- A map-based Discord replacement.
- A ranking system for micronations.
- A war, alliance, or recognition mechanic.

## 3. Naming and Domain

**Recommended name:** MicroAtlas  
**Recommended domain:** microatlas.xyz

MicroAtlas is preferable to Micro-Atlas because it is cleaner, more brandable, easier to type, and suitable as a proper product name. The `.xyz` domain is acceptable for an early-stage digital project, especially if the visual identity is serious and the homepage clearly explains the product.

Recommended supporting names:

- Public map: Atlas
- User submission area: Dashboard
- Nation page: Nation Profile
- Admin review area: Moderation Desk
- Entry type: Nation
- Mapped area: Claim

## 4. MVP Scope

### 4.1 In Scope

The MVP includes only the capabilities needed to create, review, and display credible mapped micronation entries.

| Area | MVP Capability | Notes |
|---|---|---|
| Authentication | User signup, login, logout, email verification | Required before creating a nation |
| Profiles | Basic profile with display name and privacy toggles | Email hidden by default |
| Nation creation | Create draft nation with name and basic details | Saved to user dashboard |
| Map drawing | Draw one primary polygon claim | Store as GeoJSON initially |
| Visual styling | Border colour, fill colour, opacity | Simple but enough for map distinction |
| Flag upload | PNG, JPG/JPEG, WebP upload | SVG excluded from MVP |
| Submission workflow | Draft -> submitted -> approved/rejected/needs changes | Public only after approval |
| Public atlas | Approved nations shown on world map | Click polygon for popup |
| Nation profile | Public page for approved nation | Shows approved data only |
| Admin moderation | Review, approve, reject, hide, ban | Critical MVP feature |
| Reporting | Public report button | Feeds admin queue |

### 4.2 Out of Scope for MVP

These features should be intentionally excluded from the first release:

- Chat.
- Direct messages.
- Alliances.
- Recognition mechanics.
- Wars/conflicts.
- Public rankings.
- Leaderboards.
- Nation comments.
- Public ideology/religion free-text fields.
- Complex coat of arms designer.
- Full flag designer.
- Overlap prevention.
- Mobile app.
- Payment/subscription features.

The strongest reason to exclude these is not technical difficulty. It is moderation complexity and product positioning. The first version must establish MicroAtlas as a credible registry before adding social mechanics.

## 5. Core User Workflow

The core MVP workflow is:

1. User signs up.
2. User verifies their email address.
3. User creates or updates their profile.
4. User opens "Create Nation".
5. User enters nation details.
6. User draws a polygon claim on the world map.
7. User uploads a flag.
8. User saves the nation as draft.
9. User submits the nation for review.
10. Admin reviews the submission.
11. Admin approves, rejects, or requests changes.
12. Approved nation appears on the public atlas.
13. Visitors click the polygon and view the nation infobox/profile.

## 6. User Types and Permissions

| User Type | Description | Permissions |
|---|---|---|
| Visitor | Not logged in | View approved atlas entries and public nation profiles |
| Verified User | Logged in with verified email | Create profile, create draft nations, submit for review, report entries |
| Trusted User | Established user with good history | May receive faster review or limited auto-approval later; not MVP-critical |
| Moderator | Reviews submissions and reports | Approve, reject, request changes, hide entries, add notes |
| Admin | Full platform control | All moderator powers plus ban users, manage roles, edit system settings |

## 7. Public Pages and App Structure

| Route | Page | Purpose |
|---|---|---|
| `/` | Homepage | Explain the product and direct users to atlas/signup |
| `/atlas` | Public Atlas | Display approved nations on an interactive world map |
| `/nations/[slug]` | Nation Profile | Public profile for an approved nation |
| `/sign-up` | Sign Up | Account creation |
| `/sign-in` | Sign In | Login |
| `/verify-email` | Verify Email | Explain email verification step |
| `/dashboard` | User Dashboard | Manage own nations and submissions |
| `/dashboard/nations/new` | Create Nation | Draft creation workflow |
| `/dashboard/nations/[id]/edit` | Edit Nation | Edit draft or rejected/needs-changes nation |
| `/admin/moderation` | Moderation Desk | Review pending submissions and reports |

## 8. Data Model

The following data model is sufficient for the MVP while leaving room for alliances, comments, and chat later.

### 8.1 `profiles`

Stores user-facing profile information separate from authentication data.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Auth user ID |
| `username` | Text | Unique public handle |
| `display_name` | Text | Public name if user chooses |
| `bio` | Text | Optional |
| `public_email_enabled` | Boolean | Default false |
| `public_email` | Text | Optional public contact address |
| `role` | Text | user, moderator, admin |
| `trust_level` | Integer | Default 0 |
| `is_banned` | Boolean | Default false |
| `created_at` | Timestamp | Auto-generated |
| `updated_at` | Timestamp | Auto-generated |

### 8.2 `nations`

Stores the main nation entry.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `owner_id` | UUID | Links to profile/user |
| `name` | Text | Required |
| `slug` | Text | Unique public URL slug |
| `short_description` | Text | Required, short popup text |
| `long_description` | Text | Optional fuller profile text |
| `capital` | Text | Optional |
| `founded_date` | Date/Text | Optional; text may handle uncertain dates better |
| `website_url` | Text | Optional |
| `status` | Text | draft, submitted, approved, rejected, hidden, needs_changes |
| `visibility` | Text | public, unlisted, private |
| `creator_public` | Boolean | Whether creator is shown |
| `contact_public` | Boolean | Whether public contact appears |
| `fill_colour` | Text | Hex colour |
| `border_colour` | Text | Hex colour |
| `fill_opacity` | Numeric | 0 to 1 |
| `created_at` | Timestamp | Auto-generated |
| `updated_at` | Timestamp | Auto-generated |

### 8.3 `nation_claims`

Stores map geometry. Keeping claims separate allows future multiple claims per nation.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `nation_id` | UUID | Links to nations table |
| `geojson` | JSONB | Initial geometry storage |
| `claim_type` | Text | primary, symbolic, historical, disputed |
| `area_label` | Text | Optional human-readable area name |
| `created_at` | Timestamp | Auto-generated |

### 8.4 `nation_assets`

Stores uploaded images such as flags.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `nation_id` | UUID | Links to nations table |
| `asset_type` | Text | flag, coat_of_arms |
| `storage_path` | Text | Path in storage bucket |
| `alt_text` | Text | Required for accessibility before approval |
| `status` | Text | pending, approved, rejected |
| `created_at` | Timestamp | Auto-generated |

### 8.5 `moderation_queue`

Controls review of submitted entries.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `target_type` | Text | nation, claim, asset, profile |
| `target_id` | UUID | ID of reviewed item |
| `submitted_by` | UUID | User/profile ID |
| `status` | Text | pending, approved, rejected, needs_changes |
| `moderator_id` | UUID | Moderator/admin ID |
| `moderator_notes` | Text | Internal notes or user-facing change request |
| `created_at` | Timestamp | Auto-generated |
| `reviewed_at` | Timestamp | Null until reviewed |

### 8.6 `reports`

Allows users and visitors to report bad entries.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `reporter_id` | UUID | Optional if anonymous reporting is allowed |
| `target_type` | Text | nation, profile, asset |
| `target_id` | UUID | Reported item ID |
| `reason` | Text | Spam, abuse, privacy, extremist content, impersonation, other |
| `details` | Text | Optional |
| `status` | Text | open, reviewing, resolved, dismissed |
| `created_at` | Timestamp | Auto-generated |

### 8.7 `moderation_log`

Immutable audit trail of moderation decisions.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `actor_id` | UUID | Moderator/admin performing action |
| `target_type` | Text | nation, claim, profile, asset, user |
| `target_id` | UUID | Affected item |
| `action` | Text | approved, rejected, hidden, restored, banned, unbanned |
| `notes` | Text | Internal context |
| `created_at` | Timestamp | Auto-generated |

## 9. Privacy and Safety Rules

Privacy must be designed into the MVP rather than retrofitted.

Core rules:

- User emails must never be shown publicly by default.
- Public contact information must require an explicit opt-in.
- Admins should see account emails for moderation/account purposes only.
- Profiles should use display names or usernames, not legal names.
- Users should be able to hide their creator identity from public nation pages.
- User-submitted flags should be reviewed before becoming public.
- Rejected/hidden entries should not appear in public API responses.
- Banned users should be blocked from creating, editing, or submitting nations.
- Public pages should expose only approved data.

## 10. Moderation Policy for MVP

The moderation system should be simple and firm.

### 10.1 Publication Rule

No nation, claim, flag, or profile content appears publicly until approved.

### 10.2 Rejection Grounds

Reject or request changes for:

- Spam.
- Blank or nonsense entries.
- Racist, extremist, or abusive content.
- Impersonation of real people, organisations, or existing micronations.
- Personal information published without clear consent.
- Pornographic or shock imagery.
- Malware links or suspicious URLs.
- Excessively large or deliberately disruptive map claims.
- Low-effort LARP entries presented in a way that damages the serious atlas purpose.

### 10.3 Claim Handling

For MVP:

- Allow overlapping claims.
- Do not adjudicate sovereignty disputes.
- Do not verify legal status.
- Do not imply endorsement or recognition.
- Use neutral terminology: "claim", "entry", "profile", "self-declared".
- Allow symbolic/historical claims if clearly marked.

### 10.4 Admin Actions

Admins/moderators need the ability to:

- Approve submission.
- Reject submission.
- Request changes.
- Hide approved entry.
- Restore hidden entry.
- Ban user.
- Unban user.
- Add internal moderation notes.
- View report history.

## 11. Technical Stack

Recommended MVP stack:

| Layer | Recommendation | Reason |
|---|---|---|
| Frontend | Next.js + TypeScript | Modern, familiar, scalable |
| Styling | Tailwind CSS | Fast UI build and consistent design |
| Auth | Supabase Auth | Email/password, verification, user management |
| Database | Supabase Postgres | Simple hosted relational database |
| Spatial data | GeoJSON in JSONB initially | Fastest MVP approach |
| Future spatial upgrade | PostGIS | Needed for spatial indexing, overlap checks, area calculations |
| File storage | Supabase Storage | Good fit for flag uploads |
| Map library | Leaflet | Simple, proven, enough for MVP |
| Hosting | Vercel | Straightforward Next.js deployment |
| Bot protection | Cloudflare Turnstile | Reduces spam without relying on login alone |

## 12. Map Behaviour

The map should support:

- Public display of approved nation claims.
- Clickable polygons.
- Infobox popup with name, flag, short description, and view profile link.
- Basic colour styling per nation.
- Reduced opacity fill area.
- Border stroke for claim outline.
- Zoom and pan.
- Search and filters later, not required for first map launch.

Map creation should support:

- Draw polygon.
- Edit polygon before submission.
- Delete and redraw polygon.
- Store as GeoJSON.
- Limit excessive polygon complexity.
- Reject empty or invalid geometry.

## 13. Flag Upload Requirements

MVP supported formats:

- PNG.
- JPG/JPEG.
- WebP.

MVP restrictions:

- Maximum file size: 2MB to 5MB.
- SVG excluded initially.
- File preview before upload.
- Alt text required before approval.
- Assets remain pending until reviewed.
- Public display only after approval.

## 14. User Stories and Acceptance Criteria

### 14.1 Account Creation

**As a new user,** I want to create an account and verify my email so that I can submit a micronation.

Acceptance criteria:

- User can sign up with email/password.
- User receives verification email.
- User cannot submit a nation until email is verified.
- User can sign in and out.

### 14.2 Create Draft Nation

**As a verified user,** I want to create a draft nation so that I can prepare my entry before submitting it.

Acceptance criteria:

- User can create a nation draft.
- Draft is visible in dashboard.
- Draft is not visible publicly.
- User can edit their own draft.
- User cannot edit another user's draft.

### 14.3 Draw Claim

**As a verified user,** I want to draw my micronation's claimed area on a world map.

Acceptance criteria:

- User can draw a polygon.
- User can edit/delete the polygon before submission.
- Polygon is saved as GeoJSON.
- Invalid or empty geometry cannot be submitted.

### 14.4 Upload Flag

**As a verified user,** I want to upload a flag so that my nation profile has a visual identity.

Acceptance criteria:

- User can upload PNG, JPG/JPEG, or WebP.
- Unsupported file types are rejected.
- Oversized files are rejected.
- Uploaded flag remains pending until approved.

### 14.5 Submit for Review

**As a verified user,** I want to submit my nation for review so that it can appear on the public atlas.

Acceptance criteria:

- User can submit a complete draft.
- Status changes from draft to submitted.
- User cannot publicly publish directly.
- Admin can view the submission in moderation queue.

### 14.6 Moderate Submission

**As an admin,** I want to review submissions before publication so that the atlas remains credible.

Acceptance criteria:

- Admin can view pending submissions.
- Admin can inspect details, flag, and map claim.
- Admin can approve, reject, or request changes.
- Approved entries become public.
- Rejected/hidden entries remain non-public.

### 14.7 View Public Atlas

**As a visitor,** I want to browse approved micronations on a map so that I can discover entries around the world.

Acceptance criteria:

- Public atlas loads without login.
- Only approved entries appear.
- Clicking a polygon opens an infobox.
- Infobox links to the nation profile.

## 15. Build Milestones

| Milestone | Outcome | Completion Definition |
|---|---|---|
| 1. Project setup | Repo, app shell, Supabase project | App deploys, env variables configured |
| 2. Auth and profiles | Verified users can sign up and manage profile | Email verification and protected dashboard work |
| 3. Draft nations | Users can create/edit draft nation records | Draft appears in dashboard only |
| 4. Map drawing | Users can draw and save polygon claim | GeoJSON saved and reloaded for editing |
| 5. Flag upload | Users can upload pending flag asset | File validation and preview work |
| 6. Submission workflow | Drafts can be submitted for review | Status changes and queue entry created |
| 7. Admin moderation | Admin can approve/reject/request changes | Approved entries become public |
| 8. Public atlas | Approved claims appear on map | Popups and profile links work |
| 9. Reports and bans | Users can report entries; admins can act | Reports queue, hide, ban implemented |
| 10. Launch hardening | Privacy, spam, and QA pass | Ready for closed beta |

## 16. Launch Criteria

MicroAtlas should not launch publicly until all of the following are true:

- Email verification is active.
- Row-level security is active on all relevant tables.
- Users cannot view or edit other users' private drafts.
- Public atlas shows approved nations only.
- User emails are hidden by default.
- Admin can approve, reject, request changes, hide, and ban.
- Flag uploads are type-limited and size-limited.
- Public report button works.
- Basic rate limiting or bot protection is in place.
- At least 10 test submissions have been reviewed end-to-end.
- At least 3 intentionally bad/spam submissions have been tested and blocked.

## 17. Closed Beta Plan

Before public launch, run a closed beta with a small group of serious micronationalists.

Recommended closed beta size: 10 to 30 users.

Closed beta objectives:

- Test account creation.
- Test map drawing usability.
- Test flag uploads.
- Identify confusing form fields.
- Validate moderation workflow.
- Check whether serious users understand the purpose.
- Identify spam/LARP vectors before public indexing.

Closed beta should not include chat or alliances.

## 18. Post-MVP Roadmap

### 18.1 Version 1.1 - Discovery Improvements

- Search by nation name.
- Filter by region/continent.
- Filter by claim type.
- Better popup design.
- Nation profile improvements.
- Optional verified contact form without exposing email.

### 18.2 Version 1.2 - Community Features, Carefully Limited

- Follow/watch nation updates.
- Public update feed for approved nations.
- Admin-approved directory of external communities.
- Optional contact request system.

### 18.3 Version 2.0 - Alliances and Diplomacy Layer

Only add alliances once moderation capacity exists.

Possible features:

- Alliance pages.
- Alliance membership requests.
- Admin or moderator oversight.
- No war/conflict mechanics.
- No ranking systems.
- Clear separation between real organisational links and roleplay-only claims.

### 18.4 Chat Consideration

Chat is valuable for discovery and community, but it should be treated as a high-risk feature.

If added later, use:

- Verified users only.
- Rate limits.
- Reporting.
- Moderator tools.
- Banned word detection.
- Channel-level moderation.
- No anonymous chat.
- No public email exposure.

## 19. Design Principles

MicroAtlas should be:

- Serious but not humourless.
- Cartographic before social.
- Privacy-first.
- Moderation-first.
- Lightweight and fast.
- Clear for non-technical users.
- Respectful of hobbyist worldbuilding without becoming dominated by LARP mechanics.
- Useful as a directory, archive, and discovery tool.

## 20. Immediate Next Actions

1. Register or reserve the chosen domain.
2. Create the GitHub repository.
3. Create the Supabase project.
4. Draft the database schema.
5. Build authentication and profile creation.
6. Build the dashboard shell.
7. Implement draft nation creation before map drawing.
8. Add map drawing only after the draft object is stable.
9. Add admin review before any public atlas launch.
10. Run a closed beta with serious users before public release.

## 21. MVP Definition of Done

The MVP is complete when:

- A user can create and verify an account.
- A user can create a profile.
- A user can create a draft nation.
- A user can draw one mapped claim.
- A user can upload a flag.
- A user can submit the nation for review.
- An admin can approve or reject the submission.
- Approved nations appear on the public atlas.
- Visitors can click a nation and view its public profile.
- Private data remains private.
- Spam and abusive submissions can be reported, hidden, and acted upon.

At that point, MicroAtlas is not yet a community platform. It is a working, serious, moderated micronational atlas. That is the correct foundation.
