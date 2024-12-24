import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function EditableExcelTable() {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);

  // Handle File Upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1, // Get raw array data
        });

        // Extract headers and rows, filling empty cells with 'N/A'
        const extractedHeaders = jsonData[0] || [];
        const extractedRows = jsonData.slice(1);

        // Find the maximum number of columns
        const maxColumns = Math.max(
          extractedHeaders.length,
          ...extractedRows.map((row) => row.length)
        );

        // Normalize headers and rows to ensure consistent column count
        const normalizedHeaders = Array.from(
          { length: maxColumns },
          (_, i) => extractedHeaders[i] || " "
        );
        const normalizedRows = extractedRows.map((row) =>
          Array.from({ length: maxColumns }, (_, i) => row[i] || " ")
        );

        setHeaders(normalizedHeaders);
        setTableData(normalizedRows);
      };

      reader.readAsBinaryString(file);
    }
  };

  // Handle Cell Edit
  const handleCellEdit = (rowIndex, cellIndex, value) => {
    const updatedData = [...tableData];
    updatedData[rowIndex][cellIndex] = value || " ";
    setTableData(updatedData);
  };

  // Download Edited Data as Excel
  const handleDownload = () => {
    const dataWithHeaders = [headers, ...tableData];
    const worksheet = XLSX.utils.aoa_to_sheet(dataWithHeaders); // Convert array of arrays to a worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "edited_data.xlsx");
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Upload, Edit, and Download Excel Data</h2>

      {/* File Upload */}
      <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer mb-4 inline-block">
        Upload Excel Sheet
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* Render Table */}
      {tableData.length > 0 && (
        <div className="overflow-x-auto mt-4">
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
      )}

      {tableData.length === 0 && (
        <p className="text-gray-500 mt-4">
          No data to display. Upload a valid Excel file.
        </p>
      )}

      {/* Download Button */}
      {tableData.length > 0 && (
        <button
          onClick={handleDownload}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Download Edited Sheet
        </button>
      )}
    </div>
  );
}
