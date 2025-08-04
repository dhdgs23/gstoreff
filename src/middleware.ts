import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const referralCode = request.nextUrl.searchParams.get('ref');

  if (referralCode) {
    // Set a cookie that expires in 7 days
    response.cookies.set('referral_code', referralCode, {
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return response;
}

export const config = {
  matcher: '/',
};
