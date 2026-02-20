import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

/**
 * Allowed email domains for login.
 * Only users with email addresses ending in one of these domains
 * will be permitted to sign in.
 */
const ALLOWED_DOMAINS = ["gocase.com", "gobeaute.com.br"]

function isAllowedEmail(email: string | null | undefined): boolean {
    if (!email) return false
    const domain = email.split("@")[1]?.toLowerCase()
    return ALLOWED_DOMAINS.includes(domain)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        signIn({ user }) {
            return isAllowedEmail(user.email)
        },
        session({ session }) {
            // Session already includes user.email by default
            return session
        },
    },
})
