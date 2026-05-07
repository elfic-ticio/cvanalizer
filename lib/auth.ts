import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db";
import { resend } from "@/lib/resend";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.RESEND_FROM_EMAIL!,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        await resend.emails.send({
          from: provider.from!,
          to: email,
          subject: "Sign in to CVMatch",
          html: `
            <div style="font-family:monospace;max-width:480px;margin:0 auto;padding:40px 24px;background:#0a0a0a;color:#e8e8e8">
              <p style="font-size:11px;letter-spacing:0.3em;color:#c6f135;text-transform:uppercase;margin-bottom:16px">CVMatch</p>
              <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Your sign-in link</h1>
              <p style="color:#888;margin-bottom:32px;font-size:14px">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display:inline-block;background:#c6f135;color:#0a0a0a;padding:12px 28px;text-decoration:none;font-weight:700;font-size:14px">Sign in to CVMatch</a>
              <p style="color:#555;font-size:12px;margin-top:32px">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
});
