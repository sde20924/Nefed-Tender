// components/AddTender/Attachments.js
import React from 'react';
import { FaPlus, FaTrash } from "react-icons/fa";

const Attachments = ({ attachments, handleAddAttachment, handleRemoveAttachment, handleInputChange }) => {
  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Attachments</h2>

      {attachments.map((attachment, index) => (
        <div key={index} className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Add Images<span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={
                index === 0
                  ? handleAddAttachment
                  : () => handleRemoveAttachment(index)
              }
              className={`${
                index === 0 ? "bg-green-500" : "bg-red-500"
              } text-white p-2 rounded-full`}
            >
              {index === 0 ? <FaPlus /> : <FaTrash />}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Enter Key
            </label>
            <input
              type="text"
              placeholder="Enter Key (Spaces not allowed)"
              value={attachment.key}
              onChange={(e) =>
                handleInputChange(index, "key", e.target.value)
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Enter Extension
              </label>
              <select
                value={attachment.extension}
                onChange={(e) =>
                  handleInputChange(
                    index,
                    "extension",
                    e.target.value
                  )
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="" disabled>
                  Select Extension
                </option>
                <option value="jpg">
                  image/png,image/jpg,image/jpeg
                </option>
                <option value="png">application/pdf</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Enter Max Upload File Size (in MB)
              </label>
              <input
                type="number"
                placeholder="Enter File size"
                value={attachment.maxFileSize}
                onChange={(e) =>
                  handleInputChange(
                    index,
                    "maxFileSize",
                    e.target.value
                  )
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onFocus={(e) =>
                  e.target.addEventListener("wheel", (event) =>
                    event.preventDefault()
                  )
                }
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Enter Label
            </label>
            <input
              type="text"
              placeholder="Enter Image Label"
              value={attachment.label}
              onChange={(e) =>
                handleInputChange(index, "label", e.target.value)
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Attachments;
