import React from "react";
import DatePicker from "react-datepicker";


const FullDetails = ({ tenderData, setTenderData }) => {
  // Reusable handleChange function
  const handleChange = (key, value) => {
    setTenderData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Details</h2>

      {/* Currency */}
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="currency"
        >
          Currency<span className="text-red-500">*</span>
        </label>
        <select
          id="currency"
          value={tenderData.currency || ""}
          onChange={(e) => handleChange("currency", e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="INR(₹)">INR(₹)</option>
          <option value="USD($)">USD($)</option>
          <option value="EUR(€)">EUR(€)</option>
        </select>
      </div>

      {/* Starting Price */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Starting Price<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={tenderData.startingPrice || ""}
          onChange={(e) => handleChange("startingPrice", e.target.value)}
          placeholder="Enter Starting Price"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>


      {/* Destination Port */}
      {/* <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Destination Port<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={tenderData.destinationPort || ""}
          onChange={(e) => handleChange("destinationPort", e.target.value)}
          placeholder="Enter Destination Port"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Bag Size */}
      {/* <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Bag Size<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={tenderData.bagSize || ""}
          onChange={(e) => handleChange("bagSize", e.target.value)}
          placeholder="Enter Bag Size"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Bag Type */}
      {/* <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Bag Type<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={tenderData.bagType || ""}
          onChange={(e) => handleChange("bagType", e.target.value)}
          placeholder="Enter Bag Type"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Measurement Unit */}

      {/* Application Start */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Application Start Date/Time <span className="text-red-500">*</span>
        </label>
        <DatePicker
          selected={tenderData.applicationStart || null}
          onChange={(date) => handleChange("applicationStart", date)}
          showTimeSelect
          dateFormat="MM/dd/yyyy hh:mm aa"
          placeholderText="mm/dd/yyyy --:-- --"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          wrapperClassName="w-full"
          required
        />
      </div>

      {/* Application End */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Application End Date/Time <span className="text-red-500">*</span>
        </label>
        <DatePicker
          selected={tenderData.applicationEnd || null}
          onChange={(date) => handleChange("applicationEnd", date)}
          showTimeSelect
          dateFormat="MM/dd/yyyy hh:mm aa"
          placeholderText="mm/dd/yyyy --:-- --"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          wrapperClassName="w-full"
          required
          minDate={tenderData.applicationStart || new Date()}
          disabled={!tenderData.applicationStart}
        />
      </div>

      {/* Auction Start */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Auction Start Date/Time <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Applicants can start bidding from this date/time.
        </p>
        <DatePicker
          selected={tenderData.auctionStart || null}
          onChange={(date) => handleChange("auctionStart", date)}
          showTimeSelect
          dateFormat="MM/dd/yyyy hh:mm aa"
          placeholderText="mm/dd/yyyy --:-- --"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          wrapperClassName="w-full"
          required
        />
      </div>

      {/* Auction End */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Auction End Date/Time <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Auction stops accepting bids after this date/time unless extended.
        </p>
        <DatePicker
          selected={tenderData.auctionEnd || null}
          onChange={(date) => handleChange("auctionEnd", date)}
          showTimeSelect
          dateFormat="MM/dd/yyyy hh:mm aa"
          placeholderText="mm/dd/yyyy --:-- --"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          wrapperClassName="w-full"
          required
        />
      </div>

      {/* Extension Minutes */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Timeframe For Extension (minutes)
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          If a bid happens in the last X minutes, the end time is extended.
        </p>
        <input
          type="number"
          value={tenderData.extensionMinutes || ""}
          onChange={(e) => handleChange("extensionMinutes", e.target.value)}
          placeholder="Enter Auto Auction Extension Minutes"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Extended At */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Extended At
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Tracks when the auction was last extended. (Optional)
        </p>
        <DatePicker
          selected={tenderData.extendedAt || null}
          onChange={(date) => handleChange("extendedAt", date)}
          showTimeSelect
          dateFormat="MM/dd/yyyy hh:mm aa"
          placeholderText="mm/dd/yyyy --:-- --"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          wrapperClassName="w-full"
        />
      </div>

      {/* Time Extension */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount of Time Extension <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          If triggered, how many minutes are added?
        </p>
        <input
          type="number"
          value={tenderData.timeExtension || ""}
          onChange={(e) => handleChange("timeExtension", e.target.value)}
          placeholder="Enter Auto Auction Extension"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Extension Before Endtime */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Auto Auction Extension Before Endtime
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          How many times can the timer be extended when a last-minute bid occurs?
        </p>
        <input
          type="number"
          value={tenderData.extensionBeforeEndtime || ""}
          onChange={(e) => handleChange("extensionBeforeEndtime", e.target.value)}
          placeholder="Enter number of times extension is allowed"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Min Decrement Value */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Minimum Decrement Bid Value <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          The amount by which each subsequent bid must decrease.
        </p>
        <input
          type="number"
          value={tenderData.minDecrementValue || ""}
          onChange={(e) => handleChange("minDecrementValue", e.target.value)}
          placeholder="Enter Minimum Decrement Value"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Timer Extended Value */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Timer Extended Value <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          How many times has the timer been extended? (Set 0 if new)
        </p>
        <input
          type="number"
          value={tenderData.timerExtendedValue || ""}
          onChange={(e) => handleChange("timerExtendedValue", e.target.value)}
          placeholder="Enter Timer Extended Value"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Qty Splitting Criteria */}
      {/* <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Qty Splitting Criteria <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Example: 100^^40^^...n (First is round one, others are level Qtys).
        </p>
        <input
          type="text"
          value={tenderData.qtySplittingCriteria || ""}
          onChange={(e) =>
            handleChange("qtySplittingCriteria", e.target.value)
          }
          placeholder="Enter Splitting Criteria"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Counter Offer Timer */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Counter Offer Acceptance Timer <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Defines how long (in minutes) a counter offer can remain valid.
        </p>
        <input
          type="number"
          value={tenderData.counterOfferTimer || ""}
          onChange={(e) => handleChange("counterOfferTimer", e.target.value)}
          placeholder="Enter Counter Offer Acceptance Timer"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
    </div>
  );
};

export default FullDetails;
