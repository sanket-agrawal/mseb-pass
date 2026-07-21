import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static assets, images, favicon, api routes, and public gatepass view link
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/gatepass/view/') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Check auth token cookie
  const authToken = request.cookies.get('mseb_auth_token');

  // If no auth token cookie, redirect to login page
  if (!authToken || !authToken.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
