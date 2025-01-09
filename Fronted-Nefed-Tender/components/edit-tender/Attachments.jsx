import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const Attachments = ({ attachments, setAttachments }) => {
  const handleInputChange = (index, key, value) => {
    const updatedAttachments = [...attachments];
    updatedAttachments[index][key] = value;
    setAttachments(updatedAttachments);
  };
  const addAttachment = () => {
    setAttachments([
      ...attachments,
      { key: "", extension: "", size: "", label: "", file: null },
    ]);
  };
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  console.log("dhshdb",attachments)

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Edit Attachments</h2>
      {attachments.map((attachment, index) => (
        <div key={index} className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Attachment {index + 1}
              <span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={index === 0 ? addAttachment : () => removeAttachment(index)}
              className={`${
                index === 0 ? "bg-green-500" : "bg-red-500"
              } text-white p-2 rounded-full`}
            >
              {index === 0 ? <FaPlus /> : <FaTrash />}
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Key
            </label>
            <input
              type="text"
              placeholder="Enter Key"
              value={attachment.doc_key}
              onChange={(e) => handleInputChange(index, "key", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                File Extension
              </label>
              <select
                value={attachment.doc_ext}
                onChange={(e) =>
                  handleInputChange(index, "extension", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="" disabled>
                  Select Extension
                </option>
                <option value="image/png">PNG</option>
                <option value="image/jpg">JPG</option>
                <option value="application/pdf">PDF</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Max File Size (MB)
              </label>
              <input
                type="number"
                placeholder="Max File Size"
                value={attachment.doc_size}
                onChange={(e) =>
                  handleInputChange(index, "size", e.target.value)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Label
            </label>
            <input
              type="text"
              placeholder="Enter Label"
              value={attachment.doc_label}
              onChange={(e) => handleInputChange(index, "label", e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Attachments;
