import { auth } from "@clerk/nextjs/server";

let cachedUser = null;

export async function getCurrentUser() {
  if (!cachedUser) {
    const { userId, sessionClaims } = await auth();
    cachedUser = {
      userId,
      role: sessionClaims?.metadata?.role || "guest", // Default to 'guest'
      sessionClaims,
    };
  }
  return cachedUser;
}

export async function getUserId() {
  const { userId } = await getCurrentUser();
  return userId;
}

export async function getUserRole() {
  const { role } = await getCurrentUser();
  return role;
}
