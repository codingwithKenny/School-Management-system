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
    const role = sessionClaims?.metadata?.role;
    const path = req.nextUrl.pathname;

    console.log("Request Path:", path, "Session:", sessionId, "Role:", role);

    // Explicitly allow unauthenticated users to access "/"
    if (path === "/") {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to /sign-in (excluding "/")
    if (!sessionId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Role-based access control for protected routes (excluding "/")
    for (const { matcher, allowedRole } of matchers) {
      if (path !== "/" && matcher(req) && (!role || !allowedRole.includes(role))) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Protect the /admin page (only admins can access)
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|sign-in|unauthorized|error|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
