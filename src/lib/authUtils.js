import { auth } from "@clerk/nextjs/server";

// ✅ Function to get the current user's ID & role
export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth();
  return {
    userId,
    role: sessionClaims?.metadata?.role,
    sessionClaims // Default to 'guest' if undefined
  };
}

// ✅ Export individual properties for easier imports
export async function getUserId() {
  const { userId } = await getCurrentUser();
  return userId;
}

export async function getUserRole() {
  const { role } = await getCurrentUser();
  return role;
}
