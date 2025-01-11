import React, { useEffect, useState } from "react";
import { callApiGet } from "@/utils/FetchApi";

const TenderSelect = ({ selectedTender, onChange }) => {
  const [tenders, setTenders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellerTenders = async () => {
      try {
        const data = await callApiGet("tender/seller-tenders");
        if (data && data.data) {
          setTenders(data.data);

          // Automatically select the first tender if available
          if (data.data.length > 0 && !selectedTender) {
            const firstTender = data.data[0];
            onChange({ target: { value: firstTender.tender_id } });
          }
        } else {
          throw new Error("Failed to load tenders.");
        }
      } catch (error) {
        console.error("Error fetching tenders:", error.message);
        setError("Failed to fetch tenders.");
      }
    };

    fetchSellerTenders();
  }, [onChange, selectedTender]);

  return (
    <div className="ml-4">
      {error && <p className="text-red-500 text-sm italic mb-2">{error}</p>}
      <select
        id="tenderDropdown"
        value={selectedTender}
        onChange={onChange}
        className="block w-80 pl-4 pr-10 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm hover:border-gray-400 transition ease-in-out duration-200"
      >
        <option value="" className="text-gray-400">
          Select Tender
        </option>
        {Array.isArray(tenders) && tenders.length > 0 ? (
          tenders.map((tender) => (
            <option key={tender.tender_id} value={tender.tender_id}>
              {tender.tender_title.trim()}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No tenders available
          </option>
        )}
      </select>
    </div>
  );
};

export default TenderSelect;
