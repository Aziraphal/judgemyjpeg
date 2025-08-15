import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      nickname?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    nickname?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    nickname?: string | null
  }
}