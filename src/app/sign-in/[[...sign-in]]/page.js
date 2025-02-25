"use client";

import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  // Redirect immediately after successful sign-in
  useEffect(() => {
    if (isSignedIn && user) {
      const userRole = user.publicMetadata?.role || "dashboard";
      router.push(`/${userRole}`);
    }
  }, [isSignedIn, user, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;

    setLoading(true);

    const formData = new FormData(event.target);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      const result = await signIn.create({ identifier, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId }); // Efficiently set session
      }
    } catch (error) {
      console.error("Login failed:", error.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white p-12 rounded-md shadow-lg w-96">
        <h1 className="text-xl font-bold text-center mb-4">E-Portal</h1>
        <h2 className="text-gray-500 text-center mb-6">Sign in to your account</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-500">Username or Email</label>
            <input
              type="text"
              name="identifier"
              required
              className="w-full p-2 rounded-md border border-gray-300"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-2 rounded-md border border-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-500 text-white py-2 rounded-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/forgot-password" className="text-sm text-purple-500">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
