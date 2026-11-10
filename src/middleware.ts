import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, createAdminSessionToken, isValidAdminSession } from '@/lib/admin-session';
import { validBasicAuth } from '@/lib/verify-admin-basic';

function isAdminPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_USERNAME ?? 'Admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return new NextResponse('ADMIN_PASSWORD no configurada en el servidor.', { status: 503 });
  }

  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const sessionValid = await isValidAdminSession(
    sessionCookie,
    expectedUser,
    expectedPassword
  );

  if (sessionValid || validBasicAuth(authHeader, expectedUser, expectedPassword)) {
    const response = NextResponse.next();
    const token = await createAdminSessionToken(expectedUser, expectedPassword);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  }

  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return new NextResponse('Autenticación requerida.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Portal Gob MX Admin"',
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
