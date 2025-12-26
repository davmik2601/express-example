# Project Types Guide (JavaScript + JSDoc + .d.ts)

This project is **pure JavaScript (Node.js)**.  
It does **NOT** compile TypeScript.

TypeScript is used **only for type-checking and IDE support** via:

- `checkJs: true`
- JSDoc annotations in `.js` files
- `.d.ts` files stored in `/types`

This document explains **how types are structured**, **how to add new types**, and **how to use them in JavaScript code**.

---

## Why this setup

- Keep runtime code **100% JavaScript**
- Get **TypeScript-level safety**
- No imports in JS files
- Clean service & controller code
- Strong IDE autocomplete and error checking

---

## Project structure

```txt
src/
  controllers/
  services/
  routes/
  middlewares/
  db/
  ...
  server.js

types/
  auth/
  post/
  notification/
  user/
  ...
  global.d.ts
  success.type.d.ts
  limit-offset.dto.d.ts
  meta.type.d.ts
  zod.types.d.ts
  ...
```

---

## tsconfig.json (required)

```json
{
  "compilerOptions": {
    "target": "es2024",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "checkJs": true,
    "allowJs": true,
    "noEmit": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noImplicitAny": true,
    "useUnknownInCatchVariables": false,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "exactOptionalPropertyTypes": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strictPropertyInitialization": true,
    "strictNullChecks": true,
    "baseUrl": "./",
    "typeRoots": [
      "./node_modules/@types"
    ]
  },
  "include": [
    "src/**/*.js",
    "types/**/*.d.ts"
  ]
}
```

---

## Core concept

- All runtime code lives in `src/**/*.js`
- All types live in `types/**/*.d.ts`
- `types/global.d.ts` exposes **global namespaces**
- JavaScript files reference types **only via JSDoc**

Example:

```js
/**
 * @param {Auth.RegisterDto} data
 * @returns {Promise<SuccessType>}
 */
async function register(data) {}
```

---

## global.d.ts (single source of truth)

`global.d.ts`:

- Extends Express request
- Defines shared global types
- Exposes namespaces (`Auth`, `Posts`, `Db`, etc.)

```ts
declare global {
  // can be moved to a separate file like "express.d.ts" if needed
  namespace Express {
    interface Request {
      id: string,
      user?: AuthUserType,
      // ... other custom properties for req if implemented
    }
  }

  // can be moved to a separate file like "env.d.ts" if needed
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production',
      PORT?: string,
      PG_HOST: string,
      PG_USER: string,
      // ... other env vars
    }
  }

  type SuccessType = import('./success.type').SuccessType
  // ... other global types

  namespace Auth {
    type RegisterDto = import('./auth/dto/register.dto').RegisterDto
    type LoginDto = import('./auth/dto/login.dto').LoginDto
    type LoginType = import('./auth/types/login.type').LoginType
    // ... other auth types
  }
  
  namespace Post {
    type GetPostsDto = import('./post/dto/get-posts.dto').GetPostsDto
    type GetPostsType = import('./post/get-posts.type').GetPostsType
    // ... other post types
  }
  
  // ... other namespaces (Notification, User, etc.)

  namespace Db {
    type User = import('./user/user.d.ts').User
    type Post = import('./post/post.d.ts').Post
    // ... other db models
  }
}

export {}
```

---

## Environment variables typing

Environment variables are typed using **TypeScript declaration files** only.

Env types are defined by extending `NodeJS.ProcessEnv`
inside `types/global.d.ts` (or a dedicated `env.d.ts`).

```ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production'
      PORT?: string
      PG_HOST: string
      PG_USER: string
      // ... other env vars
    }
  }
}

export {}
```

Rules:

- All env variables must be declared here
- Required env vars must not be optional
- Optional vars must use `?`
- Values are always `string` at runtime
- This file contains **types only**, no runtime logic

Usage in JavaScript:

```js
const host = process.env.PG_HOST
const port = process.env.PORT

// this will show an IDE err if PORT_X is not defined
// const portX = process.env.PORT_X
```

## Writing a type file

Example: `types/auth/dto/register.dto.d.ts`

```ts
export interface RegisterDto {
  name: string
  email: string
  password: string
  age?: number
}
```

Rules:
- Types only
- No runtime logic
- One responsibility per file

---

## Using types in JavaScript

### Service

```js
class AuthService {
  /**
   * @param {Auth.RegisterDto} data
   * @returns {Promise<SuccessType>}
   */
  async register(data) {
    return { success: true }
  }
}
```

### Controller

```js
/**
 * @param {Express.Request & {body: Auth.RegisterDto}} req
 * @param {import('express').Response} res
 */
async function register(req, res) {
  /** @type {Auth.RegisterDto} */
  const dto = req.body

  // ...
}
```

### Variables

```js
/** @type {Db.User} */
const user = await userModel.findById(id)

// or

/** @type {Pick<Db.User, 'id' | 'name' | 'email' | 'age'>} */
const user = await pool.query(`
    select id    as "id",
           name  as "name",
           email as "email",
           age   as "age"
    from users 
    where id = $1
`, [id])
```

---

## DTO vs Type convention

- `*.dto.d.ts` → request / input
- `*.type.d.ts` → response / output
- `Db.*` → database models

---

## Adding a new type

### 1. Create the file

```txt
types/post/dto/update-post.dto.d.ts
```

```ts
export interface UpdatePostDto {
  id: number
  text?: string
}
```

### 2. Register it in global.d.ts

```ts
namespace Posts {
  // ...
  type UpdatePostDto = import('./post/dto/update-post.dto').UpdatePostDto
  // ...
}
```

### 3. Use it in JS

```js
/**
 * Update a post
 * @param {Posts.UpdatePostDto} data
 */
async function updatePost(data) {}
```

---

## Zod schemas with DTO-based typing

We use **Zod** for runtime validation, but we also want a **type-check hint** so our schemas are less likely to have:

- missing fields (DTO has it, schema forgot it)
- extra fields (schema has it, DTO doesn’t)
- wrong optional/required fields

Because this project is **JavaScript (not TypeScript)**, this is **best-effort type checking** via JSDoc + `.d.ts`.  
It helps a lot in the IDE.

- Keeping DTOs as interfaces in `types/**/*.d.ts`
- Using **JSDoc + generic Zod types**
- Sharing helper utility types globally

---

### Zod + DTO example

DTO definition (type-only):

```ts
// types/auth/dto/register.dto.d.ts
export interface RegisterDto {
  name: string
  email: string
  password: string
  age?: number
}
```

```js
import { z } from 'zod'

/** @type {import('zod').ZodObject<ZodShapeFor<Auth.RegisterDto>>} */
export const registerBodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(6).max(100),
  age: z.number().int().positive().optional(),
})
```

### What this gives us

- Zod validates runtime data
- TypeScript provides **best-effort checking** that the schema shape follows `Auth.RegisterDto`
- Helps avoid **missing fields** (DTO has a field, schema forgot it)
- Helps avoid **extra fields** (schema has a field not present in DTO)
- Required / optional fields usually stay in sync
- IDE shows errors and warnings early

---

### ZodShapeFor (GLOBAL helper type)

To make the above possible, we expose `ZodShapeFor<T>` **globally**.

This utility maps:

- required DTO fields → required Zod keys
- optional DTO fields → optional Zod keys

Add this **once** in `types/global.d.ts`:

```ts
type ZodShapeFor<T> =
  { [K in RequiredKeys<T>]: ZodTypeAny } &
  { [K in OptionalKeys<T>]?: ZodTypeAny }
```

---

### RequiredKeys / OptionalKeys helpers

These helpers live in `types/zod.types.d.ts`:

```ts
type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]
```

They allow TypeScript to **approximately understand**:

- which DTO fields are required
- which DTO fields are optional

This information is then reused by `ZodShapeFor<T>` when typing Zod schemas.

---

## Summary

- Runtime = JavaScript
- Types = `.d.ts`
- Validation = JSDoc
- No imports in JS
- `global.d.ts` controls everything

This setup keeps code clean, typed, and scalable without converting the project to TypeScript.
