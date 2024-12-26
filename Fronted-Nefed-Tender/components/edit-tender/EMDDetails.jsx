import React from "react";

const EMDDetails = ({ tenderData, setTenderData }) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">EMD Details</h2>

      {/* EMD Amount */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          EMD Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={tenderData.emdAmount}
          onChange={(e) =>
            setTenderData((prev) => ({ ...prev, emdAmount: e.target.value }))
          }
          placeholder="Enter EMD Amount"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* EMD Level Amount */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          EMD Level Amount <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Use ^^ to add multiple amounts ex: (100^^40^^...n)
        </p>
        <input
          type="text"
          value={tenderData.emdLevelAmount}
          onChange={(e) =>
            setTenderData((prev) => ({ ...prev, emdLevelAmount: e.target.value }))
          }
          placeholder="Enter EMD Level Amount"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
    </div>
  );
};

export default EMDDetails;
