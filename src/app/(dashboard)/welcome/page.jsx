"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const WelcomePage = () => {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user?.publicMetadata.role;

    if (role) {
      router.push(`/${role}`); // Redirect dynamically based on role
    } else {
      console.log("No role found. Redirecting to /dashboard");
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  return (
   
      <div className="text-center flex justify-center items-center px-4 py-6 rounded-md shadow-lg bg-purple-100">
        <p className="text-lg font-semibold">Welcome, {user?.firstName}!</p>
        
      </div>
    
  );
};

export default WelcomePage;
