import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Restore base64 padding characters
    while (base64.length % 4) {
      base64 += '=';
    }
    return JSON.parse(atob(base64));
  } catch (_) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('cgb_session')?.value;
  const path = request.nextUrl.pathname;

  // Add x-pathname header so Layout files can identify the active route
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', path);

  // Protect admin sub-routes (exclude login page)
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      // If user is already logged in and token is valid, redirect to dashboard
      if (token) {
        const payload = decodeJwtPayload(token);
        if (payload && payload.exp && Date.now() < payload.exp * 1000) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        }
      });
    }

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('cgb_session');
      return response;
    }
      
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('cgb_session');
      return response;
    }

    // Role-based access control
    // STAFF cannot access settings, branches, or staff user management
    const isStaffRestrictedPath = 
      path.startsWith('/admin/settings') || 
      path.startsWith('/admin/branches') || 
      path.startsWith('/admin/users');

    if (isStaffRestrictedPath && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
