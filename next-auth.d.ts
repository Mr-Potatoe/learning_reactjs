import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email: string
    emailVerified: Date | null
    password: string
    image?: string | null
    createdAt: Date
    updatedAt: Date
  }
}
