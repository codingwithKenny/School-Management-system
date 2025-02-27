// import { auth } from "@clerk/nextjs/server";

// // ✅ Function to get the current user's ID & role
// export async function getCurrentUser() {
//   const { userId, sessionClaims } = await auth();
//   return {
//     userId,
//     role: sessionClaims?.metadata?.role || "guest", // Default to 'guest' if undefined
//   };
// }

// // ✅ Export individual properties for easier imports
// export async function getUserId() {
//   const { userId } = await getCurrentUser();
//   return userId;
// }

// export async function getUserRole() {
//   const { role } = await getCurrentUser();
//   return role;
// }



import { auth } from "@clerk/nextjs/server";

// ✅ Function to get the current user's ID & role (MODIFIED with logging)
export async function getCurrentUser() {
  console.log("getUserRole - Start getCurrentUser function"); // Added log at start

  const authResult = await auth(); // Get auth result
  const { userId, sessionClaims } = authResult;

  console.log("getUserRole - auth() result:", { userId, sessionClaims }); // Log auth() result

  let role = "guest"; // Default role
  if (sessionClaims?.metadata?.role) {
    role = sessionClaims.metadata.role;
  } else {
    console.log("getUserRole - sessionClaims?.metadata?.role is undefined. Using default role 'guest'."); // Log if role is undefined
    if (!sessionClaims) {
      console.log("getUserRole - sessionClaims is also undefined."); // Log if sessionClaims is undefined
    } else if (!sessionClaims.metadata) {
      console.log("getUserRole - sessionClaims.metadata is undefined."); // Log if metadata is undefined
    }
  }

  console.log("getUserRole - Extracted role:", role); // Log the extracted role

  return {
    userId,
    role: role,
  };
}

// ✅ Export individual properties for easier imports (No changes needed here)
export async function getUserId() {
  const { userId } = await getCurrentUser();
  return userId;
}

export async function getUserRole() {
  const role = await getCurrentUser();
  return role;
}