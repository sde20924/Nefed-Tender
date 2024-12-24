import React, { useEffect, useState } from "react";
// components
import CardLineChart from "@/components/Cards/CardLineChart";
import CardBarChart from "@/components/Cards/CardBarChart";
import CardPageVisits from "@/components/Cards/CardPageVisits";
import CardSocialTraffic from "@/components/Cards/CardSocialTraffic";
import HeaderStats from "@/components/Headers/HeaderStats";

// layout for page
import UserDashboard from "@/layouts/UserDashboard";
import { useDispatch, useSelector } from "react-redux";
import { getProfileData } from "@/store/slices/profileSlice";
import LoadingScreen from "@/components/LoadingScreen/LoadingScreen";
import UploadFilesModal from "@/components/Modal/UploadFilesModal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { profileData, profileLoading } = useSelector(
    (state) => state.profileData
  );
  const userData = JSON.parse(localStorage.getItem("data")) || null;

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!profileData) {
      dispatch(getProfileData());
    } else {
      const count = +localStorage.getItem("openModal") || null;
      if (count) {
        openModal();
        localStorage.removeItem("openModal");
      }
    }
  }, [profileData]);

  if (!profileData) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="flex flex-wrap md:pt-4 pb-20 pt-4 bg-gradient-to-b from-gray-100 to-blue-50">
        {/* Header Section */}
        <div className="w-full m-4 mb-6">
          <HeaderStats />
        </div>

        {/* Charts Section */}
        <div className="flex flex-wrap w-full">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <div className="rounded-lg shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardLineChart />
            </div>
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <div className="rounded-lg shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardBarChart />
            </div>
          </div>
        </div>

        {/* Page Visits and Social Traffic Section */}
        <div className="flex flex-wrap w-full">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
            <div className="rounded-lg shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardPageVisits />
            </div>
          </div>
          <div className="w-full xl:w-4/12 px-4">
            <div className="rounded-lg shadow-lg bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardSocialTraffic />
            </div>
          </div>
        </div>

        {/* Modal Section */}
        {profileData?.buyer_id && (
          <UploadFilesModal
            docs={profileData?.docs}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
        {profileData?.seller_id && (
          <UploadFilesModal
            docs={profileData?.docs}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}

        {/* Welcome Message Section */}
        <div className="w-full text-center p-6">
          <h1 className="text-4xl font-bold text-blueGray-700">
            Hi, {userData && userData?.data?.first_name}
          </h1>
          <h2 className="text-2xl font-medium text-pink-500 mt-2">
            Welcome to {userData && userData?.login_as} panel
          </h2>
          <p
            className={`mt-4 ${
              userData?.login_as === "admin" || userData?.login_as === "manager"
                ? "hidden"
                : ""
            } text-lg text-blueGray-500`}
          >
            (You belong to&nbsp;{profileData?.tag_name} tag)
          </p>
        </div>
      </div>
    </>
  );
}

Dashboard.layout = UserDashboard;
