import React, { useState } from "react";
import * as XLSX from "xlsx";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify"; // Importing toast for notifications

export default function EditTable({
  headers,
  setHeaders,
  subTenders,
  setSubTenders,
}) {
  

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [newSubTenderName, setNewSubTenderName] = useState(""); // State for the new SubTender name

  // Function to open the modal
  const openAddSubTenderModal = () => {
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
    if (newColumnName.trim()) {
      // Create a new header object
      const newHeader = {
        header_id:
          headers.length > 0 ? headers[headers.length - 1].header_id + 1 : 1,
        table_head: newColumnName,
        order: headers.length + 1,
      };

      setHeaders((prev) => [...prev, newHeader]);
      setSubTenders((prev) =>
        prev.map((subTender) => ({
          ...subTender,
          rows: subTender.rows.map((row) => [...row, ""]),
        }))
      );
      setNewColumnName("");
      setShowModal(false); // Close modal after adding column
      toast.success(`Column "${newColumnName}" added successfully.`);
    } else {
      toast.error("Please enter a valid column name.");
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
          updatedRows[rowIndex][cellIndex] = {
            ...updatedRows[rowIndex][cellIndex],
            data: value, // Update only the `data` field
          };
          return { ...subTender, rows: updatedRows };
        }
        return subTender;
      })
    );
  };
  

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
      prev.map((subTender, subTenderIndex) => {
        if (subTender.id === subTenderId) {
          // Remove the selected row
          const updatedRows = subTender.rows.filter(
            (_, index) => index !== rowIndex
          );

          // Reassign serial numbers for the remaining rows
          const reassignedRows = updatedRows.map((row, i) => {
            if (row[0] && typeof row[0] === "object") {
              return [
                {
                  ...row[0],
                  data: `${subTenderIndex + 1}.${i + 1}`, // Update serial number
                },
                ...row.slice(1), // Keep other cells unchanged
              ];
            }
            return row;
          });

          return { ...subTender, rows: reassignedRows };
        }
        return subTender;
      })
    );

    toast.success("Row deleted successfully.");
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
    const updatedSubTenders = subTenders.filter(
      (st) => st.id !== subTenderToDelete
    );
  
    const reindexedSubTenders = updatedSubTenders.map((subTender, newIndex) => {
      const updatedRows = subTender.rows.map((row, i) => {
        if (row[0] && typeof row[0] === "object") {
          return [
            {
              ...row[0],
              data: `${newIndex + 1}.${i + 1}`, // Reassign serial number
            },
            ...row.slice(1), // Keep other cells unchanged
          ];
        }
        return row;
      });
  
      return { ...subTender, id: newIndex + 1, rows: updatedRows }; // Optionally reassign id
    });
  
    setSubTenders(reindexedSubTenders);
    toast.success("SubTender deleted successfully.");
    setDeleteTableModal(false);
  };
  

  const handleCancelDelete = () => {
    setDeleteTableModal(false); // Close the modal without deleting
  };

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

  const handleDownload = () => {
    const worksheetData = [];
  
    // Add headers to the worksheet data
    worksheetData.push(headers.map((header) => header.table_head)); // Use table_head for headers
  
    // Add SubTender data
    subTenders.forEach((subTender) => {
      // Add SubTender name and ID as a separate row
      worksheetData.push([`SubTender: ${subTender.name}`, `ID: ${subTender.id}`]);
      
      // Add rows for the SubTender
      subTender.rows.forEach((row) => {
        worksheetData.push(row.map((cell) => (cell.data !== undefined ? cell.data : cell))); // Extract `data` if it's an object
      });
  
      // Add an empty row to separate SubTenders visually
      worksheetData.push([]);
    });
  
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
    // Create workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Editable Table");
  
    // Write the file
    XLSX.writeFile(workbook, "editable_subtender_table.xlsx");
  };
  

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
                    {headers.map((header, index) => (
                      <div
                        key={header.header_id || index}
                        className="flex items-center mb-2"
                      >
                        <input
                          type="checkbox"
                          id={`col_${header.header_id || index}`}
                          className="mr-2"
                          onChange={() => handleCheckboxChange(index)}
                        />
                        <label
                          htmlFor={`col_${header.header_id || index}`}
                          className="text-gray-700"
                        >
                          {header.table_head}
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
            {deleteTableModal && subTenderToDelete === subTender.id && (
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
                  {headers.map((header, index) => (
                    <th
                      key={header.header_id || index}
                      className="border border-gray-300 px-4 py-2 font-bold"
                    >
                      {header.table_head}
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
                        {cell.data}
                      </td>
                    ))}
                    <td className="text-center align-middle border border-gray-300 px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(subTender.id, rowIndex)}
                        className="bg-red-100 text-red-500 hover:bg-red-500 hover:text-white font-bold py-1 px-3 rounded flex justify-center items-center space-x-1 transition-all duration-200"
                      >
                        <FaTrash className="w-4 h-4 " />
                      </button>
                      {showDeleteModal &&
                        rowToDelete &&
                        rowToDelete.subTenderId === subTender.id &&
                        rowToDelete.rowIndex === rowIndex && (
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
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleDownload}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
        >
          Download Table
        </button>
      </div>

      {/* Modal for Adding Column */}
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center"
          style={{ zIndex: 5 }}
        >
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Enter Column Name</h2>
            <input
              type="text"
              value={newColumnName}
              onChange={handleColumnNameChange}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              placeholder="Enter new column name"
            />
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

      {/* Modal for Adding SubTender */}
      {/* Already handled above */}

      {/* Modal for Deleting Columns */}
      {showDeleteColumnModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Select Columns to Delete</h2>
            <div className="mb-4">
              {headers.map((header, index) => (
                <div
                  key={header.header_id || index}
                  className="flex items-center mb-2"
                >
                  <input
                    type="checkbox"
                    id={`col_${header.header_id || index}`}
                    className="mr-2"
                    onChange={() => handleCheckboxChange(index)}
                  />
                  <label
                    htmlFor={`col_${header.header_id || index}`}
                    className="text-gray-700"
                  >
                    {header.table_head}
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
  );
}
