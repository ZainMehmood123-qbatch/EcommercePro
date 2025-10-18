// // src/middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// // Ensure console.log works in dev
// export const runtime = 'nodejs';

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Skip Next.js internals, API routes, and static files
//   const ignoredPaths = [
//     '/api',
//     '/_next/static',
//     '/_next/image',
//     '/favicon.ico',
//     '.png', '.jpg', '.jpeg', '.svg', '.webp'
//   ];
//   if (ignoredPaths.some((path) => pathname.includes(path) || pathname.endsWith(path))) {
//     return NextResponse.next();
//   }

//   // Get NextAuth token
//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//     secureCookie: process.env.NODE_ENV === 'production'
//   });

//   console.log('Middleware running for:', pathname);
//   console.log('Token:', token);

//   // Public routes (anyone can access)
//   const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password', '/auth/forgot-password'];
//   if (publicRoutes.includes(pathname)) {
//     // Redirect logged-in users away from login/signup
//     if (token && (pathname === '/auth/login' || pathname === '/auth/signup')) {
//       if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/orders', req.url));
//       if (token.role === 'USER') return NextResponse.redirect(new URL('/user/shopping-bag', req.url));
//     }
//     return NextResponse.next();
//   }

//   // Shared routes (both USER and ADMIN can access)
//   const sharedRoutes = ['/order-details'];
//   if (sharedRoutes.some((route) => pathname.startsWith(route))) {
//     if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
//     return NextResponse.next();
//   }

//   // User-only routes
//   const userRoutes = ['/user/shopping-bag', '/user/orders'];
//   if (userRoutes.some((route) => pathname.startsWith(route))) {
//     if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
//     if (token.role !== 'USER') return NextResponse.redirect(new URL('/unauthorized', req.url));
//   }

//   // Admin-only routes
//   const adminRoutes = ['/admin/orders', '/admin/products'];
//   if (adminRoutes.some((route) => pathname.startsWith(route))) {
//     if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
//     if (token.role !== 'ADMIN') return NextResponse.redirect(new URL('/unauthorized', req.url));
//   }

//   return NextResponse.next();
// }

// // Apply middleware to all routes except Next.js internals and API
// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)']
// };

// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { validationMap } from '@/lib/schemaMap'; 

export const runtime = 'nodejs';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Skip Next.js internals, static, etc.
  const ignoredPaths = [
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '.png', '.jpg', '.jpeg', '.svg', '.webp'
  ];
  if (ignoredPaths.some((path) => pathname.includes(path) || pathname.endsWith(path))) {
    return NextResponse.next();
  }

  // ✅ Validation before API hit
  if (pathname.startsWith('/api')) {
    const matched = validationMap.find((rule) => {
      if (rule.method !== req.method) return false;
      if (rule.path instanceof RegExp) return rule.path.test(pathname);
      return rule.path === pathname;
    });

    if (matched) {
      try {
        const body = await req.json();

        const { error } = matched.schema.validate(body, { abortEarly: false });
        if (error) {
          return NextResponse.json(
            { success: false, errors: error.details.map((e) => e.message) },
            { status: 400 }
          );
        }

      
        const validatedBody = JSON.stringify(body);
        const validatedRequest = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: validatedBody
        });
        (req as any).validatedRequest = validatedRequest;
      } catch (e) {
        console.error('Middleware validation error:', e);
        return NextResponse.json(
          { success: false, message: 'Invalid JSON body' },
          { status: 400 }
        );
      }
    }

    // continue to API
    return NextResponse.next();
  }

  // ✅ Normal role-based routing (your original code)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password', '/auth/forgot-password'];
  const sharedRoutes = ['/order-details'];
  const userRoutes = ['/user/shopping-bag', '/user/orders'];
  const adminRoutes = ['/admin/orders', '/admin/products'];

  if (publicRoutes.includes(pathname)) {
    if (token && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/orders', req.url));
      if (token.role === 'USER') return NextResponse.redirect(new URL('/user/shopping-bag', req.url));
    }
    return NextResponse.next();
  }

  if (sharedRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    return NextResponse.next();
  }

  if (userRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    if (token.role !== 'USER') return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    if (token.role !== 'ADMIN') return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
