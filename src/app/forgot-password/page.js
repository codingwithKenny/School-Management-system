"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResetPassword() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [successfulVerification, setSuccessfulVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle redirection after sign-in
  useEffect(() => {
    if (isSignedIn) {
      router.push("/welcome");
    }
  }, [isSignedIn, router]);

  async function verifyEmail(e) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulVerification(true);
      setErrorMessage("");
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
      setErrorMessage(
        error?.errors?.[0]?.message || error?.message || "Failed to send verification code."
      );
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        alert("Password reset successful! You can now sign in.");
        router.push("/sign-in");
      }
    } catch (error) {
      setErrorMessage(
        error?.errors?.[0]?.message || error?.message || "Failed to reset password."
      );
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-center mb-4">
          {successfulVerification ? "Enter Reset Code" : "Reset Password"}
        </h2>

        <form onSubmit={successfulVerification ? handleReset : verifyEmail} className="space-y-4">
          {!successfulVerification ? (
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </>
          )}

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
            {successfulVerification ? "Reset Password" : "Verify"}
          </button>
        </form>

        {errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}
      </div>
    </div>
  );
}
