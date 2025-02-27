import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccessMap } from "./lib/settings";

const matchers = Object.keys(routeAccessMap).map(route => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route]
}));

export default clerkMiddleware(async (auth, req) => {
  try {
    const { sessionId, sessionClaims } = await auth();
    const role =sessionClaims?.public_metadata?.role
    const path = req.nextUrl.pathname;

    console.log("--- Middleware Start ---");
    console.log("Middleware - Request URL:", req.url); // Log full URL
    console.log("Middleware - Request Pathname:", path);
    console.log("Middleware - SessionId:", sessionId);
    console.log("Middleware - sessionclaim:", sessionClaims);
    console.log("Middleware - Role:", role);

    // 1. Public Routes
    if (routeAccessMap[path] === undefined || routeAccessMap[path].length === 0) {
      console.log("Middleware - Public Route. Allowing.");
      return NextResponse.next();
    }

    // 2. Authentication Check
    if (!sessionId) {
      console.log("Middleware - No SessionId. Redirecting to /sign-in");
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // 3. Role-Based Authorization
    for (const { matcher, allowedRoles } of matchers) {
      if (matcher(req) && allowedRoles && allowedRoles.length > 0) {
        console.log("Middleware - Route Match found for pattern:", matcher.toString()); // Log the matcher pattern
        console.log("Middleware - Allowed Roles for this route:", allowedRoles); // Log allowed roles
        if (!role || !allowedRoles.includes(role)) {
          console.log("Middleware - Unauthorized Role:", role, "for path:", path, ". Redirecting to /unauthorized");
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        } else {
          console.log("Middleware - Authorized Role:", role, "for path:", path, ". Allowing.");
          return NextResponse.next();
        }
      } else if (matcher(req)) { // Add log for when matcher matches but no roles
        console.log("Middleware - Route Match found for pattern:", matcher.toString(), "but no roles defined in routeAccessMap.");
      }
    }

    // 4. Fallback
    console.log("Middleware - Route not explicitly protected in routeAccessMap, allowing access (Fallback).");
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware - Authentication error:", error);
    return NextResponse.redirect(new URL('/error', req.url));
  } finally {
    console.log("--- Middleware End ---");
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sign-in|unauthorized|error|api|applynow|aboutMuslimschool|proprietor|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};