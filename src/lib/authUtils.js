import { auth } from "@clerk/nextjs/server";

const { userId, sessionClaims } = await auth();
export const role = sessionClaims?.metadata?.role;
export const currentUserId = userId;
