import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify"; // Importing toast for notifications
import "react-toastify/dist/ReactToastify.css";

export default function EditableSheet({ headers, setHeaders, subTenders, setSubTenders }) {
 

  console.log("header",headers)
  console.log("tender",subTenders);
  
  // Add a new subtender
  const handleAddSubTender = () => {
    const subTenderName = prompt("Enter the Subtender Name:");
    if (subTenderName) {
      setSubTenders((prev) => [
        ...prev,
        { id: prev.length + 1, name: subTenderName, rows: [] },
      ]);
    }
  };

  // Add a new row to a specific subtender
  const handleAddRowToSubTender = (subTenderId) => {
    setSubTenders((prev) =>
      prev.map((subTender) => {
        if (subTender.id === subTenderId) {
          const newRow = headers.map(() => "");
          // Template literal with backticks:
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
      setHeaders((prev) => [...prev, columnName]);
      setSubTenders((prev) =>
        prev.map((subTender) => ({
          ...subTender,
          rows: subTender.rows.map((row) => [...row, ""]),
        }))
      );
    }
  };

  // Handle cell editing
  const handleCellEdit = (subTenderId, rowIndex, cellIndex, value) => {
    setSubTenders((prev) =>
      prev.map((subTender) => {
        if (subTender.id === subTenderId) {
          const updatedRows = [...subTender.rows];
          updatedRows[rowIndex][cellIndex] = value || "";
          return { ...subTender, rows: updatedRows };
        }
        return subTender;
      })
    );
  };

  // Delete a specific row within a subtender
  const handleDeleteRow = (subTenderId, rowIndex) => {
    if (window.confirm("Are you sure you want to delete this row?")) {
      setSubTenders((prev) =>
        prev.map((subTender) => {
          if (subTender.id === subTenderId) {
            const updatedRows = subTender.rows.filter(
              (_, index) => index !== rowIndex
            );

            // Reassign S.No after deletion
            const reassignedRows = updatedRows.map((row, i) => {
              row[0] = `${subTender.id}.${i + 1}`;
              return row;
            });

            return { ...subTender, rows: reassignedRows };
          }
          return subTender;
        })
      );
    }
  };

  // Delete an entire SubTender table
  const handleDeleteSubTender = (subTenderId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    // 1) Filter out the deleted SubTender
    // 2) Reindex the remaining SubTenders’ ids
    // 3) Reassign row numbers for each SubTender
    const updatedSubTenders = subTenders
      .filter((st) => st.id !== subTenderId)
      .map((st, newIndex) => {
        const newId = newIndex + 1;
        // Also reassign row numbering to reflect this new SubTender id
        const updatedRows = st.rows.map((row, i) => {
          row[0] = `${newId}.${i + 1}`;
          return row;
        });
        return {
          ...st,
          id: newId,
          rows: updatedRows,
        };
      });

    setSubTenders(updatedSubTenders);
    toast.success("Table has been deleted and reindexed.");
  };

  // Delete a specific column
  const handleDeleteColumn = () => {
    const columnToDelete = prompt(
      `Enter the column name to delete:\n${headers.join(", ")}`
    );

    if (!columnToDelete || !headers.includes(columnToDelete)) {
      toast.error("Invalid column name or column does not exist.");
      return;
    }

    const colIndex = headers.indexOf(columnToDelete);

    // Remove the column from headers
    const updatedHeaders = headers.filter((_, index) => index !== colIndex);
    setHeaders(updatedHeaders);

    // Remove the corresponding cell from each row in all subtenders
    setSubTenders((prev) =>
      prev.map((subTender) => ({
        ...subTender,
        rows: subTender.rows.map((row) =>
          row.filter((_, index) => index !== colIndex)
        ),
      }))
    );

    toast.success(`Column "${columnToDelete}" has been deleted.`);
  };

  // Parse uploaded sheet data into subtenders
  const parseSheetData = (sheetData) => {
    const newSubTenders = [];
    let currentSubTender = null;

    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      const item = row[1]?.trim(); // Second column (Item)
      const description = row[2]?.trim(); // Third column (Item Description)

      if (item && !description) {
        // Start a new subtender
        if (currentSubTender) {
          newSubTenders.push(currentSubTender);
        }
        currentSubTender = {
          id: newSubTenders.length + 1,
          name: item,
          rows: [],
        };
      } else if (description && currentSubTender) {
        // Add row to the current subtender
        const formattedRow = headers.map((_, index) => row[index] || "");
        currentSubTender.rows.push(formattedRow);
      }
    }

    // Push the last subtender if any
    if (currentSubTender) {
      newSubTenders.push(currentSubTender);
    }

    setSubTenders(newSubTenders);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length > 0) {
          parseSheetData(jsonData);
        } else {
          alert("The uploaded file is empty.");
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  // Download table as Excel
  const handleDownload = () => {
    const worksheetData = [];
  
    worksheetData.push([...headers]);
    subTenders.forEach((subTender) => {
      const subTenderHeaderRow = new Array(headers.length).fill("");
      subTenderHeaderRow[0] = subTender.id
      subTenderHeaderRow[1] = subTender.name;
      worksheetData.push(subTenderHeaderRow);
      worksheetData.push(...subTender.rows);
  
      worksheetData.push([]);
    });
  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    // Build a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
    // Download the file
    XLSX.writeFile(workbook, "editable_subtender_table.xlsx");
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Editable Subtender Table</h2>

      {/* File Upload */}
      <div className="mb-4">
        <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
          Upload Excel Sheet
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Action Buttons */}
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
          onClick={handleDeleteColumn}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Delete Column
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
        <div key={subTender.id} className="mb-6 border border-black p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold">
              {subTender.id}. {subTender.name}
            </h3>
            <button
              type="button"
              onClick={() => handleDeleteSubTender(subTender.id)}
              className="hover:bg-red-600 hover:text-white text-black font-bold py-1 px-3 rounded flex items-center"
            >
              <FaTrash className="mr-1" />
            </button>
          </div>

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
                  <th className="border border-gray-300 px-4 py-2 font-bold text-gray-600">
                    Actions
                  </th>
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
                    <td className="text-center align-middle border border-gray-300 px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(subTender.id, rowIndex)}
                        className=" bg-gray-300 text-white font-bold py-1 px-3 rounded flex items-center"
                      >
                        <FaTrash className="mr-1" /> 
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ToastContainer />
        </div>
      ))}

      {/* ToastContainer for notifications (place one at a global level) */}
    </div>
  );
}
