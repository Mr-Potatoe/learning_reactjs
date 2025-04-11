import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcrypt'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        
        if (user && await compare(credentials.password, user.password)) {
          // Cast the `id` to a string for compatibility with NextAuth
          return { ...user, id: user.id.toString() }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user id to the session from the JWT token
      if (session.user && token.sub) {
        session.user.id = token.sub as string
      }
      return session
    },
    async jwt({ token, user }) {
      // On successful login, add user data to the JWT token
      if (user) {
        token.sub = user.id
        token.email = user.email
      }
      return token
    },
  },
})

export { handler as GET, handler as POST }
