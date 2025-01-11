import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { callApiGet } from "../../utils/FetchApi";
import DynamicCard from "@/components/ui/DynamicCard";
import Loader from "@/components/Loader";

const MyTender = () => {
  const [applications, setApplications] = useState([]);
  const [tenderDetails, setTenderDetails] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // Tabs state
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await callApiGet("tender/tender-applications");
        const acceptedApplications = data?.data?.filter(
          (app) => app.status === "accepted"
        );

        await fetchTenderDetails(acceptedApplications);

        setApplications(acceptedApplications);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchTenderDetails = async (applications) => {
      try {
        const tendersData = await Promise.all(
          applications.map(async (application) => {
            console.log("+__+_+_+_+", application);
            const tenderData = await callApiGet(
              `common/tender/${application.tender_id}`
            );
            console.log("----------", application);
            console.log("------", tenderData);

            calculateTimeLeft(
              tenderData.data.auct_start_time,
              tenderData.data.auct_end_time,
              application.tender_id
            );
            return { tenderId: application.tender_id, data: tenderData.data };
          })
        );

        const tendersDict = {};
        tendersData.forEach((tender) => {
          tendersDict[tender.tenderId] = tender.data;
        });

        setTenderDetails(tendersDict);
      } catch (error) {
        console.error("Error fetching tender details:", error.message);
      }
    };

    fetchApplications();
  }, []);

  const calculateTimeLeft = (auctStartTime, auctEndTime, tenderId) => {
    const startTimeMs = auctStartTime * 1000;
    const endTimeMs = auctEndTime * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      let timeLeft, label;

      if (now < startTimeMs) {
        timeLeft = startTimeMs - now;
        label = "Starting At";
      } else if (now >= startTimeMs && now <= endTimeMs) {
        timeLeft = endTimeMs - now;
        label = "Closing At";
      } else {
        clearInterval(interval);
        timeLeft = 0;
        label = "Expired";
      }

      if (timeLeft > 0) {
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeLeft((prevState) => ({
          ...prevState,
          [tenderId]: {
            label,
            time: `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          },
        }));
      } else {
        setTimeLeft((prevState) => ({
          ...prevState,
          [tenderId]: {
            label,
            time: "Expired",
          },
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleViewDetails = (tenderId) => {
    router.push(`/tenders/accessBidRoom?tenderId=${tenderId}`);
  };

  // Tab navigation logic
  const filteredApplications = applications?.filter((application) => {
    const tender = tenderDetails[application.tender_id];
    const timeInfo = timeLeft[application.tender_id];
    if (activeTab === "active") {
      return timeInfo && timeInfo.label !== "Expired";
    }
    if (activeTab === "expired") {
      return timeInfo && timeInfo.label === "Expired";
    }
    return true;
  });

  if (loading) return <Loader/>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"My Tenders, set visibility etc."}
        title={"My tenders"}
      />

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1  lg:grid-cols-3 gap-4">
          {filteredApplications?.length > 0 ? (
            filteredApplications.map((application) => {
              const tender = tenderDetails[application.tender_id];
              const timeInfo = timeLeft[application.tender_id];

              return (
                <DynamicCard

                  className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div
                    key={application.tender_application_id}
                    className="flex flex-col h-full"
                  >
                    {tender && (
                      <div className="relative flex-grow">
                        {/* Title and Timer */}
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                            {tender.tender_title}
                          </h2>
                          {timeInfo?.label !== "Expired" && (
                            <div
                              className={`flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                                timeInfo.label === "Starting At"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              <i
                                className={`fas fa-clock mr-2 ${
                                  timeInfo.label === "Starting At"
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              ></i>
                              <span>{timeInfo.label}</span>
                              <span className="font-bold ml-1">
                                {timeInfo.time}
                              </span>
                            </div>
                          )}
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
                        <div className="flex items-center text-sm text-gray-500">
                          <i className="fas fa-calendar-alt text-blue-500 mr-2"></i>
                          <span>
                            {new Date(
                              tender.auct_start_time * 1000
                            ).toLocaleString()}{" "}
                            -{" "}
                            {new Date(
                              tender.auct_end_time * 1000
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer Section */}
                    <div className="flex justify-between items-center mt-4">
                      {/* Starting Price */}
                      <h3 className="text-sm font-medium text-gray-700">
                        Starting Price:{" "}
                        <span className="text-blue-600 font-bold">
                          {tender.start_price}
                        </span>
                      </h3>

                      {/* Access Bid Room Button */}
                      <button
                        onClick={() =>
                          timeInfo.label !== "Starting At" &&
                          handleViewDetails(application.tender_id)
                        }
                        disabled={timeInfo.label === "Starting At"}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all ${
                          timeInfo.label === "Starting At"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                        }`}
                      >
                        Access Bid Room
                      </button>
                    </div>
                  </div>
                </DynamicCard>
              );
            })
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              {activeTab === "active"
                ? "No active auctions found."
                : "No expired auctions found."}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

MyTender.layout = UserDashboard;
export default MyTender;
