# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

This is section **06-jobs-api** (Udemy "Section 9: Jobs API") of a Node.js/Express course. The directory is a *starter* project that Ilya fills in by coding along with the videos. Controllers, routes, models and `middleware/authentication.js` begin empty and grow as the section progresses. `README.MD` lists the lesson plan (DB connection, routers, User model, register/login, Mongoose errors, security packages, Swagger).

A completed reference implementation lives at `../final/` — consult it when you need to see the target architecture or resolve ambiguity about what a lesson is building toward. Do **not** copy-paste from `final/`; Ilya is learning and wants to type the code himself. Offer snippets inline in chat or explain approaches instead.

## Commands

- `npm install` — install dependencies
- `npm run dev` — runs `nodemon app.js` (auto-reloads on file changes) — use this locally
- `npm start` — `node app.js` (production; hosting runs this, nodemon is only a devDependency)

There is no lint or test setup in this starter.

## Environment

`.env` (gitignored):
- `PORT=5000` — 3000 is taken by another local project
- `MONGO_URI` — Atlas `Cluster0` (same cluster as 04-store-api), DB name `06-JOBS-API`; added during the "Database Connection" lesson
- `JWT_SECRET`, `JWT_LIFETIME` (e.g. `30d`) — used by the User model's `createJWT` and the auth middleware

## Architecture (target, see `../final/`)

- **app.js** — dotenv, express-async-errors, security middleware (helmet, cors, xss-clean, express-rate-limit), Swagger UI at `/api-docs`, `/api/v1/auth` (public) and `/api/v1/jobs` (behind `authenticateUser`), then `notFound` and `errorHandler`; `start()` awaits `connectDB(MONGO_URI)` before `listen`.
- **models/User.js** — name/email/password with Mongoose validation; `pre('save')` hashes the password with bcryptjs; instance methods `createJWT` and `comparePassword`.
- **models/Job.js** — company, position, status, `createdBy` (ref User).
- **controllers/auth.js** — `register`, `login` (BadRequestError / UnauthenticatedError).
- **controllers/jobs.js** — CRUD scoped to `req.user.userId`.
- **middleware/authentication.js** — verifies `Bearer` token, sets `req.user = { userId, name }`.
- **errors/** — `CustomAPIError` + `BadRequestError`, `UnauthenticatedError`, `NotFoundError` with an `index.js` barrel (already provided).
- **middleware/error-handler.js** — later extended to map Mongoose validation, duplicate-key (11000) and CastError to proper status codes.

## Version differences vs the course

Bumped: `mongoose` 9.7.2, `jsonwebtoken` 9, `dotenv` 16, `express` 4.21, `nodemon` 3. `db/connect.js` already simplified to `mongoose.connect(url)` (old options throw in v6+).

Mongoose 9 vs the course's v5:
- `pre('save', async function () {...})` — no `next` parameter, don't call `next()`.
- `findOneAndUpdate(..., { new: true })` → `{ returnDocument: 'after', runValidators: true }`.
- `findByIdAndRemove` / `findOneAndRemove` were removed → `findOneAndDelete`.

Security/docs packages (helmet 4, express-rate-limit 5, xss-clean, swagger-ui-express 4, yamljs) are still at course versions; decide on upgrades when those lessons arrive (express-rate-limit 7 renamed `max` → `limit`; xss-clean is unmaintained).

## Course workflow

- When Ilya asks for help implementing something, explain the concept and show the code inline — don't write it to his files unless he explicitly asks.
- If he's stuck, compare his code against `../final/` mentally and point out specific differences rather than dumping the whole reference.
- After a lesson he runs `/lesson-explain`; he often asks to commit afterwards; push only when he says so.
