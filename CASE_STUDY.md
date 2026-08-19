# CareerFlow — Case Study

## 1. Problem

Job seekers, particularly students and recent graduates applying to dozens of internships and full-time roles simultaneously, lack a purpose-built way to track their applications. The default fallback is a spreadsheet or notes app, which quickly becomes unwieldy: it's hard to search, easy to lose track of interview dates, and gives no real visibility into how a job search is actually progressing (how many applications are stuck at "Applied," how many have converted to interviews, and so on).

## 2. Solution

CareerFlow is a focused, full-stack web application built specifically for this workflow. It models the job search as two related resources — **Job Applications** and **Interviews** — tied to an authenticated user's account. A user logs an application once, updates its status as it moves through the pipeline, and attaches interviews directly to that application so all context (interviewer, type, notes, scheduling) lives in one place. A dashboard aggregates this data into a status breakdown and a timeline of application volume, giving the user an honest picture of their search at a glance. An admin role sits on top for oversight of the platform itself.

The application deliberately avoids scope creep: no messaging, no job-board integration, no AI features — just a clean, reliable system for tracking what matters.

## 3. Technology choices

- **React + Vite** — a fast, component-based frontend with instant dev-server feedback, well suited to a data-heavy CRUD application with many small, reusable pieces (forms, tables, modals, badges).
- **Express** — a minimal, well-understood REST framework that keeps the backend readable and easy to extend, organized into clear layers (routes → controllers → models) rather than a heavier framework's opinions.
- **MongoDB + Mongoose** — the data here is naturally document-shaped (an application with a variable set of optional fields, interviews that reference it) and doesn't need complex joins or transactions, making a document database a good fit. Mongoose adds schema validation and a straightforward relationship model (`ref` + `populate`) on top.
- **JWT** — stateless authentication that works cleanly across a decoupled frontend/backend deployment (different hosts, different domains) without needing shared session storage.
- **Zod** — schema-based server-side validation that mirrors the frontend's validation logic in a single, readable definition per endpoint, and produces structured, field-level error messages the frontend can display directly.

## 4. Challenge

One of the more interesting design problems was **authorization for a two-resource, two-role system**: a `JobApplication` belongs to a `User`, and an `Interview` belongs to both a `JobApplication` *and* a `User`. It would be easy to check ownership only at the application level and assume interviews inherit that protection automatically — but a bug there would let a malicious or careless user create an interview under someone else's application, or read/modify an interview by guessing its ID even without access to the parent application.

There's a second layer to this: admins need broader access (e.g., viewing system-wide stats and all applications for the admin dashboard) without that broader access accidentally leaking into the regular user-facing endpoints, and without the frontend being the only thing standing between a regular user and someone else's data.

## 5. Solution to the challenge

Every mutating and single-resource-read endpoint for applications and interviews independently re-verifies ownership on the backend, not just at the top of a route but inside each controller action:

- `GET/PUT/DELETE /api/applications/:id` loads the application, then explicitly checks `application.userId === req.user._id` (with an `ADMIN` bypass), returning `403 Forbidden` otherwise — this check happens even though the list endpoint (`GET /api/applications`) already scopes its query to the current user, because a resource can still be reached directly by ID.
- Creating an interview requires the caller to first prove they own the *parent* application: `POST /api/interviews` loads the referenced `JobApplication` and rejects the request with `403` if `application.userId !== req.user._id`, before the interview is ever written. This closes the gap where interview-level checks alone wouldn't catch someone attaching an interview to an application they don't own.
- `GET/PUT/DELETE /api/interviews/:id` then repeats the same ownership check on the interview's own `userId`, so even a correctly-created interview can't later be read or modified by a different account.
- All of this authorization logic lives in the controllers and a small `authorize(...roles)` middleware — never in the frontend. The frontend's route guards (`ProtectedRoute`, hiding admin nav links) exist purely for UX; removing them entirely would degrade the experience but not create a security hole, because the backend enforces the real boundary independently.

This was verified with automated tests, including one that specifically registers two separate users, has one create an application, and asserts the other receives a `403` when attempting to update it — turning the authorization guarantee into something the test suite continuously checks rather than something assumed to hold.
