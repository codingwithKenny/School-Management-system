import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map(route => ({
  matcher: createRouteMatcher([route]),
  allowedRole: routeAccessMap[route]
}));

export default clerkMiddleware(async (auth, req) => {
  try {
    const { sessionId, sessionClaims } = await auth();

    // Redirect unauthenticated users to /sign-in
    if (!sessionId) {
      if (req.nextUrl.pathname !== "/sign-in") {
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
      return;
    }

    const role = sessionClaims?.metadata?.role;

    // Role-based access control for protected routes
    for (const { matcher, allowedRole } of matchers) {
      if (matcher(req) && (!role || !allowedRole.includes(role))) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect the /admin page (only admins can access)
    if (req.nextUrl.pathname === "/admin" && role !== "admin") {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|sign-in|unauthorized|error|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
