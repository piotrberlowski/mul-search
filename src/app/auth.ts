import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { NextAuthConfig } from "next-auth"
import JWT from "next-auth/jwt"
import Auth0 from "next-auth/providers/auth0"
import Discord from "next-auth/providers/discord"
import Google from "next-auth/providers/google"
import prisma from "../../lib/prisma"

const adapter = (prisma) ? PrismaAdapter(prisma) : undefined

const handler = NextAuth({
    adapter: adapter,
    session: {
        strategy: "jwt"
    },
    providers: [
        Auth0({
            clientId: process.env.AUTH_AUTH0_ID,
            clientSecret: process.env.AUTH_AUTH0_SECRET,
            issuer: process.env.AUTH_AUTH0_ISSUER,
            redirectProxyUrl: process.env.AUTH_AUTH0_BASE_URL
        }),
        Google,
        Discord,
    ],
    callbacks: {
        jwt({ token, trigger, account, session, profile }) {
            if (trigger === "update") token.name = session.user.name
            if (profile?.sub) {
                token.sub = profile.sub
            }
            if (account?.providerAccountId) {
                token.externalAccount = account.providerAccountId
            }
            return token
        },
        async session({ session, token,  }) {
            if (token?.sub) {
                session.sub = token.sub
            }
            if (token?.externalAccount) {
                session.externalAccount = token.externalAccount

            }
            return session
        },
    },
    experimental: {
        enableWebAuthn: true,
    },
    debug: process.env.NODE_ENV !== "production" ? true : false,
} satisfies NextAuthConfig,
)

declare module "next-auth" {
    interface Session {
        externalAccount?: string
        sub?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        externalAccount?: string
        internalUser: string
    }
}

export const { handlers, signIn, signOut, auth } = handler
