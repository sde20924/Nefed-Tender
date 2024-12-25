// components/AddTender/EMDDetails.js
import React from 'react';

const EMDDetails = ({ emdAmount, setEmdAmount, emdLevelAmount, setEmdLevelAmount }) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">EMD Details</h2>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="emdAmount"
        >
          EMD Amount<span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="emdAmount"
          value={emdAmount}
          onChange={(e) => setEmdAmount(e.target.value)}
          placeholder="Enter EMD Amount"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          onFocus={(e) =>
            e.target.addEventListener("wheel", (event) =>
              event.preventDefault()
            )
          }
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="emdLevelAmount"
        >
          EMD Level Amount<span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Use ^^ to add multiple amounts ex: (100^^40^^...n)
        </p>
        <input
          type="number"
          id="emdLevelAmount"
          value={emdLevelAmount}
          onChange={(e) => setEmdLevelAmount(e.target.value)}
          placeholder="Enter EMD Amount"
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

export default EMDDetails;
