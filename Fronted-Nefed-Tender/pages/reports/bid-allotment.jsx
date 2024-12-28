import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import TenderSelect from "@/components/TenderSelectList/TenderSelect"; // Import TenderSelect component
import { callApiGet } from "@/utils/FetchApi";
import { useState } from "react";

const BidAllotment = () => {
  const [selectedTender, setSelectedTender] = useState("");
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [error, setError] = useState("");

  const fetchAuctionBids = async (selectedTender) => {
    setLoadingBids(true);
    try {
      const response = await callApiGet(
        `tender-All-bidAmount/${selectedTender}`
      );

      if (response && response.success) {
        setBids(response.allBids || []);
        setError("");
      } else {
        throw new Error("No bids found or failed to load bids");
      }
    } catch (error) {
      console.error("Error fetching auction bids:", error.message);
      setError("Failed to fetch bids. Please try again later.");
      setBids([]);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleTenderChange = async (event) => {
    const tenderId = event.target.value;
    setSelectedTender(tenderId);
    if (tenderId) {
      await fetchAuctionBids(tenderId);
    }
  };

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"View all bids for selected tenders"}
        title={"Tender Auction Logs"}
      />
      <div className="container m-4 w-auto p-6 bg-white shadow-md rounded-md">
        <div className="mb-6 bg-gray-50 rounded-md p-4 ">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center sm:text-left">
            {selectedTender && (
              <span className="text-lg font-semibold">
                Selected Tender ID: {selectedTender || "N/A"}
              </span>
            )}  
                </div>
              <TenderSelect
                selectedTender={selectedTender}
                onChange={handleTenderChange}
              />
        </div>
        </div>

        {/* Loading and Error Messages */}
        {loadingBids && (
          <p className="text-center text-blue-500 font-semibold">
            Loading auction Logs...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 font-semibold">
            No Logs Found
          </p>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b text-sm font-medium text-gray-700 text-left uppercase text-gray-700">
                <th className="px-4 py-3 border-b text-sm font-medium text-gray-700 text-center border-b">Sno</th>
                <th className="px-4 py-3 border-b text-sm font-medium text-gray-700 text-center border-b">Company Name</th>
                <th className="px-4 py-3 border-b text-sm font-medium text-gray-700 border-b">Bids</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {!loadingBids && bids.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No data record found.{" "}
                    <span className="text-blue-400">Select Tender</span>
                  </td>
                </tr>
              )}
              {bids.length > 0 &&
                bids.map((bid, index) => (
                  <tr
                    key={bid.user_id}
                    className="hover:bg-gray-100 transition-all duration-200"
                  >
                    <td className="border-t px-6 py-3 text-center">
                      {index + 1}
                    </td>
                    <td className="border-t px-4 py-3 text-center">{`${bid.first_name} ${bid.last_name} (${bid.company_name})`}</td>
                    <td className="border-t px-4 py-3 text-center">
                      <div className="flex flex-wrap gap-2">
                        {bid.bid_amounts && bid.bid_amounts.length > 0 ? (
                          bid.bid_amounts.map((amount, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-3 py-1 bg-gray-200 rounded-md"
                            >
                              ${Number(amount).toFixed(2)}
                            </span>
                          ))
                        ) : (
                          <span>--</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

BidAllotment.layout = UserDashboard;
export default BidAllotment;
