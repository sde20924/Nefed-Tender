import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function EditableSheet() {
  const [headers, setHeaders] = useState(["S.No", "Item", "Item Description", "UOM", "Total Qty", "Rate"]);
  const [tableData, setTableData] = useState([]);

  // Add a new row to the table
  const handleAddRow = () => {
    const newRow = headers.map(() => ""); // Create a new row with empty values
    setTableData([...tableData, newRow]);
  };

  // Add a new column to the table
  const handleAddColumn = () => {
    const columnName = prompt("Enter the name of the new column:");
    if (columnName) {
      setHeaders([...headers, columnName]);
      setTableData(tableData.map((row) => [...row, ""]));
    }
  };

  // Handle cell editing
  const handleCellEdit = (rowIndex, cellIndex, value) => {
    const updatedData = [...tableData];
    updatedData[rowIndex][cellIndex] = value || "";
    setTableData(updatedData);
  };

  // Download table as Excel
  const handleDownload = () => {
    const dataWithHeaders = [headers, ...tableData];
    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "editable_table.xlsx");
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Editable Excel Table</h2>

      {/* Add Row and Column Buttons */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleAddRow}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Row
        </button>
        <button
          onClick={handleAddColumn}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Column
        </button>
        <button
          onClick={handleDownload}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Download Table
        </button>
      </div>

      {/* Render Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-2 font-bold text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-gray-100 even:bg-white">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      handleCellEdit(rowIndex, cellIndex, e.target.innerText)
                    }
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty Table Message */}
      {tableData.length === 0 && (
        <p className="text-gray-500 mt-4">No data available. Add rows and columns to begin editing.</p>
      )}
    </div>
  );
}