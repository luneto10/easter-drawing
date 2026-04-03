# Local testing (seed data)

Use this after applying migrations and running the Prisma seed so you have predictable users, one room, sample wish lists, and a known admin key.

## Setup

1. Configure `DATABASE_URL` in `.env` (PostgreSQL).
2. Apply migrations:

   ```bash
   npx prisma migrate deploy
   ```

3. Seed the database:

   ```bash
   npx prisma db seed
   ```

The seed **wipes** all existing `Room` and `User` rows (and related memberships / wish lists), then inserts the demo data below.

## Fixed IDs (participant “codes”)

Log in on the home page with **Paste your participant ID** using one of these UUIDs:

| Person            | Role              | Participant ID (UUID)                          | Email (reference)        |
| ----------------- | ----------------- | --------------------------------------------- | ------------------------ |
| Alice Organizer   | Room creator      | `11111111-1111-4111-8111-111111111101`        | alice.seed@example.local |
| Bob Participant   | Member            | `22222222-2222-4222-8222-222222222202`        | bob.seed@example.local   |
| Carol Participant | Member            | `33333333-3333-4333-8333-333333333303`        | carol.seed@example.local |

## Room and admin link

| Field     | Value                                    |
| --------- | ---------------------------------------- |
| Room ID   | `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`   |
| Admin key | `seed-testing-admin-key-001`             |

**Organizer dashboard URL** (replace `localhost:3000` with your app origin):

```text
http://localhost:3000/admin?room=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&key=seed-testing-admin-key-001
```

Alice’s home screen also shows an **Organizer** link for this room because she is the creator; it uses the same `room` and `key` query parameters.

## Wish lists and reports

- Each participant can edit **Your wish list** on the home page after selecting the seeded room (one idea per line).
- **Organizers** can download a CSV:
  - **Report** on the room card on the home page, or  
  - **Wish list report** in the admin toolbar.

The CSV includes name, email, organizer flag, and all desired items (joined with ` · `).

## Limits

- Up to **30** items per person per room; each line up to **280** characters (see `src/lib/desired-items-limits.ts`).
