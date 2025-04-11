# Fullstack CRUD App with Next.js (App Router), Prisma, Zod & Server Actions

This project is a full-stack CRUD (Create, Read, Update, Delete) application built with the latest tools:

- **Next.js 14+** with **App Router**
- **Prisma** as the ORM for database interaction
- **Zod** for form and input validation
- **Server Actions** for handling mutations (create, update, delete)
- **SQLite** for the database (easy to get started)

---

## Features

- Create new users
- List all users
- Edit/update user details
- Delete users
- Validates inputs using Zod
- Uses server actions (not traditional API routes)
- No external dependencies or UI libraries

---

## Setup Instructions

### 1. Clone the Repository

```bash
npx create-next-app@latest my-crud-app --ts --app
cd my-crud-app
```

### 2. Install Dependencies

```bash
npm install prisma @prisma/client zod
```

### 3. Initialize Prisma

```bash
npx prisma init
```

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
```

Run migration:

```bash
npx prisma migrate dev --name init
```

### 4. Add Prisma Client Setup

Create `lib/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Server Actions

Create `app/actions/userActions.ts`:

```ts
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
  };

  const parsed = CreateUserSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid data');

  await prisma.user.create({ data: parsed.data });
  revalidatePath('/');
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  revalidatePath('/');
}

const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
});

export async function updateUser(formData: FormData) {
  const raw = {
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
  };

  const result = UpdateUserSchema.safeParse(raw);
  if (!result.success) throw new Error('Invalid data');

  const { id, name, email } = result.data;
  await prisma.user.update({ where: { id: parseInt(id) }, data: { name, email } });
  revalidatePath('/');
}
```

---

## UI Components

### `app/_components/UserList.tsx`

```tsx
'use client';

import { deleteUser, updateUser } from '../actions/userActions';
import { useState } from 'react';

export function UserList({ users }: { users: { id: number, name: string, email: string }[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <ul className="space-y-2">
      {users.map(user => (
        <li key={user.id} className="border p-2 rounded">
          {editingId === user.id ? (
            <form action={updateUser} onSubmit={() => setEditingId(null)} className="space-y-2">
              <input type="hidden" name="id" value={user.id} />
              <input name="name" defaultValue={user.name} className="border p-1 w-full" />
              <input name="email" defaultValue={user.email} className="border p-1 w-full" />
              <button type="submit" className="bg-green-600 text-white px-3 py-1">Save</button>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <strong>{user.name}</strong> — {user.email}
              </div>
              <div className="space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setEditingId(user.id)}
                >
                  Edit
                </button>
                <form action={async () => await deleteUser(user.id)}>
                  <button type="submit" className="text-red-600 hover:underline">Delete</button>
                </form>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
```

---

## Main Page

### `app/page.tsx`

```tsx
import { createUser } from './actions/userActions';
import { prisma } from '@/lib/prisma';
import { UserList } from './_components/UserList';

export default async function Home() {
  const users = await prisma.user.findMany();

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Users</h1>

      <form action={createUser} className="mb-6 space-y-2">
        <input name="name" placeholder="Name" className="border p-2 w-full" />
        <input name="email" placeholder="Email" className="border p-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">Add User</button>
      </form>

      <UserList users={users} />
    </main>
  );
}
```

---

## Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

You now have a full CRUD app with SSR, Prisma, Zod validation, and Server Actions!

---

## What’s Next?

- Add client-side feedback with **React Toast**
- Add loading indicators with `useTransition`
- Switch to **MySQL or PostgreSQL** in production
- Add **authentication** with NextAuth.js
- Add form error handling UI

Let me know if you want any of these improvements next!

