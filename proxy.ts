import { NextResponse } from "next/server";
import { 
  clerkMiddleware, 
  createRouteMatcher 
} from "@clerk/nextjs/server";

// Public routes accessible without signing in
const isPublicRoute = createRouteMatcher([
  "/",
  "/patient/login(.*)",
  "/doctor/login(.*)",
  "/hospital/login(.*)",
  "/api/uploadthing(.*)",
  "/api/speech(.*)",
  "/kiosk(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();

  // 1. If public route, let through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Protect all non-public routes
  if (!session.userId) {
    const path = req.nextUrl.pathname;
    let loginUrl = new URL("/patient/login", req.url);
    if (path.startsWith("/doctor")) {
      loginUrl = new URL("/doctor/login", req.url);
    } else if (path.startsWith("/hospital")) {
      loginUrl = new URL("/hospital/login", req.url);
    }
    loginUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // based on database records and verified physician email whitelist.
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
  ],
};