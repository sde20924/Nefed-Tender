import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import TenderSelect from "@/components/TenderSelectList/TenderSelect"; // Import TenderSelect component
import { callApiGet } from "@/utils/FetchApi";
import { useState } from "react";
import TenderTable from "@/components/Report/TenderTable";

const AuctionBids = () => {
  const [selectedTender, setSelectedTender] = useState("");
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [error, setError] = useState("");
  const [iseditableSheet, setEditableSheet] = useState(null);
  const [tenderData, setTenderData] = useState(null);

  const fetchAuctionBids = async (selectedTender) => {
    setLoadingBids(true);
    try {
      const response = await callApiGet(
        `tender-Auction-bids/${selectedTender}`
        
      );

      setEditableSheet(response.data);
      if (response && response.success) {
        setBids(response.data.allBids);
        setTenderData(response.data)
        setError("");
      } else {
        throw new Error("No bids found or failed to load bids");
      }
    } catch (error) {
      console.error("Error fetching auction bids:", error.message);
      setError("Failed to fetch bids. Please try again later.");
      setTenderData(null);
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
                  Auction Bids for: {selectedTender}
                </span>
              )}
            </div>
            <TenderSelect
              selectedTender={selectedTender}
              onChange={handleTenderChange}
            />
          </div>
        </div>

        {loadingBids && (
          <p className="text-center text-blue-500 font-semibold">
            Loading auction bids...
          </p>
        )}
        {error && (
          <p className="text-center text-red-500">No Bids Found</p>
        )}

        <div className="overflow-x-auto mt-4">
          <div className="p-4 bg-gray-50 rounded-md shadow-md">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  {[
                    "Sno",
                    "#",
                    "User",
                    "Company Name",
                    "Amount",
                    "FOB",
                    "Freight",
                    "Status",
                    "Round",
                    "Qty",
                    "Bided At",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 border-b text-sm font-medium text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loadingBids && bids.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-4 text-gray-500">
                      No data record found.{" "}
                      <span className="text-blue-400">Select Tender</span>
                    </td>
                  </tr>
                )}
                {bids.length > 0 &&
                  bids.map((bid, index) => {
                    const [bidDate, bidTime] = bid.created_at.split("T");
                    return (
                      <tr
                        key={bid.bid_id}
                        className="hover:bg-gray-100 transition-all duration-200"
                      >
                        <td className="border-t px-6 py-3 text-center">
                          {index + 1}
                        </td>
                        <td className="border-t px-6 py-3 text-center">
                          #{bid.user_id}
                        </td>
                        <td className="border-t px-6 py-3">
                          {`${bid.user_details.first_name} ${bid.user_details.last_name}`}
                        </td>
                        <td className="border-t px-6 py-3">
                          {bid.user_details.company_name}
                        </td>
                        <td className="border-t px-6 py-3 text-right">
                          $
                          {bid.bid_amount
                            ? Number(bid.bid_amount).toFixed(2)
                            : "--"}
                        </td>
                        <td className="border-t px-6 py-3 text-right">
                          $
                          {bid.fob_amount
                            ? Number(bid.fob_amount).toFixed(2)
                            : "--"}
                        </td>
                        <td className="border-t px-6 py-3 text-right">
                          $
                          {bid.freight_amount
                            ? Number(bid.freight_amount).toFixed(2)
                            : "--"}
                        </td>
                        <td className="border-t px-6 py-3 text-center">
                          <span
                            className={`px-4 py-1 inline-block text-sm leading-5 font-semibold rounded-full min-w-[80px] text-center ${
                              bid.bid_status === "sold"
                                ? "bg-green-500 text-white"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            {bid.bid_status
                              ? bid.bid_status.charAt(0).toUpperCase() +
                                bid.bid_status.slice(1)
                              : "--"}
                          </span>
                        </td>
                        <td className="border-t px-6 py-3 text-right">
                          {bid.round || "--"}
                        </td>
                        <td className="border-t px-6 py-3 text-right">
                          {bid.qty_secured || "--"}
                        </td>
                        <td className="border-t px-6 py-3 text-right">
                          {bidDate} - {bidTime.split(".")[0]}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editable Sub-Tenders Section */}
      <div className="space-y-8">
        {iseditableSheet?.sub_tenders?.map((subTender) => (
          
          <div
            key={subTender.id}
            className="border border-gray-300 p-4 rounded"
          >
            
            <h2 className="text-lg font-bold mb-4">{subTender.name}</h2>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                <thead className="bg-blue-100 text-gray-700">
                  <tr>
                    {iseditableSheet.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 font-bold"
                      >
                        {header.table_head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subTender.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="odd:bg-gray-100 even:bg-gray-50 hover:bg-gray-200 transition-all duration-200"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`border border-gray-300 px-4 py-2 ${
                            cell?.type === "edit"
                              ? "bg-yellow-100"
                              : "bg-gray-50"
                          }`}
                        >
                          {cell.data || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        ))}
      </div>
      {!loadingBids && tenderData && (
          <TenderTable data={tenderData} />
        )}
    </>
  );
};

AuctionBids.layout = UserDashboard;
export default AuctionBids;
