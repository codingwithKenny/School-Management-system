"use client";

import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoaded } = useSignIn();
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (user) {
      setRole(user.publicMetadata.role || "dashboard"); // Default role
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isLoaded) return;

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier,
        password,
      });

      if (result.status === "complete") {
        const userRole = user?.publicMetadata.role || "dashboard";
        router.push(`/${userRole}`);
      }
    } catch (error) {
      console.error("Login failed:", error.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-purple-50">
      <SignIn.Root fallbackRedirectUrl={`/${role || "/sign-in"}`}>
        <SignIn.Step
          name="start"
          className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
          onSubmit={handleSubmit} // Attach handleSubmit here
        >
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Image src="/logo.png" alt="E-Portal Logo" width={38} height={38} />
            E-Portal
          </h1>
          <h2 className="text-gray-400 mt-2">Sign in to your account</h2>
          <Clerk.GlobalError className="text-sm text-red-400" />

          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500 mt-2">
              Username or Email
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-xs text-gray-500">Password</Clerk.Label>
            <Clerk.Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded-md ring-1 ring-purple-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <SignIn.Action
            submit
            disabled={loading}
            className={`bg-purple-400 text-white my-1 rounded-md text-sm p-[10px] ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </SignIn.Action>

          <div className="text-right mt-2">
            <a href="/forgot-password" className="text-sm text-purple-500">
              Forgot your password?
            </a>
          </div>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;
