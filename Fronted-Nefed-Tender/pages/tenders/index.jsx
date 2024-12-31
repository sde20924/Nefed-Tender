import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useState, useEffect } from "react";
import { callApiGet, callApiPost, callApiDelete } from "@/utils/FetchApi";
import moment from "moment";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const Tenders = () => {
  const router = useRouter();
  const [tenders, setTenders] = useState([]);
  const [selectedTenderId, setSelectedTenderId] = useState(null); // Track which tender's menu is open

  useEffect(() => {
    const fetchSellerTenders = async () => {
      try {
        const response = await callApiGet("seller-tenders"); // API endpoint to fetch tenders for a specific seller

        if (response.success) {
          // Sort tenders by created_at in descending order
          const sortedTenders = response.data.sort(
            (a, b) =>
              moment(b.created_at).valueOf() - moment(a.created_at).valueOf()
          );
          setTenders(sortedTenders);
        } else {
          console.error("Error fetching tenders:", response.msg);
        }
      } catch (error) {
        console.error("Error fetching tenders:", error.message);
      }
    };

    fetchSellerTenders();
  }, []);

  // Function to format time using moment
  const formatDate = (epochTime) =>
    moment(epochTime).format("DD-MM-YYYY HH:mm");

  // Function to handle Action button click
  const handleActionClick = (tenderId) => {
    // Toggle the menu for the clicked tender
    setSelectedTenderId((prevSelectedId) =>
      prevSelectedId === tenderId ? null : tenderId
    );
  };

  const handleMenuOptionClick = async (option, tender) => {
    if (option === "edit") {
      router.push(`/tenders/editTenderForm?id=${tender.tender_id}`);
    } else if (option === "delete") {
      // Show custom popup for confirmation
      toast(
        ({ closeToast }) => (
          <div>
            <p>Are you sure you want to delete this tender?</p>
            <div className="mt-2">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                onClick={async () => {
                  closeToast();
                  try {
                    const response = await callApiDelete(
                      `delete-tender/${tender.tender_id}`
                    );
                    if (response.success) {
                      toast.success("Tender deleted successfully");
                      setTenders((prevTenders) =>
                        prevTenders.filter(
                          (t) => t.tender_id !== tender.tender_id
                        )
                      );
                    }
                  } catch (error) {
                    console.error("Error deleting tender:", error);
                    toast.error("Failed to delete tender");
                  }
                }}
              >
                Yes
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded"
                onClick={() => closeToast()}
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          autoClose: false, // Prevent auto-close
          closeOnClick: false,
        }
      );
    } else if (option === "clone") {
      try {
        const response = await callApiPost(
          `clone-tender/${tender.tender_id}`,
          {}
        ); // Cloning still requires formData (even if empty)
        if (response.success) {
          toast.success("Tender cloned successfully");
        }
      } catch (error) {
        console.error("Error cloning tender:", error);
        toast.error("Failed to clone tender");
      }
    }
    setSelectedTenderId(null); // Close the menu after the option is selected
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Search Functionality
  const filteredTenders = tenders.filter(
    (tender) =>
      tender.tender_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.tender_id.toString().includes(searchQuery)
  );

  // Sorting Functionality
  const sortedTenders = filteredTenders.sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
    return filteredTenders;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedTenders.length / itemsPerPage);
  const paginatedTenders = sortedTenders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prevState) => ({
      key,
      direction: prevState.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div>
        <HeaderTitle
          padding={"p-4"}
          subTitle={"View tenders, update it, delete it"}
          title={"All Tenders"}
        />
        <div className="container mx-auto p-2 bg-gray-100 rounded-xl shadow-lg">
          {/* Search Input */}
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-1/3 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg ">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("tender_id")}
                  >
                    Sno
                    {sortConfig.key === "tender_id" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("tender_id")}
                  >
                    #
                    {sortConfig.key === "tender_id" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("tender_title")}
                  >
                    Name
                    {sortConfig.key === "tender_title" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                    Visibility
                  </th>
                  <th
                    className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("created_at")}
                  >
                    Created At Time
                    {sortConfig.key === "created_at" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200  ">
                {paginatedTenders.map((tender, index) => (
                  <tr
                    key={tender.tender_id}
                    className="hover:bg-indigo-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {index + 1 + (currentPage - 1) * itemsPerPage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                      {/* Action Button */}
                      <button
                        onClick={() => handleActionClick(tender.tender_id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                      >
                        Actions
                      </button>

                      {/* Dropdown Menu */}
                      {selectedTenderId === tender.tender_id && (
                        <div className="absolute  w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transition transform origin-top-right ease-out duration-200">
                          <ul className="divide-y divide-gray-200">
                            <li>
                              <button
                                onClick={() =>
                                  handleMenuOptionClick("edit", tender)
                                }
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  handleMenuOptionClick("clone", tender)
                                }
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                Clone
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() =>
                                  handleMenuOptionClick("delete", tender)
                                }
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 transition-colors"
                              >
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                      {tender.tender_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {tender.tender_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(tender.created_at)} <br />
                      {moment(tender.created_at).fromNow()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-3">
            <p className="text-sm text-gray-600 mb-4 md:mb-0">
              Showing{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, tenders.length)}-
              {Math.min(currentPage * itemsPerPage, tenders.length)} of{" "}
              {tenders.length} tenders
            </p>
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Tenders.layout = UserDashboard;
export default Tenders;
