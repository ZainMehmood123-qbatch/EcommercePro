// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Ensure console.log works in dev
export const runtime = 'nodejs';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals, API routes, and static files
  const ignoredPaths = [
    '/api',
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '.png', '.jpg', '.jpeg', '.svg', '.webp'
  ];
  if (ignoredPaths.some((path) => pathname.includes(path) || pathname.endsWith(path))) {
    return NextResponse.next();
  }

  // Get NextAuth token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  console.log('Middleware running for:', pathname);
  console.log('Token:', token);

  // Public routes (anyone can access)
  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password', '/auth/forgot-password'];
  if (publicRoutes.includes(pathname)) {
    // Redirect logged-in users away from login/signup
    if (token && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/orders', req.url));
      if (token.role === 'USER') return NextResponse.redirect(new URL('/user/shopping-bag', req.url));
    }
    return NextResponse.next();
  }

  // Shared routes (both USER and ADMIN can access)
  const sharedRoutes = ['/order-details'];
  if (sharedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    return NextResponse.next();
  }

  // User-only routes
  const userRoutes = ['/user/shopping-bag', '/user/orders'];
  if (userRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    if (token.role !== 'USER') return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // Admin-only routes
  const adminRoutes = ['/admin/orders', '/admin/products'];
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    if (token.role !== 'ADMIN') return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes except Next.js internals and API
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
};
