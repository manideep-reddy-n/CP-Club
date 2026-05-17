"use client";
import React from "react";
import MainLayout from "./MainLayout";
import ProfileSidebar from "./ProfileSidebar";

function Profile({ data }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 flex flex-col xl:flex-row gap-6 bg-background min-h-screen">
      <div className="w-full xl:w-[380px] 2xl:w-[420px]">
        <ProfileSidebar data={data} />
      </div>
      <div className="w-full">
        <MainLayout data={data} />
      </div>
    </div>
  );
}

export default Profile;
