import FormModal from '@/components/FormModal'
import Image from 'next/image'
import React from 'react'

const ProfilePage = () => {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap mb-6">
        <h2 className="text-2xl font-bold">Admin Profile</h2>
        <FormModal type="create" table="admin"/>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-lg flex items-center gap-6 p-6">
        <Image
          className="rounded-full border-2 border-gray-300"
          src="/avatar.png"
          alt="Profile Picture"
          width={100}
          height={100}
        />
        <div>
          <h2 className="text-lg font-semibold">Muslim School</h2>
          <span className="text-sm text-gray-500">Admin</span>
          <p className="text-gray-600 mt-1">Allah is great</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-[18px] font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-gray-600 text-sm font-medium">First Name</h3>
            <p className="text-gray-800 font-semibold text-[14px]">Muslim</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">Last Name</h3>
            <p className="text-gray-800 font-semibold text-[14px]">Muslim</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">Email Address</h3>
            <p className="text-gray-800 font-semibold text-[14px]">muslimschooloyo@gmail.com</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">Phone Number</h3>
            <p className="text-gray-800 font-semibold text-[14px]">+234 812 345 6789</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">Date of Birth</h3>
            <p className="text-gray-800 font-semibold text-[14px]">12-10-1990</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">User Role</h3>
            <p className="text-gray-800 font-semibold text-[14px]">Admin</p>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-[18px]">Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-600 text-sm font-medium">Address</h3>
            <p className="text-gray-800 font-semibold text-[14px]">Odo Eran, Ilekara</p>
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">Session</h3>
            <p className="text-gray-800 font-semibold text-[14px]">2022/2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
