import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Auth0 from "next-auth/providers/auth0"
import Discord from "next-auth/providers/discord"
import JWT from "next-auth/jwt"

const handler = NextAuth({
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
        jwt({ token, trigger, session, account, user }) {
            if (trigger === "update") token.name = session.user.name
            if (account?.provider) {
                token.provider = account.provider
            }
            if (user?.id) {
                token.uid = user.id
            }
            return token
          },
          async session({ session, token }) {
            if (token?.accessToken) {
              session.accessToken = token.accessToken
            }
            session.provider = token?.provider
            session.sub = token.sub
            session.uid = token.uid
            return session
          },
      },
})
 

export const { handlers, signIn, signOut, auth } = handler

declare module "next-auth" {
    interface Session {
      accessToken?: string
      provider?: string
      sub?: string
      uid?: string
    }
  }
  
  declare module "next-auth/jwt" {
    interface JWT {
      accessToken?: string
      provider?: string
      uid?: string
    }
  }