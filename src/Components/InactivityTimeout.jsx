"use client";

import { useIdleTimer } from "react-idle-timer";
import { toast } from "@/hooks/use-toast"; // optional for notifications
import { useClerk } from "@clerk/nextjs";

const InactivityTimeout = () => {
    const { signOut } = useClerk();

  const handleOnIdle = () => {
    // Optionally, display a message before signing out
    toast({
      description: "You've been inactive for a while. Signing out for security reasons.",
      variant: "destructive",
    });
    signOut();
  };

  useIdleTimer({
    timeout: 1000 * 60 * 15, // 15 minutes
    onIdle: handleOnIdle,
    debounce: 500,
  });

  return null;
};

export default InactivityTimeout;
