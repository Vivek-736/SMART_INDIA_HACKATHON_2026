import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes accessible without signing in
const isPublicRoute = createRouteMatcher([
  "/",
  "/patient/login(.*)",
  "/doctor/login(.*)",
  "/hospital/login(.*)",
  "/api/uploadthing(.*)",
]);

// Role-protected routes
const isPatientRoute = createRouteMatcher(["/patient/(.*)"]);
const isDoctorRoute = createRouteMatcher(["/doctor/(.*)", "/api/consultations/(.*)"]);
const isHospitalRoute = createRouteMatcher(["/hospital/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();

  // If public route, let through
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all non-public routes
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

  const role = (session.sessionClaims?.metadata as { role?: string })?.role || "patient";

  // Enforce role-based boundaries
  if (isDoctorRoute(req) && role !== "doctor") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }

  if (isHospitalRoute(req) && role !== "hospital_admin") {
    return NextResponse.redirect(new URL("/patient/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};