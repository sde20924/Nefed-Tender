import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify"; // Importing toast for notifications

export default function EditableSheet({
  headers,
  setHeaders,
  subTenders,
  setSubTenders,
  selectedCategory,
}) {
  // Add a new subtender
  console.log("headerrrr", headers);

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [newSubTenderName, setNewSubTenderName] = useState(""); // State for the new SubTender name
  const [newColumnType, setNewColumnType] = useState("view");

  const handleColumnTypeChange = (e) => {
    setNewColumnType(e.target.value);
  };
  // Function to open the modal
  const openAddSubTenderModal = () => {
    if (selectedCategory === "" || selectedCategory === null) {
      toast.success("Select the categories first");
      return;
    }

    setIsModalOpen(true); // Show modal
  };
  const [showModal, setShowModal] = useState(false);

  // Function to handle input change for SubTender name
  const handleSubTenderNameChange = (e) => {
    setNewSubTenderName(e.target.value); // Set the new SubTender name
  };

  // Function to confirm adding the new SubTender
  const confirmAddSubTender = () => {
    if (newSubTenderName.trim()) {
      setSubTenders((prev) => [
        ...prev,
        { id: prev.length + 1, name: newSubTenderName, rows: [] },
      ]);
      setIsModalOpen(false); // Close the modal
      setNewSubTenderName(""); // Clear input field
      toast.success(`SubTender "${newSubTenderName}" added successfully.`);
    } else {
      toast.error("Please enter a valid SubTender name.");
    }
  };

  // Function to close the modal without adding SubTender
  const closeModal = () => {
    setIsModalOpen(false); // Close modal
    setNewSubTenderName(""); // Clear input field
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
  // Show Modal when adding a column
  const [newColumnName, setNewColumnName] = useState("");
  const handleAddColumn = () => {
    setShowModal(true); // Open modal
  };

  // Handle column name input change
  const handleColumnNameChange = (e) => {
    setNewColumnName(e.target.value);
  };

  // Add column logic
  const handleAddColumnConfirm = () => {
    if (newColumnName && newColumnType) {
      // Add the new column to the headers array
      setHeaders((prev) => [
        ...prev,
        { header: newColumnName, type: newColumnType },
      ]);
  
      // Add a new blank cell for every row in all subtenders
      setSubTenders((prev) =>
        prev.map((subTender) => ({
          ...subTender,
          rows: subTender.rows.map((row) => [...row, ""]), // Append a blank cell
        }))
      );
  
      // Reset modal states
      setNewColumnType("view");
      setNewColumnName("");
      setShowModal(false); // Close modal after adding column
  
      toast.success(`Column "${newColumnName}" added successfully.`);
    } else {
      toast.error("Please enter a valid column name and type.");
    }
  };

  // Close the modal without adding column
  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    setNewColumnName(""); // Clear input
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
  // const handleDeleteRow = (subTenderId, rowIndex) => {
  //   if (window.confirm("Are you sure you want to delete this row?")) {
  //     setSubTenders((prev) =>
  //       prev.map((subTender) => {
  //         if (subTender.id === subTenderId) {
  //           const updatedRows = subTender.rows.filter(
  //             (_, index) => index !== rowIndex
  //           );

  //           // Reassign S.No after deletion
  //           const reassignedRows = updatedRows.map((row, i) => {
  //             row[0] = `${subTender.id}.${i + 1}`;
  //             return row;
  //           });

  //           return { ...subTender, rows: reassignedRows };
  //         }
  //         return subTender;
  //       })
  //     );
  //   }
  // };
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal visibility state
  const [rowToDelete, setRowToDelete] = useState(null); // Store the row information to be deleted

  // Handle row deletion logic
  const handleDeleteRow = (subTenderId, rowIndex) => {
    setRowToDelete({ subTenderId, rowIndex });
    setShowDeleteModal(true); // Show the modal when trying to delete a row
  };

  // Confirm deletion and update the state
  const handleConfirmDeleterow = () => {
    const { subTenderId, rowIndex } = rowToDelete;

    setSubTenders((prev) =>
      prev.map((subTender) => {
        if (subTender.id === subTenderId) {
          const updatedRows = subTender.rows.filter(
            (_, index) => index !== rowIndex
          );

          // Reassign row numbers after deletion
          const reassignedRows = updatedRows.map((row, i) => {
            row[0] = `${subTender.id}.${i + 1}`;
            return row;
          });

          return { ...subTender, rows: reassignedRows };
        }
        return subTender;
      })
    );

    // Show toast for successful deletion
    toast.success("Row deleted successfully.");

    // Close the modal and reset the deletion info
    setShowDeleteModal(false);
    setRowToDelete(null);
  };

  // Cancel the deletion (close modal)
  const handleRowCellDelete = () => {
    setShowDeleteModal(false);
    setRowToDelete(null); // Reset row to delete
  };

  // Delete an entire SubTender table

  const [deleteTableModal, setDeleteTableModal] = useState(false); // To control modal visibility
  const [subTenderToDelete, setSubTenderToDelete] = useState(null); // To store the SubTender that is being deleted

  const handleDeleteSubTender = (subTenderId) => {
    setSubTenderToDelete(subTenderId); // Store the SubTender ID to be deleted
    setDeleteTableModal(true); // Show the modal for confirmation
  };

  const handleConfirmDelete = () => {
    // Filter out the deleted SubTender
    const updatedSubTenders = subTenders.filter(
      (st) => st.id !== subTenderToDelete
    );

    // Reindex the remaining SubTenders' ids and reassign row numbers for each SubTender
    const reindexedSubTenders = updatedSubTenders.map((st, newIndex) => {
      const newId = newIndex + 1;
      const updatedRows = st.rows.map((row, i) => {
        row[0] = `${newId}.${i + 1}`; // Reassign row numbering
        return row;
      });
      return { ...st, id: newId, rows: updatedRows };
    });

    setSubTenders(reindexedSubTenders); // Update the state with the new list of SubTenders
    setDeleteTableModal(false); // Close the modal

    toast.success("SubTender has been deleted successfully."); // Show success message with toast
  };

  const handleCancelDelete = () => {
    setDeleteTableModal(false); // Close the modal without deleting
  };

  // Delete a specific column
  // const handleDeleteColumn = () => {
  //   const columnToDelete = prompt(
  //     `Enter the column name to delete:\n${headers.join(", ")}`
  //   );

  //   if (!columnToDelete || !headers.includes(columnToDelete)) {
  //     toast.error("Invalid column name or column does not exist.");
  //     return;
  //   }

  //   const colIndex = headers.indexOf(columnToDelete);

  //   // Remove the column from headers
  //   const updatedHeaders = headers.filter((_, index) => index !== colIndex);
  //   setHeaders(updatedHeaders);

  //   // Remove the corresponding cell from each row in all subtenders
  //   setSubTenders((prev) =>
  //     prev.map((subTender) => ({
  //       ...subTender,
  //       rows: subTender.rows.map((row) =>
  //         row.filter((_, index) => index !== colIndex)
  //       ),
  //     }))
  //   );

  //   toast.success(`Column "${columnToDelete}" has been deleted.`);
  // };

  const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleDeleteColumn = () => {
    setShowDeleteColumnModal(true);
  };

  const handleDeleteSelectedColumns = () => {
    if (selectedColumns.length === 0) {
      toast.error("No columns selected for deletion.");
      return;
    }

    const updatedHeaders = headers.filter(
      (_, index) => !selectedColumns.includes(index)
    );

    setHeaders(updatedHeaders);

    setSubTenders((prev) =>
      prev.map((subTender) => ({
        ...subTender,
        rows: subTender.rows.map((row) =>
          row.filter((_, index) => !selectedColumns.includes(index))
        ),
      }))
    );

    setSelectedColumns([]);
    setShowDeleteColumnModal(false);
    toast.success("Selected columns have been deleted.");
  };

  const handleCheckboxChange = (colIndex) => {
    setSelectedColumns((prev) =>
      prev.includes(colIndex)
        ? prev.filter((index) => index !== colIndex)
        : [...prev, colIndex]
    );
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
      subTenderHeaderRow[0] = subTender.id;
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
      {/* File Upload */}
      <div className="mb-4 flex justify-between items-center">
        {/* Auction Items Heading */}
        <h2 className="text-2xl font-bold mb-4">Auction Items</h2>
      </div>

      {/* Main Action Buttons */}
      <div className="flex space-x-4 mb-4 justify-between items-center">
        {subTenders.length > 0 && (
          <button
            type="button"
            onClick={openAddSubTenderModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Add SubTender
          </button>
        )}

        {/* Render SubTenders */}

        {/* Modal for Adding SubTender */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
            style={{ zIndex: 5 }}
          >
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h2 className="text-lg font-semibold mb-4">
                Enter SubTender Name
              </h2>
              <input
                type="text"
                value={newSubTenderName}
                onChange={handleSubTenderNameChange}
                className="w-full mb-4 p-2 border border-gray-300 rounded"
                placeholder="Enter SubTender name"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddSubTender}
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Yes, Add SubTender
                </button>
              </div>
            </div>
          </div>
        )}
        {subTenders.length > 0 && (
          <div className=" flex gap-2">
            <button
              type="button"
              onClick={handleAddColumn}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Add Column
            </button>
            {/* Render SubTenders and their respective tables */}

            {/* Modal for Adding Column */}
            {showModal && subTenders.length > 0 && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded shadow-md w-96">
                  <h2 className="text-lg font-semibold mb-4">
                    Enter Column Name
                  </h2>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={handleColumnNameChange}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                    placeholder="Enter new column name"
                  />
                  <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                    <p>
                      <strong>Note:</strong> Choosing{" "}
                      <span className="font-bold">Edit</span> will allow buyers
                      to fill in this column with editable data. Use this option
                      if buyer input is required.
                    </p>
                  </div>
                  <h2 className="text-lg font-semibold mb-4">
                    Select Column Type
                  </h2>
                  <select
                    value={newColumnType}
                    onChange={handleColumnTypeChange}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                  >
                    <option value="view">View</option>
                    <option value="edit">Edit</option>
                  </select>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleCloseModal}
                      className="bg-gray-500 text-white py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddColumnConfirm}
                      className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                      Yes, Add Column
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              // onClick={handleDeleteColumn}
              onClick={(event) => {
                event.preventDefault(); // Prevent the default action (if any)
                handleDeleteColumn(); // Call the function to delete selected columns
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Delete Columns
            </button>

            {/* Delete Column Modal */}
            {showDeleteColumnModal && subTenders.length > 0 && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">
                    Select Columns to Delete
                  </h2>
                  <div className="mb-4">
                    {headers.map(({ header, type,}, index ) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`col_${index}`}
                          className="mr-2"
                          onChange={() => handleCheckboxChange(index)}
                        />
                        <label
                          htmlFor={`col_${index}`}
                          className="text-gray-700"
                        >
                          {header}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={(event) => {
                        event.preventDefault(); // Prevent the default action (if any)
                        setShowDeleteColumnModal(false); // Close the modal
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(event) => {
                        event.preventDefault(); // Prevent the default action (if any)
                        handleDeleteSelectedColumns(); // Call the function to delete selected columns
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Render SubTenders and their respective tables */}
      {subTenders.map((subTender, subTenderIndex) => (
        <div
          key={subTender.id}
          className="mb-6 border rounded-lg shadow-lg bg-white p-4"
        >
          {/* SubTender Header */}
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            {/* SubTender Name Section */}
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                {subTenderIndex + 1}
              </span>
              {subTender.name}
            </h3>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => handleDeleteSubTender(subTender.id)}
              className="bg-red-100 text-red-500 hover:bg-red-500 hover:text-white font-bold py-1 px-3 rounded flex justify-center items-center space-x-1 transition-all duration-200"
            >
              <FaTrash className="w-4 h-4" />
            </button>

            {/* Delete Confirmation Modal */}
            {deleteTableModal && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded shadow-md w-96">
                  <h2 className="text-lg font-semibold mb-4">
                    Are you sure you want to delete this table?
                  </h2>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleConfirmDelete}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Row Button */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  {headers.map(({ header, type }, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 px-4 py-2 font-bold"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-2 font-bold text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subTender.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="odd:bg-gray-100 even:bg-gray-50 hover:bg-gray-200 transition-all duration-200"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 px-4 py-2 break-words max-w-[200px] l:max-w-[450px]"
                        contentEditable
                        suppressContentEditableWarning
                        style={{
                          wordWrap: "break-word", // Ensure text wrapping
                          whiteSpace: "pre-wrap", // Preserve spaces and wrap text
                        }}
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
                        className="bg-red-100 text-red-500 hover:bg-red-500 hover:text-white font-bold py-1 px-3 rounded flex justify-center m-auto items-center space-x-1 transition-all duration-200"
                      >
                        <FaTrash className="w-4 h-4 " />
                      </button>
                      {showDeleteModal && (
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                          <div className="bg-white p-6 rounded shadow-md w-96">
                            <h2 className="text-lg font-semibold mb-4">
                              Are you sure you want to delete this row?
                            </h2>
                            <div className="flex justify-center space-x-4">
                              <button
                                onClick={handleConfirmDeleterow}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={handleRowCellDelete}
                                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={() => handleAddRowToSubTender(subTender.id)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded flex items-center transition-all duration-200"
            >
              <span className="mr-1">➕</span> Add Row
            </button>
          </div>
        </div>
      ))}

      {/* Download Button */}
      {subTenders.length > 0 ? (
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleDownload}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
          >
            Download Table
          </button>
        </div>
      ) : (
        <div className="container mx-auto p-6 gap-6">
          {/* Combined Section for Upload and Create Excel */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            {/* Left Section - Upload Excel */}
            <div className="w-full md:w-[48%] p-8 rounded-lg bg-white shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105">
              <p className="text-lg text-blue-700 font-semibold mb-2">
                Upload your Excel sheet
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Easily upload your Excel file to start working on your data.
              </p>
              <div className="mt-4">
                <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-fit py-2 px-6 rounded-full cursor-pointer flex items-center shadow-lg">
                  <i className="mr-2 fas fa-upload transition-all duration-200 ease-in-out transform hover:scale-110"></i>{" "}
                  Upload Sheet
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Right Section - Customize Excel */}
            <div className="w-full md:w-[48%] p-8 rounded-lg bg-white shadow-xl transform transition-all duration-300 ease-in-out hover:scale-105">
              <p className="text-lg text-green-700 font-semibold mb-2">
                Create your Excel sheet
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Customize your sheet by adding the data you need.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  // disabled ={selectedCategory!== "" && selectedCategory !== null ? false : true}
                  onClick={openAddSubTenderModal}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full shadow-lg"
                >
                  <i className="mr-2 fas fa-edit transition-all duration-200 ease-in-out transform hover:scale-110"></i>{" "}
                  Create Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ToastContainer for notifications */}
    </div>
  );
}
