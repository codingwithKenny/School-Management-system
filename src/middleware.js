import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map(route=>({
  matcher :createRouteMatcher([route]),
  allowedRole: routeAccessMap[route]
}))

console.log(matchers)

export default clerkMiddleware(async(auth,req)=>{
  try {
     // if(isProtectedRoute(req)) auth().protect()

     const {sessionId,sessionClaims} =await  auth()

     const role = sessionClaims?.metadata?.role;
    // console.log(role)
    // console.log(sessionId, 'sessionid')
    // console.log(sessionClaims, 'sessionclaims')

    for (const {matcher,allowedRole} of matchers){
      if (matcher(req) && !allowedRole.includes(role)){
        return NextResponse.redirect(new URL(`/${role}`, req.url))
      }
    } 
  } catch (error) {
    console.log(error) 
  }
     
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};