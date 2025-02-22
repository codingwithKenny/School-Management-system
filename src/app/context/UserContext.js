"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("role") || null;
    }
    return null;
  });

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      setRole(user.publicMetadata.role);
      localStorage.setItem("role", user.publicMetadata.role);
    }
  }, [user?.publicMetadata?.role, isLoaded]);

  const value = useMemo(() => ({ role, isLoaded }), [role, isLoaded]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserRole() {
  return useContext(UserContext);
}
