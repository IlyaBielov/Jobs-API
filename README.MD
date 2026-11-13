# Jobs API

REST API for tracking job applications. Users register / log in with JWT and manage only their own jobs.
Built while following the "Jobs API" section of a Node.js / Express course.

- **Live:** https://jobs-api-ope4.onrender.com
- **Docs (Swagger UI):** https://jobs-api-ope4.onrender.com/api-docs

> Hosted on Render's free tier — the first request after ~15 min of inactivity can take 30–60 s.

## Tech stack

Node.js 22 · Express 4 · MongoDB Atlas + Mongoose 9 · JWT (jsonwebtoken 9) · bcryptjs ·
helmet · cors · xss-clean · express-rate-limit · swagger-ui-express + yamljs

## Getting started

```bash
npm install
npm run dev   # nodemon, auto-reload
npm start     # plain node (used in production)
```

Create `.env` in the project root:

```env
PORT=5000
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random string>
JWT_LIFETIME=30d
```

Then open http://localhost:5000/api-docs.

## API

Base URL: `/api/v1`. All `/jobs` routes require `Authorization: Bearer <token>`.

| Method | Route            | Description                                           |
|--------|------------------|-------------------------------------------------------|
| POST   | `/auth/register` | Register — returns `{ user: { name }, token }`        |
| POST   | `/auth/login`    | Login — returns `{ user: { name }, token }`           |
| GET    | `/jobs`          | All jobs of the current user — `{ jobs, count }`      |
| POST   | `/jobs`          | Create job (`company`, `position`, optional `status`) |
| GET    | `/jobs/:id`      | Single job                                            |
| PATCH  | `/jobs/:id`      | Update job (partial)                                  |
| DELETE | `/jobs/:id`      | Delete job                                            |

`status` is one of `interview`, `declined`, `pending` (default).

Errors always come back as `{ msg }`:

| Case                                       | Status |
|--------------------------------------------|--------|
| Mongoose validation error                  | 400    |
| Duplicate email (code 11000)               | 400    |
| Missing / invalid token, wrong credentials | 401    |
| Job not found, or invalid id (CastError)   | 404    |

## Project structure

```
app.js                    # middleware, routes, Swagger, start()
db/connect.js             # mongoose.connect
models/User.js            # validation, pre('save') hashing, createJWT, comparePassword
models/Job.js             # company, position, status, createdBy -> User
controllers/auth.js       # register, login
controllers/jobs.js       # CRUD scoped to req.user.userId
middleware/authentication.js  # verifies Bearer token, sets req.user
middleware/error-handler.js   # maps Mongoose/Mongo errors to status codes
errors/                   # CustomAPIError + BadRequest / Unauthenticated / NotFound
swagger.yaml              # OpenAPI 3.0 spec served at /api-docs
```

## Deployment ([Render](https://render.com))

Live: https://jobs-api-ope4.onrender.com · Docs: https://jobs-api-ope4.onrender.com/api-docs

- Build command: `npm install`, start command: `npm start`
- Environment: `MONGO_URI`, `JWT_SECRET`, `JWT_LIFETIME` (`PORT` is set by Render)
- MongoDB Atlas → Network Access must allow Render's IPs
- `app.set('trust proxy', 1)` so the rate limiter sees real client IPs behind Render's proxy
- Every push to `main` triggers an auto-deploy

## Differences from the course

- Mongoose 9: `pre('save')` without `next`, `{ returnDocument: 'after' }` instead of `{ new: true }`,
  `findOneAndDelete` instead of `findOneAndRemove`
- Deployed to Render instead of Heroku; Node 22 instead of 14
- `swagger.yaml` uses a relative server (`/api/v1`), so "Try it out" works both locally and in production
- Auth middleware also checks that the user still exists in the database
