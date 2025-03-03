import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import TenderSelect from "@/components/TenderSelectList/TenderSelect"; // Import TenderSelect component
import { callApiGet } from "@/utils/FetchApi";
import { useEffect, useState } from "react";

const tenderPartyWise = () => {
  const [selectedTender, setSelectedTender] = useState("");
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [error, setError] = useState("");

  const fetchAuctionBids = async (selectedTender) => {
    setLoadingBids(true);
    try {
      const response = await callApiGet(`tender-Auction-bids/${selectedTender}`);

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
        subTitle={"View tenders, update them, delete them"}
        title={"All Tenders"}
      />
     <div className="container mx-auto m-4 p-4 bg-white shadow-md rounded-md">
        <div className="mb-6 bg-gray-50 rounded-md p-4">
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

        {bids.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left text-sm uppercase text-gray-700 font-semibold">
                  <th className="px-4 py-2 border-b text-center">Sno</th>
                  <th className="px-4 py-2 border-b text-center">Date</th>
                  <th className="px-4 py-2 border-b text-center">Dest Port</th>
                  <th className="px-4 py-2 border-b">Company</th>
                  <th className="px-4 py-2 border-b">Person</th>
                  <th className="px-4 py-2 border-b">Mob No</th>
                  <th className="px-4 py-2 border-b">Email</th>
                  <th className="px-4 py-2 border-b text-center">Allot Qty (in MT)</th>
                  <th className="px-4 py-2 border-b text-right">Bid</th>
                  <th className="px-4 py-2 border-b text-right">Fob Amt</th>
                  <th className="px-4 py-2 border-b text-right">Freight Amt</th>
                  <th className="px-4 py-2 border-b text-right">Last Updated At</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, index) => {
                  const bidDateTime = new Date(bid.created_at).toLocaleString();
                  return (
                    <tr key={bid.bid_id} className="hover:bg-gray-100 transition-all duration-200">
                      <td className="border-t px-4 py-2 text-center">{index + 1}</td>
                      <td className="border-t px-4 py-2 text-center">{bidDateTime}</td>
                      <td className="border-t px-4 py-2 text-center">{bid.dest_port}</td>
                      <td className="border-t px-4 py-2">{bid.company_name}</td>
                      <td className="border-t px-4 py-2">{`${bid.first_name} ${bid.last_name}`}</td>
                      <td className="border-t px-4 py-2">{bid.phone_number}</td>
                      <td className="border-t px-4 py-2">{bid.email}</td>
                      <td className="border-t px-4 py-2 text-center">{bid.qty_secured || "--"}</td>
                      <td className="border-t px-4 py-2 text-right">${Number(bid.bid_amount).toFixed(2)}</td>
                      <td className="border-t px-4 py-2 text-right">${Number(bid.fob_amount).toFixed(2)}</td>
                      <td className="border-t px-4 py-2 text-right">${Number(bid.freight_amount).toFixed(2)}</td>
                      <td className="border-t px-4 py-2 text-right">{bidDateTime}</td>
                    </tr>
                  );
                })}

                {/* Total Quantity Row */}
                <tr className="bg-yellow-100 font-semibold">
                  <td colSpan="7" className="border-t px-6 py-3 text-right">Total Quantity</td>
                  <td colSpan="5" className="border-t px-6 py-3 text-center">
                    {bids.reduce((total, bid) => total + (bid.qty || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!loadingBids && bids.length === 0 && !error && (
          <p className="text-gray-500">No bids found. Please select a tender to view details.</p>
        )}
      </div>
    </>
  );
};

tenderPartyWise.layout = UserDashboard;
export default tenderPartyWise;
