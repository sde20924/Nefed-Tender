// components/AddTender/TendersDetails.js
import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const TendersDetails = ({
  name,
  setName,
  slug,
  description,
  handleDescriptionChange,
}) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Tenders Details</h2>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="slug"
        >
          Slug<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="slug"
          value={`http://127.0.0.1:8000/item/${slug}`}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
              

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description<span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter description"
          className="bg-white"
          required
        />
      </div>
    </div>
  );
};

export default TendersDetails;
