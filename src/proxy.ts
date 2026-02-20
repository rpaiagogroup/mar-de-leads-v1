export { auth as proxy } from "@/auth"

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api/auth (Auth.js routes)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, logo_icon.png (public assets)
         */
        "/((?!api/auth|_next/static|_next/image|favicon\\.ico|logo_icon\\.png).*)",
    ],
}
