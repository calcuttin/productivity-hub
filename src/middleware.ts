import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If the user is not authenticated and trying to access a protected route
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require authentication for all routes
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
}; 