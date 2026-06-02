# peta-demo

Demo project showcasing how [peta-hono](https://npmjs.com/package/peta-hono), [peta-orm](https://npmjs.com/package/peta-orm), and [peta-auth](https://npmjs.com/package/peta-auth) work together.

## Stack

- **Runtime:** Bun
- **Framework:** Hono
- **ORM:** peta-orm (with kysely-bun-sqlite)
- **Auth:** peta-auth (session cookies)
- **API:** peta-hono (route builder, OpenAPI, Scalar docs)
- **Validation:** ArkType
- **Logging:** Pino + pino-pretty
- **Formatting:** Biome

## Setup

```bash
bun install
cp .env.example .env  # configure SESSION_SECRET (min 32 chars)
bun run dev
```

## Usage

```bash
# Browse API docs
open http://localhost:4300/docs

# Get OpenAPI spec
curl http://localhost:4300/openapi.json

# Register a user
curl -X POST http://localhost:4300/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

# Create a post
curl -X POST http://localhost:4300/api/posts \
  -H 'Content-Type: application/json' \
  -H 'Cookie: blog_session=<session>' \
  -d '{"title":"Hello","slug":"hello","content":"World"}'

# List posts (with filtering and sorting)
curl "http://localhost:4300/api/posts?published=1&sort=-createdAt"

# Get a post with relations
curl "http://localhost:4300/api/posts/1?include=author,comments"

# Comment on a post
curl -X POST http://localhost:4300/api/comments \
  -H 'Content-Type: application/json' \
  -H 'Cookie: blog_session=<session>' \
  -d '{"postId":1,"content":"Nice!"}'
```

## Project structure

```
src/
├── index.ts          # App entry, middleware, error handler
├── db.ts             # Database instance + migration
├── helpers.ts        # Utility helpers (pick)
├── errors.ts         # HTTP error helpers (notFound, forbidden, ...)
├── logger.ts         # Pino logger instance
├── types.ts          # AppEnv type
├── models/           # peta-orm models
│   ├── index.ts      # Barrel (re-exports)
│   ├── user.ts
│   ├── post.ts
│   └── comment.ts
├── middleware/
│   └── auth.ts       # requireAuth middleware
└── routes/           # Route modules (auto-discovered by loadRoutes)
    ├── auth/
    │   ├── index.ts
    │   └── schema.ts
    ├── posts/
    │   ├── index.ts
    │   └── schema.ts
    └── comments/
        ├── index.ts
        └── schema.ts
```

## Features

- Session-based authentication (register, login, logout, me)
- Full CRUD for posts and comments
- Ownership checks (users can only edit/delete their own content)
- Pagination via `.paginated()`
- Dynamic filtering via `.filter()`
- Dynamic sorting via `.sort()`
- Optional relation loading via `.include()`
- Eager loading via `.with()`
- Conditional query building via `.when()` / `.unless()`
- ID coercion via ArkType `.pipe()`
- OpenAPI spec at `/openapi.json`
- Interactive API docs at `/docs` (Scalar)
- Structured error responses (production-safe)
- Request logging via Pino
