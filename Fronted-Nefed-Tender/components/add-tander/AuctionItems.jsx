// components/AddTender/AuctionItems.js
import React from 'react';
import { FaPlus, FaTrash } from "react-icons/fa";

const AuctionItems = ({
  // auctionFields,
  // handleAddAuction,
  // handleRemoveAuction,
  // handleAuctionInputChange,
  auctionType,
  handleAuctionTypeChange
}) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Auction items</h2>  

      {/* {auctionFields.map((auction, index) => (
        <div key={index} className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Auction Details<span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={
                index === 0
                  ? handleAddAuction
                  : () => handleRemoveAuction(index)
              }
              className={`${
                index === 0 ? "bg-green-500" : "bg-red-500"
              } text-white p-2 rounded-full`}
            >
              {index === 0 ? <FaPlus /> : <FaTrash />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Auction Item
              </label>
              <input
                type="text"
                placeholder="Enter auction item"
                value={auction.name}
                onChange={(e) =>
                  handleAuctionInputChange(
                    index,
                    "name",
                    e.target.value
                  )
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Quantity of Auction
              </label>
              <input
                type="number"
                placeholder="Enter auction quantity"
                value={auction.quantity}
                onChange={(e) =>
                  handleAuctionInputChange(
                    index,
                    "quantity",
                    e.target.value
                  )
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onFocus={(e) =>
                  e.target.addEventListener("wheel", (event) =>
                    event.preventDefault()
                  )
                }
                required
              />
            </div>
          </div>
        </div>
      ))} */}

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
      </div>
    </div>
  );
};

export default AuctionItems;
