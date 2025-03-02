"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const WelcomePage = () => {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // Wait for authentication to load

    console.log("🟢 WelcomePage - Checking user role...");
    const role = user?.publicMetadata?.role;
    const rolePath = role ? `/${role}` : "/dashboard";

    console.log(`🔍 Detected Role: ${role || "❌ None"}
      - Current Path: ${window.location.pathname}
      - Target Path: ${rolePath}`);

    if (role && window.location.pathname !== rolePath) {
      console.log(`🔄 Redirecting to: ${rolePath}`);
      router.push(rolePath);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="text-center flex justify-center items-center px-4 py-6 rounded-md shadow-lg bg-purple-100">
      <p className="text-lg font-semibold">Welcome, {user?.username}!</p>
    </div>
  );
};

export default WelcomePage;
