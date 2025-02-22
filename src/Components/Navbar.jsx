import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Image from "next/image";
import React from "react";

export default function Navbar() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const [loggedUser, setLoggedUser] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  // Persist user role when logged in
  useEffect(() => {
    if (user?.publicMetadata?.role) {
      setLoggedUser(user.publicMetadata.role);
    }
  }, [user]);

  // Prevent Navbar from disappearing on sign-out
  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const role = loggedUser || "User"; // Fallback role
  const username = user?.username || "User";

  return (
    <div className="flex items-center justify-between p-3 bg-purple-300 ">
      {/* SEARCHBAR */}
      <div className="hidden md:flex items-center gap-2 text-xs bg-white p-2 rounded-full ring-[1.5px] ring-grey-300">
        <Image src="/search.png" alt="Search Icon" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="outline-none text-sm w-full placeholder-gray-500"
        />
      </div>

      {/* ICON AND USER */}
      <div className="flex items-center justify-end gap-4">
        {/* Message Icon */}
        <div className="bg-white rounded-full flex w-7 h-7 items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="Messages" width={20} height={20} />
        </div>

        {/* Announcement Icon */}
        <div className="bg-white rounded-full flex w-7 h-7 items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="Announcements" width={20} height={20} />
          {/* Badge */}
          <div className="absolute top-[-5px] right-[-5px] w-5 h-5 flex items-center justify-center bg-purple-500 text-white text-xs rounded-full z-10">
            1
          </div>
        </div>

        {/* User Info */}
        <div>
          <p className="text-xs leading-3 font-medium">{username}</p>
          <p className="text-[10px] text-gray-500 text-right">{role}</p>
        </div>

        {/* Sign Out Button with UserButton */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}
