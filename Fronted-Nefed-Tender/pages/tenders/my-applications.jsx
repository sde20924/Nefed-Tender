import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Import useRouter from Next.js
import { callApiGet } from "../../utils/FetchApi";
import DynamicCard from "@/components/ui/DynamicCard";

const MyApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await callApiGet("tender-applications"); // Use the correct API endpoint
        setApplications(data.data); // Set the retrieved data
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Function to handle redirection to tender details page
  const handleViewDetails = (tenderId) => {
    router.push(`/tenders/${tenderId}`); // Redirect to the tender details page
  };

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"My Applications, set visibility etc."}
        title={"My Applications"}
      />

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications?.length > 0 ? (
            applications.map((application) => (
              <DynamicCard className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200 flex flex-col justify-between">
                <div
                  key={application.tender_application_id}
                  className="flex flex-col flex-grow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-gray-900 truncate">
                      {application.tender_title || "Unnamed Tender"}
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-md shadow-sm ${
                        application.status === "accepted"
                          ? "bg-green-200 text-green-800"
                          : application.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {application.status || "Unknown"}
                    </span>
                  </div>

                  {application.tender_desc ? (
                    <p
                      className="text-gray-600 mb-4 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          application.tender_desc.length > 150
                            ? application.tender_desc.slice(0, 150) + "..."
                            : application.tender_desc,
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
                      {new Date(application.auct_start_time * 1000).toLocaleString()}{" "}
                      - {new Date(application.auct_end_time * 1000).toLocaleString()}
                    </span>
                  </div>

                  {/* Display rejected reason if the status is 'rejected' */}
                  {application.status === "rejected" && (
                    <p className="text-sm text-black font-medium mt-2">
                       Rejection Reason :{" "}
                      <span className="font-semibold text-red-400">
                        {application.rejected_reason}
                      </span>
                    </p>
                  )}
                </div>

                {/* View Tender Details Button Section */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleViewDetails(application.tender_id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200"
                  >
                    View Tender Details
                  </button>
                </div>
              </DynamicCard>
            ))
          ) : (
            <p className="text-gray-500 col-span-3">No applications found.</p>
          )}
        </div>
      </div>
    </>
  );
};

MyApplication.layout = UserDashboard;
export default MyApplication;
