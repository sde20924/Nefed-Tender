import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { callApiGet, callApiPost } from "@/utils/FetchApi";
import { ToastContainer, toast } from "react-toastify";
import { FaTimes, FaEdit, FaSave } from "react-icons/fa";

const AccessBidRoom = () => {
  const router = useRouter();
  const { tenderId } = router.query; // Get the tenderId from the query parameters
  const [tender, setTender] = useState(null);
  const [timeLeft, setTimeLeft] = useState(""); // Countdown timer
  const [isAuctionLive, setIsAuctionLive] = useState(false); // State to track if the auction is live
  const [auctionEnded, setAuctionEnded] = useState(false); // New state to track if auction has ended
  const [bids, setBids] = useState([]); // State to store all bids
  const [lBidUserId, setLBidsUserId] = useState();
  const [lBid, setLBid] = useState();

  const [auctionItems, setAuctionItems] = useState([]); // State to store auction items
  const [itemBids, setItemBids] = useState({}); // Store user input for each item
  const [totalBidAmount, setTotalBidAmount] = useState(0); // Store the total bid amount
  const [formdata, setFormData] = useState([]);
  const [formdata1, setFormData1] = useState([]);
  const [bidDetails, setBidDetails] = useState();
  const [bidcount, setBidCount] = useState();
  const [suggestionData, setSuggestionData] = useState([]);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [editingRow, setEditingRow] = useState({
    tableIndex: null,
    rowIndex: null,
  });
  const [isBidValid, setIsBidValid] = useState(false);
  const [latestBidAmount, setLatestBidAmount] = useState(0);
  const [toastShown, setToastShown] = useState(false);
  // Handle input changes for editable fields
  const handleInputChange = (tableIndex, rowIndex, field, value) => {
    const updatedData = [...suggestionData];
    const row = updatedData[tableIndex].items[rowIndex];
    row[field] = field === "item" ? value : parseFloat(value);
    row.difference = row.suggestionAmount - row.currentAmount; // Update difference
    setSuggestionData(updatedData);
  };
  const handleActionClick = (tableIndex, rowIndex) => {
    console.log("Table Index:", tableIndex);
    console.log("Row Index:", rowIndex);

    const updatedFormData = [...formdata];
    const { subtender_name } = suggestionData[tableIndex];
    const suggestionRow = suggestionData[tableIndex]?.items[rowIndex];

    console.log("Suggestion Row:", suggestionRow);

    if (!suggestionRow || !suggestionRow.suggested_price) {
      console.warn("No suggested_price found in this row.");
      return;
    }

    const { item_name, suggested_price } = suggestionRow;
    const correspondingSubTender = updatedFormData.find(
      (subTender) =>
        subTender.name.trim().toLowerCase() ===
        subtender_name.trim().toLowerCase()
    );
    if (!correspondingSubTender) {
      console.warn("No matching subtender found for:", subtender_name);
      return;
    }
    console.log("Corresponding Subtender:", correspondingSubTender);
    // Find the row in the subtender matching the item name
    const itemColumnIndex = tender.headers.findIndex(
      (header) => header.table_head.toLowerCase() === "item"
    );
    if (itemColumnIndex === -1) {
      console.warn("No 'Item' column found in headers.");
      return;
    }
    const correspondingRow = correspondingSubTender.rows.find((row) => {
      const itemData = row[itemColumnIndex]?.data?.trim().toLowerCase();
      return itemData === item_name.trim().toLowerCase();
    });
    if (!correspondingRow) {
      console.warn(
        `No matching row found for item_name: "${item_name}" in subtender: "${subtender_name}"`
      );
      return;
    }
    const rateIndex = tender.headers.findIndex(
      (header) => header.table_head.toLowerCase() === "rate"
    );
    if (rateIndex === -1) {
      console.warn("No 'Rate' column found in headers.");
      return;
    }
    correspondingRow[rateIndex].data = suggested_price;
    setFormData(updatedFormData);
    updateTotalBidAmount();
    toast.success(
      `Successfully updated "${item_name}" with suggested price ₹${suggested_price}`
    );
  };
  const handleConfirm = () => {
    if (pendingUpdate) {
      const { tableIndex, rowIndex } = pendingUpdate;
      handleActionClick(tableIndex, rowIndex); // Perform the update action
    }
    setShowModal(false);
    setPendingUpdate(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingUpdate(null);
  };

  const handleActionClickWithDialog = (tableIndex, rowIndex) => {
    setPendingUpdate({ tableIndex, rowIndex });
    setShowModal(true);
  };
  // Handle edit action
  const handleEdit = (tableIndex, rowIndex) => {
    setEditingRow({ tableIndex, rowIndex });
  };
  // Handle save action
  const handleSave = () => {
    setEditingRow({ tableIndex: null, rowIndex: null });
  };
  useEffect(() => {
    if (tenderId) {
      fetchBids();
      fetchTenderDetails();
    }
  }, [tenderId]);
  useEffect(() => {
    const BidsDetails = async () => {
      try {
        const responce = await callApiGet(
          `get-bid-details?tender_id=${tenderId}`
        );
        if (responce.success) {
          setBidDetails(responce);
        }
      } catch (error) {
        console.error(" Error Bids Details:", error.message);
      }
    };
    BidsDetails();
  }, [tenderId]);
  // Fetch tender details
  const fetchTenderDetails = async () => {
    try {
      const tenderData = await callApiGet(`get-access-bid/${tenderId}`); // Fetch tender details by ID
      setTender(tenderData.data);
      setFormData(tenderData.data.sub_tenders);
      setFormData1(tenderData.data.sub_tenders);
      setSuggestionData(tenderData.data.suggested_prices.suggestedPrices);
      setLatestBidAmount(tenderData.data.latest_bid.bid_amount);

      console.log("len++++++", tender);
      checkAuctionStatus(
        tenderData.data.auct_start_time,
        tenderData.data.auct_end_time
      );
    } catch (error) {
      console.error("Error fetching tender details:", error.message);
    }
  };
  // Fetch bids for the specific tender
  const fetchBids = async () => {
    try {
      const response = await callApiGet(`tender/bid/${tenderId}`);
      const allBids = response.allBids; // Fetch bids by tender ID
      if (response.success) {
        setBids(response.allBids);
        // setLBidsUserId(response.lowestBid.user_id);
        // setLBid(response.lowestBid.bid_amount);
      }
    } catch (error) {
      console.error("Error fetching bids:", error.message);
    }
  };

  // useEffect(() => {
  //   if (auctionEnded && lBidUserId) {
  //     announceWinner();
  //   }
  // }, [auctionEnded, lBidUserId]);

  // Function to check auction status and calculate countdown
  const checkAuctionStatus = (startTime, endTime) => {
    const now = new Date().getTime();
    const startTimeMs = startTime * 1000;
    const endTimeMs = endTime * 1000;

    if (now >= startTimeMs && now <= endTimeMs) {
      setIsAuctionLive(true);
      calculateTimeLeft(endTimeMs); // Countdown to auction end time
    } else if (now < startTimeMs) {
      setIsAuctionLive(false);
      calculateTimeLeft(startTimeMs); // Countdown to auction start time
    } else {
      setIsAuctionLive(false);
      setAuctionEnded(true); // Auction has ended
      setTimeLeft("Auction is closed");
    }
  };

  // Function to calculate countdown time
  const calculateTimeLeft = (targetTimeMs) => {
    const interval = setInterval(() => {
      const timeLeft = targetTimeMs - new Date().getTime();
      if (timeLeft > 0) {
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        clearInterval(interval);
        setTimeLeft("Auction is closed");
        setIsAuctionLive(false);
        setAuctionEnded(true);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  };
  // Render the position box showing the lowest bid or L1 status
  const renderPositionBox = () => {
    // Retrieve local user data from localStorage
    const localData = JSON.parse(localStorage.getItem("data"));
    const { data } = localData || {}; // Ensure localData exists
    const loggedInUserId = data?.user_id; // Get logged-in user's ID

    // Ensure there are bids before proceeding
    // if (bids.length === 0) {
    //   return <p>No bids placed yet.</p>;
    // }

    // // Find the lowest bid from all bids
    // const lowestBid = bids.reduce((lowest, bid) =>
    //   lowest && lowest.bid_amount < bid.bid_amount ? lowest : bid
    // );

    // Check if the logged-in user has the lowest bid (L1)
    const isL1 = lBidUserId === loggedInUserId;

    // If the auction has ended and the user is L1
    // if (auctionEnded && isL1) {
    //   return (
    //     <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-4 text-center">
    //       <div className="flex justify-center items-center mb-4">
    //         <i className="fas fa-check-circle text-green-700 text-3xl"></i>
    //       </div>
    //       <p className="font-semibold text-lg">
    //         Congratulations! You have successfully secured a quantity of{" "}
    //         {tender.qty_split_criteria} MT at the rate of ₹
    //         {Number(lBid).toFixed(2)} CIF to {tender.dest_port}.
    //       </p>
    //     </div>
    //   );
    // }

    // If the auction is live
    return (
      <div className="">
        {/* <h4 className="text-lg font-semibold mb-2 text-center">Position Box</h4>
        {isAuctionLive ? (
          <p
            className={`p-2 rounded-lg ${isL1 ? "bg-green-100 text-green-800 text-center" : "bg-white text-gray-800"}`}
          >
            {isL1
              ? `You are L1, your Bid value is: ₹${Number(lBid).toFixed(2)} per unit.`
              : `Lowest Bid Value: ₹${Number(lBid).toFixed(2)} per unit.`}
          </p>
        ) : (
          <p>The auction has not started yet.</p>
        )} */}
      </div>
    );
  };

  const validateBidAmount = () => {
    if (!tender || totalBidAmount <= 0) {
      setIsBidValid(false);
      return;
    }

    const { auction_type: auctionType, start_price: startPrice } = tender;

    if (latestBidAmount === 0) {
      if (totalBidAmount > 0) {
        setIsBidValid(true);
      } else {
        setIsBidValid(false);
        if (!toastShown) {
          toast.error("Your bid must be greater than ₹0.");
          setToastShown(true);
        }
      }
      return;
    }
    if (auctionType === "reverse") {
      if (
        (latestBidAmount !== undefined && totalBidAmount < latestBidAmount) ||
        (latestBidAmount === undefined && totalBidAmount < startPrice)
      ) {
        setIsBidValid(true);
      } else {
        setIsBidValid(false);
      }
    } else if (auctionType === "forward") {
      if (
        (latestBidAmount !== undefined && totalBidAmount > latestBidAmount) ||
        (latestBidAmount === undefined && totalBidAmount > startPrice)
      ) {
        setIsBidValid(true);
      } else {
        setIsBidValid(false);
      }
    } else {
      setIsBidValid(false);
      if (!toastShown) {
        toast.error("Unknown auction type. Please contact support.");
        setToastShown(true);
      }
    }
  };
  useEffect(() => {
    if (totalBidAmount > 0) {
      setToastShown(false); // Reset on valid bid input
    }
  }, [totalBidAmount]);
  // Re-validate bid whenever totalBidAmount or tender details change
  useEffect(() => {
    validateBidAmount();
  }, [totalBidAmount, tender]);
  const sendFormData = async () => {
    try {
      const body = {
        headers: tender.headers,
        formdata,
        bid_amount: totalBidAmount,
        tender_id: tenderId,
      };
      const response = await callApiPost("buyer-bid", body);
      if (response.success) {
        toast.success("Bid submitted successfully!");
        fetchTenderDetails();
      } else {
        toast.error("Failed to submit form data.");
      }
    } catch (error) {
      console.error("Error submitting form data:", error.message);
      toast.error("Error submitting form data.");
    }
  };
  const handleInputChangeTable = (subTenderId, rowIndex, cellIndex, value) => {
    const { auction_type: auctionType, start_price: startPrice } = tender;
    const updatedValue = parseFloat(value) || 0;
    const currentValue =
      parseFloat(
        formdata1
          ?.find((subTender) => subTender.id === subTenderId)
          ?.rows?.[rowIndex]?.find((_, cIndex) => cIndex === cellIndex)?.data
      ) || 0;

    let allInputsValid = true;
    if (currentValue) {
      console.log("Updated Values:", updatedValue, currentValue);
    }
    setFormData((prevFormData) =>
      prevFormData.map((subTender) => {
        if (subTender.id === subTenderId) {
          const updatedRows = subTender.rows.map((row, rIndex) => {
            if (rIndex === rowIndex) {
              const updatedRow = row.map((cell, cIndex) => {
                if (cIndex === cellIndex && cell.type === "edit") {
                  if (latestBidAmount === 0) {
                    if (updatedValue > 0) {
                    } else {
                      toast.error("Your bid must be greater than ₹0.");
                      allInputsValid = false;
                      return cell; // Keep the original value
                    }
                  } else {
                    if (!toastShown) {
                      // Subsequent bids: apply auction type validation
                      if (
                        auctionType === "reverse" &&
                        updatedValue > currentValue
                      ) {
                        toast.error(
                          "In a reverse auction, you cannot enter a value higher than the current lowest bid."
                        );
                        allInputsValid = false;
                        setToastShown(true);
                        return cell;
                      } else if (
                        auctionType === "forward" &&
                        updatedValue < currentValue
                      ) {
                        toast.error(
                          "In a forward auction, you cannot enter a value lower than the current highest bid."
                        );
                        allInputsValid = false;
                        setToastShown(true);
                        return cell; // Keep the original value
                      }
                    }
                  }
                  return { ...cell, data: updatedValue };
                }
                return cell; // Return unchanged cells
              });

              const headers = tender.headers;
              const quantityIndex = headers.findIndex(
                (header) => header.table_head.toLowerCase() === "total quantity"
              );
              const rateIndex = headers.findIndex(
                (header) => header.table_head.toLowerCase() === "rate"
              );
              const totalCostIndex = headers.findIndex(
                (header) => header.table_head.toLowerCase() === "total cost"
              );
              if (
                quantityIndex !== -1 &&
                rateIndex !== -1 &&
                totalCostIndex !== -1
              ) {
                const quantity =
                  parseFloat(updatedRow[quantityIndex]?.data) || 0;
                const rate = parseFloat(updatedRow[rateIndex]?.data) || 0;
                const totalCost = quantity * rate;
                updatedRow[totalCostIndex] = {
                  ...updatedRow[totalCostIndex],
                  data: totalCost.toFixed(2),
                };
              }
              return updatedRow;
            }
            return row;
          });
          return { ...subTender, rows: updatedRows };
        }
        return subTender;
      })
    );
    setIsBidValid(allInputsValid);
  };
  const calculateTotalAmount = (rows, headers) => {
    const totalCostIndex = headers.findIndex(
      (header) => header.table_head === "Total Cost"
    );

    if (totalCostIndex === -1) return 0; // If Total Cost column doesn't exist
    return rows.reduce((sum, row) => {
      const totalCost = parseFloat(row[totalCostIndex]?.data) || 0;
      return sum + totalCost;
    }, 0);
  };

  const updateTotalBidAmount = () => {
    const total = formdata.reduce((sum, subTender) => {
      const subTenderTotal = calculateTotalAmount(
        subTender.rows,
        tender.headers
      );
      return sum + subTenderTotal;
    }, 0);
    setTotalBidAmount(total); // Update the total bid amount
  };

  useEffect(() => {
    updateTotalBidAmount();
  }, [formdata]);

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isAuctionLive) {
      setShowPopup(true);
    }
  }, [isAuctionLive]);

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!tender) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"Bid Room, set visibility etc."}
        title={"Bid Room"}
      />

      <div className="fixed top-[80px] right-2 z-25 space-y-3">
        {showPopup && (
          <div className="w-64 p-3 bg-white border border-gray-300 rounded-lg shadow-md">
            {/* Card Content */}
            <div className="flex flex-col items-start">
              <h1 className="text-base font-bold text-gray-800">
                Auction is Live!
              </h1>
            </div>
          </div>
        )}

        {bidDetails?.data?.position && (
          <div className="w-64 p-3 bg-white border border-gray-300 rounded-lg shadow-md">
            {/* Card Content */}
            <div className="flex flex-col items-start">
              {bidDetails.data.position === "L1" ? (
                <h1 className="text-base font-bold text-green-700">
                  🎉 Position: L1
                </h1>
              ) : (
                <div>
                  <h1 className="text-base font-bold text-yellow-600">
                    Aim for L1!
                  </h1>
                  <p className="text-sm text-gray-600">
                    Reduce your bid to reach L1
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {showPopup && (
          <div className="w-64 p-3 bg-white border border-gray-300 rounded-lg shadow-md">
            {/* Card Content */}
            <div className="flex flex-col items-start">
              <p className="text-sm text-gray-600">
                Time Left:{" "}
                <span className="text-green-600 font-bold">{timeLeft}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex mx-auto p-4 w-full">
        <div className="w-full mx-8 bg-white">
          <div className="text-lg p-4">
            <h1>
              <b>{tender.tender_title}</b>
            </h1>
          </div>

          {/* Auction Live Pop-up */}

          {/* Tailwind CSS Animations */}

          {renderPositionBox()}
          <div className="w-full flex flex-wrap p-6 gap-2 sm:flex-row bg-gray-50 justify-between">
            {/* Left Side Cards */}
            <div className="flex flex-col w-full lg:w-[48%] gap-4">
              <div className="bg-gradient-to-r from-blue-100 to-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
                <h5 className="text-xl font-bold mb-3 text-center text-blue-800">
                  Application Schedule
                </h5>
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium text-gray-700">
                      Start Date/Time:
                    </span>
                    <span className="text-gray-800">
                      {new Date(tender.app_start_time * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      End Date/Time:
                    </span>
                    <span className="text-gray-800">
                      {new Date(tender.app_end_time * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
                <h5 className="text-xl font-bold mb-3 text-center text-blue-800">
                  Auction Schedule
                </h5>
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="font-medium text-gray-700">
                      Start Date/Time:
                    </span>
                    <span className="text-gray-800">
                      {new Date(tender.auct_start_time * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">
                      End Date/Time:
                    </span>
                    <span className="text-gray-800">
                      {new Date(tender.auct_end_time * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Card */}
            <div className="bg-white shadow-lg rounded-lg p-8 w-full lg:w-[50%] hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
              <h5 className="text-xl font-bold mb-6 text-center text-blue-800">
                Tender Details
              </h5>
              <div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700">
                    Minimum bid:
                  </span>
                  <span className="text-gray-800">{tender.start_price}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700">Currency:</span>
                  <span className="text-gray-800">{tender.currency}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700">
                    Timeframe For Extension:
                  </span>
                  <span className="text-gray-800">{tender.time_frame_ext}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700">
                    Amount of Time Extension:
                  </span>
                  <span className="text-gray-800">{tender.amt_of_ext}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-medium text-gray-700">
                    Auto Auction Extension before end time:
                  </span>
                  <span className="text-gray-800">
                    {tender.aut_auct_ext_bfr_end_time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Minimum Decrement Bid value:
                  </span>
                  <span className="text-gray-800">
                    ₹{tender.min_decr_bid_val.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {showModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Confirm Update
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to update the bids sheet with the
                  suggested amount?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-all"
                  >
                    No
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}
          {suggestionData?.length > 0 && (
            <div className="p-4 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Suggested Bids for Items
              </h2>
              {/* Grid container for tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestionData?.map((table, tableIndex) => (
                  <div
                    key={tableIndex}
                    className="border border-gray-300 rounded-lg shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                  >
                    <div className="bg-blue-50 px-6 py-4 rounded-t-lg">
                      <h3 className="text-xl font-semibold text-blue-700">
                        {table.subtender_name}
                      </h3>
                    </div>
                    <div className="overflow-x-auto p-4">
                      <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                        <thead className="bg-blue-100">
                          <tr>
                            <th className="border border-gray-300 px-3 py-2 text-blue-800 font-medium">
                              Item
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-blue-800 font-medium">
                              Suggestion Amount
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-blue-800 font-medium">
                              Current Amount
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-blue-800 font-medium">
                              Difference
                            </th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-blue-800 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.items
                            ?.filter((row) => row.suggested_price !== null)
                            .map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 transition-all duration-200"
                              >
                                {/* Item */}
                                <td className="border border-gray-300 px-3 py-2">
                                  {row.item_name}
                                </td>

                                {/* Suggestion Amount */}
                                <td className="border border-gray-300 px-3 py-2">
                                  {row.suggested_price
                                    ? `₹${row.suggested_price}`
                                    : "N/A"}
                                </td>

                                {/* Current Amount (Editable) */}
                                <td className="border border-gray-300 px-3 py-2">
                                  {editingRow?.tableIndex === tableIndex &&
                                  editingRow?.rowIndex === rowIndex ? (
                                    <input
                                      type="number"
                                      value={row.currentAmount}
                                      onChange={(e) =>
                                        handleInputChange(
                                          tableIndex,
                                          rowIndex,
                                          "currentAmount",
                                          e.target.value
                                        )
                                      }
                                      className="p-1 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500"
                                    />
                                  ) : (
                                    `${row.user_rate ? `₹${row.user_rate}` : "N/A"}`
                                  )}
                                </td>

                                {/* Difference */}
                                <td
                                  className={`border border-gray-300 px-3 py-2 font-medium ${
                                    row.difference < 0
                                      ? "text-red-500"
                                      : "text-green-500"
                                  }`}
                                >
                                  {row.user_rate && row.suggested_price
                                    ? (
                                        row.user_rate - row.suggested_price
                                      ).toFixed(2)
                                    : "N/A"}
                                </td>

                                {/* Actions */}
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <button
                                    onClick={() =>
                                      handleActionClickWithDialog(
                                        tableIndex,
                                        rowIndex
                                      )
                                    }
                                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                                  >
                                    Update
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* suggesion End  */}

          {/* Table Data */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-10 p-6 ">
            <h1 className="text-xl font-bold text-gray-800 mb-8 ">
              Bids Sheet
            </h1>
            {formdata.map((subTender) => {
              const totalAmount = calculateTotalAmount(
                subTender.rows,
                tender.headers
              );

              return (
                <div
                  key={subTender.id}
                  className="border-b border-gray-300 p-4 shadow-md rounded-lg bg-white hover:shadow-lg transition-shadow duration-300"
                >
                  <h2 className="text-xl font-bold mb-6 text-blue-700">
                    {subTender.name}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                      <thead className="bg-blue-100 text-gray-700">
                        <tr>
                          {tender.headers.map((header, index) => (
                            <th
                              key={index}
                              className="border border-gray-300 px-4 py-2 font-semibold text-blue-800"
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
                                className="border border-gray-300 px-4 py-2 break-words max-w-[200px] lg:max-w-[450px] text-gray-800"
                              >
                                {cell.type === "edit" ? (
                                  <input
                                    type="number"
                                    value={cell.data ?? ""}
                                    onChange={(e) =>
                                      handleInputChangeTable(
                                        subTender.id,
                                        rowIndex,
                                        cellIndex,
                                        e.target.value
                                      )
                                    }
                                    className="rounded px-2 py-1 border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  />
                                ) : (
                                  cell.data
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {/* Total Amount Row */}
                        <tr className="bg-blue-100 text-gray-700 font-bold">
                          <td
                            colSpan={tender.headers.length - 1}
                            className="border border-gray-300 px-4 py-2 text-right"
                          >
                            Subtender Total Amount
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            <div className="relative flex flex-wrap mt-10  p-6 ">
              {/* Total Bid Amount */}
              <div className="bg-blue-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-blue-700 h-[50px] flex items-center transition-all duration-300 absolute left-2 top-2 transform -translate-y-1/2">
                Total Bid Amount: ₹{totalBidAmount.toFixed(2)}
              </div>

              {/* Submit Bid Button */}
              <div className="absolute right-2 top-2 transform -translate-y-1/2">
                <button
                  onClick={sendFormData}
                  disabled={!isBidValid} // Disable button if bid is invalid
                  className={`${
                    isBidValid
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 cursor-not-allowed"
                  } text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300`}
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
          <div>
            <h3>Bid's summary</h3>
          </div>
        </div>
      </div>

      {/* Add Form Data */}
    </>
  );
};

AccessBidRoom.layout = UserDashboard;
export default AccessBidRoom;
