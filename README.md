# MicroAtlas

MicroAtlas is a public atlas and registry for micronations, self-declared states, experimental civic projects, and related territorial claims.

The project is currently in MVP development and preparing for closed beta.

## MVP scope

The MVP supports:

- User sign-up and profile creation
- Verified user nation submissions
- Draft nation creation and editing
- Map claim drawing
- Flag upload
- Submission for admin review
- Admin approval, rejection, and change requests
- Public atlas for approved entries
- Public nation profile pages
- Public reporting
- Admin report review
- Hide and restore moderation actions
- User ban and unban actions
- Basic account restriction handling

## Out of scope for MVP

The MVP does not include:

- Chat or direct messaging
- Alliances or diplomacy mechanics
- Recognition systems
- Rankings or leaderboards
- War, conflict, or combat mechanics
- Payments
- Mobile app
- Advanced visual redesign

## Current status

MicroAtlas is preparing for closed beta.

The current visual design is temporary. A fuller visual identity and interface redesign is expected after the MVP is functionally stable.

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Environment

This project uses Next.js and Supabase.

Required environment variables are stored outside the repository.

Do not commit `.env.local`.

## Core stack

- Next.js
- TypeScript
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Leaflet
- Leaflet Draw
- Tailwind CSS

## Moderation model

MicroAtlas uses an admin-reviewed publication model.

Users can create and submit entries, but entries only appear publicly after approval. Draft, submitted, rejected, hidden, and private entries should not appear on the public atlas.

Admins and moderators can:

- Review submitted nations
- Approve entries
- Reject entries
- Request changes
- Review reports
- Hide approved entries
- Restore hidden entries
- Ban or unban users

## Closed beta notice

During closed beta, data may be changed, removed, reset, or re-reviewed as the project is tested.

Closed beta users should not submit private addresses, sensitive personal information, illegal content, hateful content, pornographic content, malicious links, or intentionally abusive material unless specifically testing moderation workflows with permission.

## License

License not yet selected.