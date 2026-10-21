import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import {
  getUserWithRoles,
  recordStudentLogin,
} from './lib/db';

let lastAuthError = null;

export function getLastAuthError() {
  return lastAuthError;
}

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET =
    process.env.NEXTAUTH_SECRET ||
    'academic-erp-production-secret-auth-key-2026-fallback-secure';
}

if (!process.env.AUTH_TRUST_HOST) {
  process.env.AUTH_TRUST_HOST = 'true';
}

const ROLE_PRIORITY = [
  'ADMIN',
  'PRINCIPAL',
  'HOD',
  'CHIEF_SUPERINTENDENT',
  'WARDEN',
  'RESEARCH_SUPERVISOR',
  'FACULTY',
  'CLUB_COORDINATOR',
  'RESEARCH_SCHOLAR',
  'NON_TEACHING_STAFF',
  'STUDENT',
];

function determineActiveRole(roles = []) {
  const codes = roles.map((r) => (typeof r === 'string' ? r : r.code));
  for (const p of ROLE_PRIORITY) {
    if (codes.includes(p)) return p;
  }
  return codes[0] || 'STUDENT';
}

function getAdminEmails() {
  const envAdmins = process.env.ADMIN_EMAILS || '';
  const list = envAdmins
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!list.includes('sureshmagnolia@gmail.com')) {
    list.push('sureshmagnolia@gmail.com');
  }

  return list;
}

const rawClientId =
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  '886464904597-pdp0mhb3kcb3dnt0pn7sosupgfc3frch.apps.googleusercontent.com';

const rawClientSecret =
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  '';

const googleClientId = rawClientId ? rawClientId.trim().replace(/^["']|["']$/g, '') : '';
const googleClientSecret = rawClientSecret ? rawClientSecret.trim().replace(/^["']|["']$/g, '') : '';

const providers = [
  Google({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  }),
  Credentials({
    id: 'demo-login',
    name: 'Quick Demo Access',
    credentials: {
      email: { label: 'Gmail Address', type: 'email' },
      role: { label: 'Role', type: 'text' },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      const email = credentials.email.trim().toLowerCase();

      // Check Admin
      const adminEmails = getAdminEmails();
      if (credentials.role === 'ADMIN' || adminEmails.includes(email)) {
        return {
          id: 'admin-' + email,
          name: 'Administrator',
          email: email,
          role: 'ADMIN',
          activeRole: 'ADMIN',
          roles: [
            { code: 'ADMIN', name: 'System Administrator', category: 'SYSTEM' },
            { code: 'PRINCIPAL', name: 'Principal / Director', category: 'EXECUTIVE' },
          ],
        };
      }

      // Check Multi-Role Database
      const user = await getUserWithRoles(email);
      if (user && user.status === 'ACTIVE') {
        await recordStudentLogin(email);
        const roles = user.roles || [{ code: user.primary_type || 'STUDENT', name: 'Student' }];
        const activeRole = determineActiveRole(roles);
        return {
          id: 'user-' + user.id,
          name: user.name,
          email: user.email,
          role: activeRole,
          activeRole,
          roles,
          userProfile: user,
        };
      }

      return null;
    },
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  debug: false,
  logger: {
    error(error) {
      console.error('NextAuth Error Logged:', error);
      lastAuthError = {
        name: error.name || 'Error',
        message: error.message || String(error),
        cause: error.cause ? (typeof error.cause === 'object' ? JSON.stringify(error.cause) : String(error.cause)) : null,
      };
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      if (account?.provider === 'demo-login') {
        return true;
      }

      const adminEmails = getAdminEmails();
      if (adminEmails.includes(email)) {
        return true;
      }

      try {
        const dbUser = await getUserWithRoles(email);
        if (dbUser) {
          if (dbUser.status === 'SUSPENDED') {
            return `/unauthorized?email=${encodeURIComponent(email)}&reason=suspended`;
          }
          if (dbUser.status === 'ACTIVE') {
            await recordStudentLogin(email);
            return true;
          }
        }
      } catch (err) {
        console.error('Error verifying user during sign in:', err);
      }

      // Allow Google authentication so applicants can sign in with their Gmail
      // to access dynamic QR / activation links, submit join requests, and track verification
      if (account?.provider === 'google') {
        return true;
      }

      return `/unauthorized?email=${encodeURIComponent(email)}`;
    },

    async jwt({ token, user, trigger, session }) {
      // Support client-triggered active role switch
      if (trigger === 'update' && session?.activeRole) {
        token.activeRole = session.activeRole;
        token.role = session.activeRole;
        return token;
      }

      if (user) {
        token.roles = user.roles || [];
        token.activeRole = user.activeRole || user.role;
        token.role = token.activeRole;
        token.userProfile = user.userProfile;
      }

      if (token.email) {
        const cleanEmail = token.email.toLowerCase();
        const adminEmails = getAdminEmails();

        try {
          const dbUser = await getUserWithRoles(cleanEmail);
          let assignedRoles = dbUser?.roles || [];

          if (adminEmails.includes(cleanEmail)) {
            if (!assignedRoles.some((r) => r.code === 'ADMIN')) {
              assignedRoles.unshift({ code: 'ADMIN', name: 'System Administrator', category: 'SYSTEM' });
            }
            if (!assignedRoles.some((r) => r.code === 'PRINCIPAL')) {
              assignedRoles.push({ code: 'PRINCIPAL', name: 'Principal / Director', category: 'EXECUTIVE' });
            }
          }

          if (assignedRoles.length === 0) {
            assignedRoles = [{ code: 'STUDENT', name: 'Student', category: 'LEARNER' }];
          }

          // Deduplicate roles to ensure each role only appears once
          const seenJwt = new Set();
          const uniqueJwtRoles = [];
          for (const r of assignedRoles) {
            const code = typeof r === 'string' ? r : r.code;
            const dept = typeof r === 'object' ? (r.department || '') : '';
            const key = `${code}_${dept}`;
            if (!seenJwt.has(key)) {
              seenJwt.add(key);
              uniqueJwtRoles.push(r);
            }
          }
          token.roles = uniqueJwtRoles;
          if (!token.activeRole) {
            token.activeRole = determineActiveRole(assignedRoles);
            token.role = token.activeRole;
          }
          token.userProfile = dbUser || null;
          token.isEnrolled = Boolean(dbUser && dbUser.status === 'ACTIVE');
        } catch (err) {
          console.error('Error building JWT token roles:', err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Strict deduplication of session roles to instantly cleanse existing client cookies
        const seen = new Set();
        const unique = [];
        for (const r of (token.roles || [])) {
          const code = typeof r === 'string' ? r : r.code;
          const dept = typeof r === 'object' ? (r.department || '') : '';
          const key = `${code}_${dept}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
          }
        }
        session.user.roles = unique.length > 0 ? unique : [{ code: 'STUDENT', name: 'Student' }];
        session.user.activeRole = token.activeRole || 'STUDENT';
        session.user.role = token.activeRole || 'STUDENT';
        session.user.profile = token.userProfile || null;
        session.user.isEnrolled = Boolean(token.isEnrolled);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/',
    error: '/unauthorized',
  },
});
