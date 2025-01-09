import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useEffect, useState, useRef } from "react";
import { callApiGet } from "@/utils/FetchApi";
import { useRouter } from "next/router";
import DynamicCard from "@/components/ui/DynamicCard";

const ExploreTender = () => {
  const [tenders, setTenders] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const router = useRouter();
  const intervalIdsRef = useRef({}); // Reference to store interval IDs

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const data = await callApiGet("tenders/active");
        setTenders(data.data);

        // Initialize time left for each tender and set intervals
        data.data.forEach((tender) => {
          const initialTime = calculateTimeLeft(
            tender.tender_id,
            tender.app_end_time
          );
          setTimeLeft((prevTimeLeft) => ({
            ...prevTimeLeft,
            [tender.tender_id]: initialTime,
          }));

          // Set interval for each tender using its unique ID
          if (!intervalIdsRef.current[tender.tender_id]) {
            const intervalId = setInterval(() => {
              updateTenderTimeLeft(tender.tender_id, tender.app_end_time);
            }, 1000);
            intervalIdsRef.current[tender.tender_id] = intervalId;
          }
        });
      } catch (error) {
        console.error("Error fetching tenders:", error.message);
      }
    };

    fetchTenders();

    // Cleanup intervals on component unmount
    return () => {
      Object.values(intervalIdsRef.current).forEach(clearInterval);
    };
  }, []);

  // Function to calculate the countdown timer for a given end time
  const calculateTimeLeft = (tenderId, auctEndTime) => {
    const timeLeft = auctEndTime * 1000 - new Date().getTime();
    if (timeLeft > 0) {
      const hours = Math.floor(
        (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      clearInterval(intervalIdsRef.current[tenderId]); // Clear interval if countdown ends
      delete intervalIdsRef.current[tenderId]; // Clean up reference
      return "00:00:00";
    }
  };

  // Update time left for a specific tender
  const updateTenderTimeLeft = (tenderId, auctEndTime) => {
    const newTimeLeft = calculateTimeLeft(tenderId, auctEndTime);

    // Update the time left state without removing the tender card
    setTimeLeft((prevTimeLeft) => ({
      ...prevTimeLeft,
      [tenderId]: newTimeLeft,
    }));
  };

  const handleApplyNow = (tenderId) => {
    router.push(`/tenders/${tenderId}`);
  };

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"Available tenders, set visibility etc."}
        title={"Available tenders"}
      />
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
          {tenders?.map((tender) => (
            <DynamicCard 
            // width="500px"
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200 flex flex-col justify-between">
              <div key={tender.tender_id}>
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold text-gray-800 leading-snug">
                    {tender.tender_title}
                  </h2>
                  <div className="flex items-center space-x-2 bg-red-100 text-red-600 text-sm px-3 py-1 rounded-full">
                    <i className="fas fa-clock"></i>
                    <span>Closing At</span>
                    <span className="font-bold">
                      {timeLeft[tender.tender_id] || "00:00:00"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {tender.tender_desc ? (
                  <p
                    className="text-gray-600 mb-4 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        tender.tender_desc.length > 150
                          ? tender.tender_desc.slice(0, 150) + "..."
                          : tender.tender_desc,
                    }}
                  ></p>
                ) : (
                  <p className="text-gray-500 mb-4">
                    No description available.
                  </p>
                )}

                {/* Auction Timing */}
                <p className="text-sm text-gray-500 flex items-center mb-1">
                  <i className="far fa-calendar-alt text-blue-500 mr-2"></i>
                  Open Till:{" "}
                  {new Date(tender.app_end_time * 1000).toLocaleString(
                    "en-GB",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Starting Price:{" "}
                    <span className="text-blue-600 font-bold">
                      {tender.start_price}
                    </span>
                  </h3>

                  {/* Apply Now Button */}

                  <button
                    onClick={() => handleApplyNow(tender.tender_id)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </DynamicCard>
          ))}
        </div>
      </div>
    </>
  );
};

ExploreTender.layout = UserDashboard;
export default ExploreTender;
