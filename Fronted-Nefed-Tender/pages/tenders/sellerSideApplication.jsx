import React, { useEffect, useState } from "react";
import { callApiGet, callApiPost } from "../../utils/FetchApi";
import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import { toast } from "react-toastify";

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
    } else {
      toast.info("Please enter a reason for rejection.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Reject Application</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          rows="4"
          placeholder="Enter the reason for rejection"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmittedApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [buyerDetails, setBuyerDetails] = useState();

  // Function to safely access a string and handle undefined/null
  const safeString = (str) => (str ? str.toLowerCase() : "");

  const filteredApplications = applications.filter((application) => {
    return (
      safeString(application.tender_title).includes(searchQuery.toLowerCase()) ||
      safeString(
        `${application.buyer_details.first_name} ${application.buyer_details.last_name}`
      ).includes(searchQuery.toLowerCase()) ||
      safeString(application.buyer_details.company_name).includes(
        searchQuery.toLowerCase()
      )
    );
  });

  useEffect(() => {
    const fetchSubmittedApplications = async () => {
      try {
        const data = await callApiGet("submitted-tender-applications");

        setApplications(data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSubmittedApplications();
  }, []);

  console.log("application-Dataasd---", applications);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const handleAction = async (applicationId, action, reason = "") => {
    if (action === "rejected" && !reason) {
      // console.log(`Rejection reason required for Application ID: ${applicationId}`);
      return;
    }

    try {
      const response = await callApiPost("update-tender-application", {
        applicationId,
        action,
        reason,
      });

      // console.log('Response:', response);
      // Handle successful response, update the UI accordingly
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.tender_application_id === applicationId
            ? { ...app, status: action, rejected_reason: reason }
            : app
        )
      );
    } catch (err) {
      console.error("Error updating application:", err);
    }
  };

  const handleReject = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (reason) => {
    if (selectedApplicationId) {
      handleAction(selectedApplicationId, "rejected", reason);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"View Submitted Applications"}
        title={"Submitted Applications"}
      />

      <div className="container mx-auto p-4">
        {/* Section Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <input
            type="text"
            placeholder="Search by Tender Name, Buyer Name, or Company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-4 md:mt-0 border border-gray-300 rounded-lg px-4 py-2 w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <div
                key={application.tender_application_id}
                className="bg-gradient-to-b from-white via-gray-100 to-gray-50 shadow-lg rounded-lg p-6 border border-gray-300 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Tender Details */}
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {application.tender_title || "Unnamed Tender"}
                </h2>
                <h3 className="text-gray-700 mb-1">
                  <span className="font-bold">Buyer Name:</span>{" "}
                  {application.buyer_details?.first_name || "N/A"}{" "}
                  {application.buyer_details?.last_name || ""}
                </h3>
                <h3 className="text-gray-700 mb-1">
                  <span className="font-bold">Company:</span>{" "}
                  {application.buyer_details?.company_name || "N/A"}
                </h3>
                <p className="text-lg font-medium mb-2 text-gray-600">
                  <span className="font-bold">Status:</span>{" "}
                  {application.status || "Unknown"}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() =>
                      handleAction(
                        application.tender_application_id,
                        "accepted"
                      )
                    }
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleReject(application.tender_application_id)
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-3">
              No submitted applications found.
            </p>
          )}
        </div>
      </div>
      {/* Modal for Rejection Reason */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </>
  );
};

SubmittedApplications.layout = UserDashboard;
export default SubmittedApplications;
