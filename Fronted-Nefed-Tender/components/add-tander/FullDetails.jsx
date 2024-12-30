// components/AddTender/TenderDetailsForm.js
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FullDetails = ({
  currency, setCurrency,
  startingPrice, setStartingPrice,
  // quantity, setQuantity,
  // destinationPort, setDestinationPort,
  // bagSize, setBagSize,
  // bagType, setBagType,
  // measurmentUnit, setMeasurmentUnit,
  applicationStart, handleApplicationStartChange,
  applicationEnd, handleApplicationEndChange,
  auctionStart, setAuctionStart,
  auctionEnd, setAuctionEnd,
  extensionMinutes, setExtensionMinutes,
  extendedAt, setExtendedAt,
  timeExtension, setTimeExtension,
  extensionBeforeEndtime, setExtensionBeforeEndtime,
  minDecrementValue, setMinDecrementValue,
  timerExtendedValue, setTimerExtendedValue,
  qtySplittingCriteria, setQtySplittingCriteria,
  counterOfferTimer, setCounterOfferTimer
}) => {
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
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
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
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="startingPrice"
        >
          Starting Price<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="startingPrice"
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value)}
          placeholder="Enter Starting Price"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Quantity */}
      {/* <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="quantity"
        >
          Quantity<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter Quantity"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div> */}

      {/* Destination Port */}
      {/* <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="destinationPort"
        >
          Destination Port<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="destinationPort"
          value={destinationPort}
          onChange={(e) => setDestinationPort(e.target.value)}
          placeholder="Enter Destination Port"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Bag Size */}
      {/* <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="bagSize"
        >
          Bag Size<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="bagSize"
          value={bagSize}
          onChange={(e) => setBagSize(e.target.value)}
          placeholder="Enter Bag Size"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Bag Type */}
      {/* <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="bagType"
        >
          Bag Type<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="bagType"
          value={bagType}
          onChange={(e) => setBagType(e.target.value)}
          placeholder="Enter Bag Type"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Measurement Unit */}
      {/* <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="measurmentUnit"
        >
          Measurement Unit<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="measurmentUnit"
          value={measurmentUnit}
          onChange={(e) => setMeasurmentUnit(e.target.value)}
          placeholder="Enter Measurement Unit"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div> */}

      {/* Application Start Date/Time */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Application Start Date/Time
          <span className="text-red-500">*</span>
        </label>
        <div className="w-full">
          <DatePicker
            selected={applicationStart}
            onChange={handleApplicationStartChange}
            showTimeSelect
            dateFormat="MM/dd/yyyy hh:mm aa"
            placeholderText="mm/dd/yyyy --:-- --"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            wrapperClassName="w-full"
            required
          />
        </div>
      </div>

      {/* Application End Date/Time */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Application End Date/Time
          <span className="text-red-500">*</span>
        </label>
        <div className="w-full">
          <DatePicker
            selected={applicationEnd}
            onChange={handleApplicationEndChange}
            showTimeSelect
            dateFormat="MM/dd/yyyy hh:mm aa"
            placeholderText="mm/dd/yyyy --:-- --"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            wrapperClassName="w-full"
            required
            minDate={applicationStart || new Date()} // Prevent selecting dates before the start date
            disabled={!applicationStart} // Disable until start date is selected
          />
        </div>
      </div>

      {/* Auction Start Date/Time */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Auction Start Date/Time
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Set proper date and time (AM/PM) - From this date and time
          auction actually starts. Allow applicants to start bidding.
        </p>
        <div className="w-full">
          <DatePicker
            selected={auctionStart}
            onChange={(date) => setAuctionStart(date)}
            showTimeSelect
            dateFormat="MM/dd/yyyy hh:mm aa"
            placeholderText="mm/dd/yyyy --:-- --"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            wrapperClassName="w-full"
            required
          />
        </div>
      </div>

      {/* Auction End Date/Time */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Auction End Date/Time
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Set proper date and time (AM/PM) - From this date and time
          auction actually stops. Restricts applicants from bidding.
          (Based on the condition, our system auto increments the
          deadline)
        </p>
        <div className="w-full">
          <DatePicker
            selected={auctionEnd}
            onChange={(date) => setAuctionEnd(date)}
            showTimeSelect
            dateFormat="MM/dd/yyyy hh:mm aa"
            placeholderText="mm/dd/yyyy --:-- --"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            wrapperClassName="w-full"
            required
          />
        </div>
      </div>

      {/* Timeframe For Extension */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Timeframe For Extension (Check from last in minutes)
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This time extends on auction_end_date and time
          automatically when a bid happens in the last
          auto_extension_minutes
        </p>
        <input
          type="number"
          value={extensionMinutes}
          onChange={(e) => setExtensionMinutes(e.target.value)}
          placeholder="Enter Auto Auction Extension Minutes"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Extended At */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Extended At
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This time extends on extended at and time automatically
          extended
        </p>
        <div className="w-full">
          <DatePicker
            selected={extendedAt}
            onChange={(date) => setExtendedAt(date)}
            showTimeSelect
            dateFormat="MM/dd/yyyy hh:mm aa"
            placeholderText="mm/dd/yyyy --:-- --"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      {/* Amount of Time Extension */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Amount of Time Extension
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This value is (time in min) used in extending when a bid
          occurs in the last movement
        </p>
        <input
          type="number"
          value={timeExtension}
          onChange={(e) => setTimeExtension(e.target.value)}
          placeholder="Enter Auto Auction Extension Number Time"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Auto Auction Extension before end time */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Auto Auction Extension before end time
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This value defines the number of times the timer can be
          extended when the last movement bid happens.
        </p>
        <input
          type="number"
          value={extensionBeforeEndtime}
          onChange={(e) =>
            setExtensionBeforeEndtime(e.target.value)
          }
          placeholder="Enter Auto Auction Extension Before Endtime"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Minimum Decrement Bid Value */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Minimum Decrement Bid Value
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This value defines the amount of decrement in each bid
          request.
        </p>
        <input
          type="number"
          value={minDecrementValue}
          onChange={(e) => setMinDecrementValue(e.target.value)}
          placeholder="Enter Counter Offer Acceptance Timer"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Timer Extended Value */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Timer Extended Value
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This value defines how many times the timer is extended
          (if you are starting again, keep this value 0).
        </p>
        <input
          type="number"
          value={timerExtendedValue}
          onChange={(e) => setTimerExtendedValue(e.target.value)}
          placeholder="Enter Timer Extended Value"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Qty Splitting Criteria */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Qty Splitting Criteria
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This value defines chunks of qty available for the main
          auction or counter rounds. (100^^40^^...n) First qty is
          always round one, and then all are Level Qty.
        </p>
        <input
          type="number"
          value={qtySplittingCriteria}
          onChange={(e) => setQtySplittingCriteria(e.target.value)}
          placeholder="Enter Qty Splitting Criteria"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      {/* Counter Offer Acceptance Timer */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Counter Offer Acceptance Timer
          <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          This value defines the amount of decrement in each bid
          request.
        </p>
        <input
          type="number"
          value={counterOfferTimer}
          onChange={(e) => setCounterOfferTimer(e.target.value)}
          placeholder="Enter Counter Offer Acceptance Timer"
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
  );
};

export default FullDetails;
