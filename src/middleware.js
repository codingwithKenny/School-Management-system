// middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routeAccessMap } from "./lib/settings"; // Import your routeAccessMap

const matchers = Object.keys(routeAccessMap).map(route => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route] // Use 'allowedRoles' for clarity (plural)
}));

export default clerkMiddleware(async (auth, req) => {
  try {
    const { sessionId, sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;
    const path = req.nextUrl.pathname;

    console.log("--- Middleware Start ---"); // Clear start/end logs
    console.log("Middleware - Request Path:", path);
    console.log("Middleware - SessionId:", sessionId);
    console.log("Middleware - Role:", role);

    // 1. Public Routes - Allow directly (no authentication required)
    if (routeAccessMap[path] === undefined || routeAccessMap[path].length === 0) {
      console.log("Middleware - Public Route. Allowing.");
      return NextResponse.next();
    }

    // 2. Authentication Check - Redirect to /sign-in if no session
    if (!sessionId) {
      console.log("Middleware - No SessionId. Redirecting to /sign-in");
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // 3. Role-Based Authorization - Check if role is allowed for the route
    for (const { matcher, allowedRoles } of matchers) {
      if (matcher(req) && allowedRoles && allowedRoles.length > 0) { // Check for roles and if route is in access map
        if (!role || !allowedRoles.includes(role)) {
          console.log("Middleware - Unauthorized Role:", role, "for path:", path, ". Redirecting to /unauthorized");
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        } else {
          console.log("Middleware - Authorized Role:", role, "for path:", path, ". Allowing.");
          return NextResponse.next(); // Role is authorized, allow access
        }
      }
    }

    // 4. Fallback - If route not explicitly in routeAccessMap (and not public), allow (you can adjust this as needed)
    console.log("Middleware - Route not explicitly protected in routeAccessMap, allowing access (Fallback).");
    return NextResponse.next(); // Or NextResponse.redirect('/unauthorized') if you want stricter default protection

  } catch (error) {
    console.error("Middleware - Authentication error:", error);
    return NextResponse.redirect(new URL('/error', req.url)); // Redirect to error page on middleware error
  } finally {
    console.log("--- Middleware End ---"); // Clear start/end logs
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sign-in|unauthorized|error|api|applynow|aboutMuslimschool|proprietor|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};