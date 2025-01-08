import React, { useEffect, useState } from "react";
import { callApiGet, callApiPost } from "../../utils/FetchApi";
import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaFileAlt,
  FaUser,
  FaBuilding,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import TenderCategories from "@/components/add-tander/TenderCategories";

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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTenderTitle, setSelectedTenderTitle] = useState("");
  const [headerdynamicSize ,setHeaderdynamicSize]=useState("sm")

  const safeString = (str) => (str ? str.toLowerCase() : "");

  const displayData =
    selectedCategory && filteredData.length > 0 ? filteredData : [];

  const filteredApplications = displayData.filter((application) => {
    const matchesSearch =
      safeString(application.tender_title).includes(
        searchQuery.toLowerCase()
      ) ||
      safeString(
        `${application.buyer_details.first_name} ${application.buyer_details.last_name}`
      ).includes(searchQuery.toLowerCase()) ||
      safeString(application.buyer_details.company_name).includes(
        searchQuery.toLowerCase()
      );

    const matchesTenderTitle = selectedTenderTitle
      ? application.tender_title === selectedTenderTitle // Compare `selectedTenderTitle` with the current application's `tender_title`
      : true;

    return matchesSearch && matchesTenderTitle;
  });

  const uniqueTenderTitles =
    selectedCategory.length > 0
      ? [...new Set(filteredData.map((data) => data.tender_title))]
      : [];

  // const filteredInputSearch = applications.filter((application) => {
  //   const matchesSearch =
  //     safeString(application.tender_title).includes(
  //       searchQuery.toLowerCase()
  //     ) ||
  //     safeString(
  //       `${application.buyer_details.first_name} ${application.buyer_details.last_name}`
  //     ).includes(searchQuery.toLowerCase()) ||
  //     safeString(application.buyer_details.company_name).includes(
  //       searchQuery.toLowerCase()
  //     );
  //   return matchesSearch;
  // });

  useEffect(() => {
    const fetchSubmittedApplications = async () => {
      try {
        const data = await callApiGet("submitted-tender-applications");
        setApplications(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSubmittedApplications();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = applications.filter(
        (data) => data.category == selectedCategory
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]); // Clear filtered data if no category is selected
    }
  }, [selectedCategory, applications]);
  console.log("----$$$---", filteredData);

  const handleAction = async (applicationId, action, reason = "") => {
    if (action === "rejected" && !reason) return;

    try {
      await callApiPost("update-tender-application", {
        applicationId,
        action,
        reason,
      });

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"View Submitted Applications"}
        title={"Submitted Applications"}
      />
      <div className="container mx-auto p-4">
        <div className="mb-6 flex  flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 ">
          {/* Tender Categories Selector */}
          <div className="flex-1 md:w-1/3">
            <TenderCategories
              categories={categories}
              setCategories={setCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              id="category"
              headerdynamicSize={headerdynamicSize}
            />
          </div>

          {/* Tender Titles Dropdown */}
          <div className="flex-1 md:w-1/3">
            <label
              htmlFor="tender-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tender Title
            </label>
            <select
              id="tender-title"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={selectedCategory.length === 0}
              value={selectedTenderTitle}
              onChange={(e) => setSelectedTenderTitle(e.target.value)}
            >
              {selectedCategory.length > 0 ? (
                uniqueTenderTitles.length > 0 ? (
                  uniqueTenderTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))
                ) : (
                  <option>No tenders available</option>
                )
              ) : (
                <option>Select a category first</option>
              )}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 md:w-1/3">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by Tender Name, Buyer Name, or Company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {selectedCategory.length > 0
            ? filteredApplications.map((application) => (
                <div
                  key={application.tender_application_id}
                  className="bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col relative"
                >
                  {/* Top Section */}
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

                  {/* Details Section */}
                  <div className="space-y-2 text-sm flex-grow">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-indigo-500 w-5 h-5" />
                      <span className="text-gray-800 truncate">
                        <span className="font-semibold">Buyer:</span>{" "}
                        {application.buyer_details?.first_name || "N/A"}{" "}
                        {application.buyer_details?.last_name || ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-teal-500 w-5 h-5" />
                      <span className="text-gray-800 truncate">
                        <span className="font-semibold">Company:</span>{" "}
                        {application.buyer_details?.company_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-red-500 w-5 h-5" />
                      <span className="text-gray-800 truncate">
                        <span className="font-semibold">Email:</span>{" "}
                        {application.buyer_details?.email || "N/A"}
                      </span>
                    </div>

                    {/* Uploaded Files Section */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800">
                        Uploaded Files:
                      </h4>
                      <ul className="space-y-2">
                        {application.file_details?.length > 0 ? (
                          application.file_details.map((file) => (
                            <li
                              key={file.tender_user_doc_id}
                              className="flex items-center space-x-2"
                            >
                              <FaFileAlt className="text-blue-500 w-5 h-5" />
                              <a
                                href={file.doc_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 underline truncate"
                              >
                                {`Document ${file.tender_user_doc_id}`}
                              </a>
                              <span className="text-gray-600 text-xs">
                                ({file.application_status || "Unknown Status"})
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No files uploaded</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex justify-between items-center mt-2 space-x-2 ">
                    <button
                      onClick={() =>
                        handleAction(
                          application.tender_application_id,
                          "accepted"
                        )
                      }
                      className="flex items-center justify-center bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm hover:bg-green-200 transition-all shadow-md"
                    >
                      <FaCheck className="mr-2 w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleReject(application.tender_application_id)
                      }
                      className="flex items-center justify-center bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm hover:bg-red-200 transition-all shadow-md"
                    >
                      <FaTimes className="mr-2 w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            : applications.map((application) => (
                <div
                  key={application.tender_application_id}
                  className="bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-lg rounded-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col relative"
                >
                  {/* Top Section */}
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

                  {/* Details Section */}
                  <div className="space-y-2 text-sm flex-grow">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-indigo-500 w-5 h-5" />
                      <span className="text-gray-800 truncate">
                        <span className="font-semibold">Buyer:</span>{" "}
                        {application.buyer_details?.first_name || "N/A"}{" "}
                        {application.buyer_details?.last_name || ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-teal-500 w-5 h-5" />
                      <span className="text-gray-800 truncate">
                        <span className="font-semibold">Company:</span>{" "}
                        {application.buyer_details?.company_name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-red-500 w-5 h-5" />
                      <span className="text-gray-800 truncate">
                        <span className="font-semibold">Email:</span>{" "}
                        {application.buyer_details?.email || "N/A"}
                      </span>
                    </div>

                    {/* Uploaded Files Section */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800">
                        Uploaded Files:
                      </h4>
                      <ul className="space-y-2">
                        {application.file_details?.length > 0 ? (
                          application.file_details.map((file) => (
                            <li
                              key={file.tender_user_doc_id}
                              className="flex items-center space-x-2"
                            >
                              <FaFileAlt className="text-blue-500 w-5 h-5" />
                              <a
                                href={file.doc_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 underline truncate"
                              >
                                {`Document ${file.tender_user_doc_id}`}
                              </a>
                              <span className="text-gray-600 text-xs">
                                ({file.application_status || "Unknown Status"})
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500">No files uploaded</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="flex justify-between items-center  space-x-2  mt-2">
                    <button
                      onClick={() =>
                        handleAction(
                          application.tender_application_id,
                          "accepted"
                        )
                      }
                      className="flex items-center justify-center bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm hover:bg-green-200 transition-all shadow-md"
                    >
                      <FaCheck className="mr-2 w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        handleReject(application.tender_application_id)
                      }
                      className="flex items-center justify-center bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm hover:bg-red-200 transition-all shadow-md"
                    >
                      <FaTimes className="mr-2 w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>

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
