// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { validationMap } from '@/lib/schemaMap';

export const runtime = 'nodejs';

export interface ValidatedNextRequest extends NextRequest {
  validatedRequest?: Request;
}

export async function middleware(req: ValidatedNextRequest) {
  const { pathname } = req.nextUrl;
  const ignoredPaths = [
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp'
  ];
  if (
    ignoredPaths.some(
      (path) => pathname.includes(path) || pathname.endsWith(path)
    )
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    const matched = validationMap.find((rule) => {
      if (rule.method !== req.method) return false;
      if (rule.path instanceof RegExp) return rule.path.test(pathname);
      return rule.path === pathname;
    });

    if (matched) {
      try {
        // Only parse JSON for methods that have a body
        let body = {};
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          body = await req.json();
        }
        // Validate only if schema exists
        const { error } = matched.schema.validate(body, { abortEarly: false });
        if (error) {
          return NextResponse.json(
            { success: false, errors: error.details.map((e) => e.message) },
            { status: 400 }
          );
        }

        // Create new request with validated body
        const validatedBody = JSON.stringify(body);
        const validatedRequest = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: ['POST', 'PUT', 'PATCH'].includes(req.method)
            ? validatedBody
            : undefined
        });

        req.validatedRequest = validatedRequest;
      } catch (e) {
        console.error('Validation middleware error:', e);
        return NextResponse.json(
          { success: false, message: 'Invalid JSON body' },
          { status: 400 }
        );
      }
    }
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/forgot-password'
  ];
  const sharedRoutes = ['/order-details'];
  const userRoutes = ['/user/shopping-bag', '/user/orders'];
  const adminRoutes = ['/admin/orders', '/admin/products'];

  if (publicRoutes.includes(pathname)) {
    if (token && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      if (token.role === 'ADMIN')
        return NextResponse.redirect(new URL('/admin/orders', req.url));
      if (token.role === 'USER')
        return NextResponse.redirect(new URL('/user/shopping-bag', req.url));
    }
    return NextResponse.next();
  }

  if (sharedRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    return NextResponse.next();
  }

  if (userRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    if (token.role !== 'USER')
      return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    if (token.role !== 'ADMIN')
      return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
