import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function EditableSheet() {
  const [headers, setHeaders] = useState([
    "S.No",
    "Item",
    "Item Description",
    "UOM",
    "Total Qty",
    "Rate",
  ]);
  const [subTenders, setSubTenders] = useState([]); // Subtenders data
  console.log("",subTenders);
  

  // Add a new subtender
  const handleAddSubTender = () => {
    const subTenderName = prompt("Enter the Subtender Name:");
    if (subTenderName) {
      setSubTenders([
        ...subTenders,
        { id: subTenders.length + 1, name: subTenderName, rows: [] },
      ]);
    }
  };

  // Add a new row to a specific subtender
  const handleAddRowToSubTender = (subTenderId) => {
    setSubTenders(
      subTenders.map((subTender) => {
        if (subTender.id === subTenderId) {
          const newRow = headers.map(() => "");
          const newRowNumber = `${subTender.id}.${subTender.rows.length + 1}`;
          newRow[0] = newRowNumber; // Set S.No as hierarchical numbering
          return { ...subTender, rows: [...subTender.rows, newRow] };
        }
        return subTender;
      })
    );
  };

  // Add a new column to the table
  const handleAddColumn = () => {
    const columnName = prompt("Enter the name of the new column:");
    if (columnName) {
      setHeaders([...headers, columnName]);
      setSubTenders(
        subTenders.map((subTender) => ({
          ...subTender,
          rows: subTender.rows.map((row) => [...row, ""]),
        }))
      );
    }
  };

  // Handle cell editing
  const handleCellEdit = (subTenderId, rowIndex, cellIndex, value) => {
    setSubTenders(
      subTenders.map((subTender) => {
        if (subTender.id === subTenderId) {
          const updatedRows = [...subTender.rows];
          updatedRows[rowIndex][cellIndex] = value || "";
          return { ...subTender, rows: updatedRows };
        }
        return subTender;
      })
    );
  };

  // Download table as Excel
  const handleDownload = () => {
    const worksheetData = [];

    subTenders.forEach((subTender) => {
      worksheetData.push([subTender.name]); // Subtender name as a header
      worksheetData.push(headers); // Column headers
      worksheetData.push(...subTender.rows); // Rows under the subtender
      worksheetData.push([]); // Blank row for separation
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "editable_subtender_table.xlsx");
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Editable Subtender Table</h2>

      {/* Add SubTender and Column Buttons */}
      <div className="flex space-x-4 mb-4">
        <button
          type="button"
          onClick={handleAddSubTender}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Add SubTender
        </button>
        <button
          type="button"
          onClick={handleAddColumn}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Add Column
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Download Table
        </button>
      </div>

      {/* Render SubTenders and their respective tables */}
      {subTenders.map((subTender) => (
        <div key={subTender.id} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            {subTender.id}. {subTender.name}
          </h3>
          <button
            type="button"
            onClick={() => handleAddRowToSubTender(subTender.id)}
            className="mb-2 bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded"
          >
            Add Row
          </button>
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
                {subTender.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="odd:bg-gray-100 even:bg-white">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-4 py-2 text-gray-700"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          handleCellEdit(
                            subTender.id,
                            rowIndex,
                            cellIndex,
                            e.target.innerText
                          )
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
        </div>
      ))}
    </div>
  );
}
