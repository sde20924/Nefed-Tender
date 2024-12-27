// components/AddTender/AuctionItems.js
import React, { useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";

const AuctionItems = ({ auctionType, handleAuctionTypeChange }) => {
  const [accessType, setAccessType] = useState("public");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddBuyerFields, setShowAddBuyerFields] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerDetails, setBuyerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
  });
  const [buyersList, setBuyersList] = useState([
    {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "1234567890",
      companyName: "Acme Corp",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "0987654321",
      companyName: "Global Inc",
    },
  ]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [selectedBuyers, setSelectedBuyers] = useState([]);

  const handleAccessChange = (type) => {
    setAccessType(type);
    if (type === "private") {
      setShowPopup(true);
      setShowAddBuyerFields(false); // Reset add buyer form
    } else {
      setShowPopup(false);
      handlePublicAccess();
    }
  };

  const handlePublicAccess = () => {
    console.log("Data sent to all buyers.");
    // Call your API or function to send data to all buyers
  };

  const handleSearchBuyer = (input) => {
    setBuyerEmail(input);
    if (input.trim() === "") {
      // Show all buyers when the input is empty
      setFilteredBuyers(buyersList);
    } else {
      // Filter buyers based on input
      const matchingBuyers = buyersList.filter((buyer) =>
        buyer.email.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredBuyers(matchingBuyers);
    }
  };
  
  // Show all buyers when popup is opened
  React.useEffect(() => {
    if (showPopup) {
      setFilteredBuyers(buyersList);
    }
  }, [showPopup, buyersList]);

  const handleAddBuyer = () => {
    const newBuyer = { ...buyerDetails };
    setBuyersList([...buyersList, newBuyer]);
    setFilteredBuyers([...filteredBuyers, newBuyer]);
    setBuyerDetails({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
    });
    setShowAddBuyerFields(false);
  };
  console.log("buyer",buyersList);
  console.log("buyer-selected",selectedBuyers);
  console.log("buyer-filtered",filteredBuyers);
  

  const toggleSelectBuyer = (buyer) => {
    setSelectedBuyers((prev) => {
      if (prev.some((b) => b.email === buyer.email)) {
        return prev.filter((b) => b.email !== buyer.email);
      }
      return [...prev, buyer];
    });
  };

  const handleSendTender = () => {
    console.log("Tender sent to selected buyers:", selectedBuyers);
    // API call to send tender to selected buyers
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Auction items</h2>

      {/* Auction Type Section */}
      <div>
        <h3 className="text-lg font-semibold">
          Auction Type<span className="text-red-500">*</span>
        </h3>
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="auctionType"
              value="reverse"
              checked={auctionType === "reverse"}
              onChange={handleAuctionTypeChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Reverse</span>
          </label>

          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              name="auctionType"
              value="forward"
              checked={auctionType === "forward"}
              onChange={handleAuctionTypeChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Forward</span>
          </label>

          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              name="auctionType"
              value="other"
              checked={auctionType === "other"}
              onChange={handleAuctionTypeChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2">Other</span>
          </label>
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-bold mb-4">Access User:</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="access"
                value="public"
                checked={accessType === "public"}
                onChange={() => handleAccessChange("public")}
                className="mr-2"
              />
              Public
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="access"
                value="private"
                checked={accessType === "private"}
                onChange={() => handleAccessChange("private")}
                className="mr-2"
              />
              Private
            </label>
          </div>

          {/* Private Pop-up */}
          {showPopup && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
              <div className="bg-white p-6 rounded-md shadow-lg w-96 relative">
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                  <FaTimes />
                </button>
                <h3 className="text-lg font-bold mb-4">Private Access</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search Buyer by Email:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter buyer email"
                    value={buyerEmail}
                    onChange={(e) => handleSearchBuyer(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 mb-2"
                  />
                  <ul className="bg-gray-100 border border-gray-300 rounded-md max-h-32 overflow-y-auto mb-4">
                    {filteredBuyers.length > 0 ? (
                      filteredBuyers.map((buyer, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 flex items-center hover:bg-gray-200 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBuyers.some(
                              (b) => b.email === buyer.email
                            )}
                            onChange={() => toggleSelectBuyer(buyer)}
                            className="mr-2"
                          />
                          {buyer.firstName} {buyer.lastName} ({buyer.email}) -{" "}
                          {buyer.companyName}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">
                        No matching buyers found
                      </li>
                    )}
                  </ul>
                  {filteredBuyers.length === 0 && (
                    <button
                      onClick={() => setShowAddBuyerFields(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      Add New Buyer
                    </button>
                  )}
                </div>

                {showAddBuyerFields && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold">
                      Add Buyer Details:
                    </h4>
                    <label className="block text-sm font-medium mt-2">
                      First Name:
                    </label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={buyerDetails.firstName}
                      onChange={(e) =>
                        setBuyerDetails({
                          ...buyerDetails,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 mb-2"
                    />
                    <label className="block text-sm font-medium">
                      Last Name:
                    </label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={buyerDetails.lastName}
                      onChange={(e) =>
                        setBuyerDetails({
                          ...buyerDetails,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 mb-2"
                    />
                    <label className="block text-sm font-medium">Email:</label>
                    <input
                      type="email"
                      placeholder="Buyer email"
                      value={buyerDetails.email}
                      onChange={(e) =>
                        setBuyerDetails({
                          ...buyerDetails,
                          email: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 mb-2"
                    />
                    <label className="block text-sm font-medium">Phone:</label>
                    <input
                      type="text"
                      placeholder="Buyer phone"
                      value={buyerDetails.phone}
                      onChange={(e) =>
                        setBuyerDetails({
                          ...buyerDetails,
                          phone: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 mb-2"
                    />
                    <label className="block text-sm font-medium">
                      Company Name:
                    </label>
                    <input
                      type="text"
                      placeholder="Company name"
                      value={buyerDetails.companyName}
                      onChange={(e) =>
                        setBuyerDetails({
                          ...buyerDetails,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md p-2 mb-4"
                    />
                    <button
                      onClick={handleAddBuyer}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      Save Buyer and Add to List
                    </button>
                  </div>
                )}
                {filteredBuyers.length > 0 && (
                  <button
                    onClick={handleSendTender}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                  >
                    Send Tender
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionItems;
