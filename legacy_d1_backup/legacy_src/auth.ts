import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getDB } from '@/lib/db';

// We use crypto.subtle for Edge-compatible hashing
async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: "Email or Mobile", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;
        
        try {
          const db = getDB();
          const { results } = await db.prepare(
            `SELECT * FROM users WHERE email = ? OR mobile_number = ?`
          ).bind(credentials.identifier, credentials.identifier).all();

          if (!results || results.length === 0) {
            throw new Error('User not found.');
          }

          const user = results[0] as any;

          if (user.approval_status !== 'APPROVED') {
            throw new Error(`Your account is currently ${user.approval_status}.`);
          }

          const hashedPassword = await hashPassword(credentials.password as string);
          if (hashedPassword !== user.password_hash) {
            throw new Error('Incorrect password.');
          }

          // Return the user object to be saved in the JWT session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department_id: user.department_id,
          };
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department_id = (user as any).department_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).department_id = token.department_id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  trustHost: true
});
