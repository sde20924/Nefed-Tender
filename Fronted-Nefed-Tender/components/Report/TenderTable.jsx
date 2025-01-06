import React, { useState, useEffect } from "react";

const TenderTable = ({ data }) => {
  const [headers, setHeaders] = useState([]);
  const [subTenders, setSubTenders] = useState({});
  const [buyersData, setBuyersData] = useState({});
  const [groupedHeadersByBuyers, setGroupedHeadersByBuyers] = useState([]);

  useEffect(() => {
    if (data) {
      setHeaders(data.tenderDetails.headers || []);
      setSubTenders(data.tenderDetails.sub_tenders || {});
      setBuyersData(data.subTendersByBuyer || {});
      setGroupedHeadersByBuyers(data.headersChangedByBuyers || {});
    }
  }, [data]);

  const renderHeaders = () => {
    return (
      <tr>
        {headers.map((header) => (
          <th
            key={header.header_id}
            rowSpan="2"
            className="px-4 py-2 border border-gray-300 bg-gray-100 text-center font-bold text-sm"
          >
            {header.table_head}
          </th>
        ))}
        {Object.values(groupedHeadersByBuyers).map((buyerGroup) => (
          <th
            key={buyerGroup.buyer_id}
            colSpan={buyerGroup.headers.length}
            className="px-4 py-2 border border-gray-300 bg-green-100 text-center font-bold text-sm"
          >
            {buyerGroup.buyer_name}
          </th>
        ))}
      </tr>
    );
  };
  const renderBuyerSpecificHeaders = () => {
    return (
      <tr>
        {Object.values(groupedHeadersByBuyers).map((buyerGroup) =>
          buyerGroup.headers.map((header) => (
            <th
              key={`${buyerGroup.buyer_id}-${header.header_id}`}
              className="px-4 py-2 border border-gray-300 bg-yellow-100 text-center font-bold text-sm"
            >
              {header.header_name}
            </th>
          ))
        )}
      </tr>
    );
  };
  const renderRows = (subTenderId, rows) => {
    return rows.map((row, rowIndex) => (
      <tr
        key={rowIndex}
        className={`${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
      >
        {row.map(
          (cell, cellIndex) =>
            cell?.type === "view" && (
              <td
                key={cellIndex}
                className="px-4 py-2 border border-gray-300 text-center"
              >
                {cell?.row_data || "-"}
              </td>
            )
        )}
        {Object.values(groupedHeadersByBuyers).map((buyerGroup) =>
          buyerGroup.headers.map((header) => {
            const buyerSubTender = buyersData[buyerGroup.buyer_id]?.[subTenderId];
            const buyerRow = buyerSubTender?.rows[rowIndex] || [];
            const matchingCell = buyerRow.find(
              (cell) => cell?.header_id === header.header_id
            );
            return (
              <td
                key={`${rowIndex}-${header.header_id}-${buyerGroup.buyer_id}`}
                className="px-4 py-2 border border-gray-300 text-center"
              >
                {matchingCell?.row_data || "-"}
              </td>
            );
          })
        )}
      </tr>
    ));
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
                    {renderHeaders()}
                    {renderBuyerSpecificHeaders()}
                  </thead>
                  <tbody>{renderRows(subTenderId, subTender.rows)}</tbody>
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
