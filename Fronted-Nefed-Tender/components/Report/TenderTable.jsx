import React, { useState, useEffect } from "react";

function getUniqueBuyersForHeader(headerName, headersChangedByBuyers = []) {
  const relevantChanges = headersChangedByBuyers.filter(
    (item) => item.header_name === headerName
  );
  const seen = new Set();
  const uniqueBuyers = [];
  relevantChanges.forEach((item) => {
    if (!seen.has(item.buyer_id)) {
      seen.add(item.buyer_id);
      uniqueBuyers.push({
        buyer_id: item.buyer_id,
        buyer_name: item.buyer_name,
      });
    }
  });
  return uniqueBuyers;
}

const TenderTable = ({ data }) => {
  const [headers, setHeaders] = useState([]);
  const [subTenders, setSubTenders] = useState({});
  const [buyersData, setBuyersData] = useState({});
  const [headersChangedByBuyers, setHeadersChangedByBuyers] = useState([]);

  useEffect(() => {
    if (data) {
      // Only set headers not present in headersChangedByBuyers
      const nonBuyerHeaders = data.tenderDetails.headers.filter(
        (header) =>
          !data.headersChangedByBuyers.some(
            (buyerHeader) => buyerHeader.header_id === header.header_id
          )
      );

      setHeaders(data.tenderDetails.headers);
      setSubTenders(data.tenderDetails.sub_tenders || {});
      setBuyersData(data.subTendersByBuyer || {});
      setHeadersChangedByBuyers(data.headersChangedByBuyers || []);
    }
  }, [data]);

  const renderBuyerHeaders = () => {
    // Render buyer-specific headers
    const groupedHeaders = headersChangedByBuyers.reduce((acc, header) => {
      const { header_name, buyer_id, buyer_name } = header;
      if (!acc[header_name]) {
        acc[header_name] = [];
      }
      acc[header_name].push({ buyer_id, buyer_name });
      return acc;
    }, {});

    return Object.keys(groupedHeaders).map((headerName) => {
      const buyers = groupedHeaders[headerName];
      if (buyers.length === 1) {
        const b = buyers[0];
        return (
          <th
            key={`${headerName}-single-${b.buyer_id}`}
            colSpan={1}
            className="px-4 py-2 border border-gray-300 bg-green-100 text-center font-bold text-sm"
          >
            {headerName} ({b.buyer_name})
          </th>
        );
      } else {
        return buyers.map((b) => (
          <th
            key={`${headerName}-multi-${b.buyer_id}`}
            className="px-4 py-2 border border-gray-300 bg-green-100 text-center font-bold text-sm"
          >
            {headerName} ({b.buyer_name})
          </th>
        ));
      }
    });
  };

  const renderBuyerCells = (subTenderId, rowIndex) => {
    const groupedHeaders = headersChangedByBuyers.reduce((acc, header) => {
      const { header_id, buyer_id, header_name } = header;
      if (!acc[header_name]) {
        acc[header_name] = [];
      }
      acc[header_name].push({ header_id, buyer_id });
      return acc;
    }, {});

    return Object.keys(groupedHeaders).map((headerName) => {
      const buyers = groupedHeaders[headerName];
      return buyers.map((b) =>
        renderOneBuyerCell(
          subTenderId,
          rowIndex,
          b.header_id,
          b.buyer_id,
          headerName
        )
      );
    });
  };

  const renderOneBuyerCell = (subTenderId, rowIndex, headerId, buyerId) => {
    const buyerSubTender = buyersData[buyerId]?.[subTenderId];
    if (!buyerSubTender || !buyerSubTender.rows[rowIndex]) {
      return (
        <td key={`${subTenderId}-${rowIndex}-${headerId}-${buyerId}`} className="border px-4 py-2">
          -
        </td>
      );
    }

    const row = buyerSubTender.rows[rowIndex];
    const matchingCell = row.find((cell) => cell?.header_id === headerId);
    return (
      <td
        key={`${subTenderId}-${rowIndex}-${headerId}-${buyerId}`}
        className="border px-4 py-2 bg-yellow-100 text-right"
      >
        {matchingCell?.row_data || "-"}
      </td>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Tender: {data?.tenderDetails?.tender_title}
      </h1>
      <div className="bg-white p-4 rounded shadow">
        {Object.keys(subTenders).map((subTenderId) => {
          const subTender = subTenders[subTenderId];
          return (
            <div key={subTenderId} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                Sub-Tender: {subTender.name}
              </h2>
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header.header_id}
                          className="px-4 py-2 border border-gray-300 bg-gray-100 text-left font-bold text-sm"
                        >
                          {header.table_head}
                        </th>
                      ))}
                      {renderBuyerHeaders()}
                    </tr>
                  </thead>
                  <tbody>
                    {subTender.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`${
                          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-gray-100`}
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`px-4 py-2 border border-gray-300 ${
                              cell?.type === "edit" ? "bg-yellow-100" : ""
                            }`}
                          >
                            {cell?.row_data || "-"}
                          </td>
                        ))}
                        {renderBuyerCells(subTenderId, rowIndex)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TenderTable;
