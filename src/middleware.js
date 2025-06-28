import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const url = req.nextUrl.clone();

  if (!token) {
    console.warn("Access denied: No token found");
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  



  return NextResponse.next();
}

export const config = {
  matcher: ["/page/:path*"],
};
