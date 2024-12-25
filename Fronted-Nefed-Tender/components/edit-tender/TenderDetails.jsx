import React from "react";
import dynamic from "next/dynamic";

// Using dynamic import to load ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const TendersDetails = ({ tenderData, setTenderData }) => {
  // Generate slug automatically if desired:
  const handleNameChange = (e) => {
    const newName = e.target.value;
    // Generate slug
    const generatedSlug = newName
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    setTenderData((prev) => ({
      ...prev,
      name: newName,
      slug: generatedSlug,
    }));
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Tenders Details</h2>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={tenderData.name}
          onChange={handleNameChange}
          placeholder="Enter Name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Slug (read-only) */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={`http://127.0.0.1:8000/item/${tenderData.slug}`}
          readOnly
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-200 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={tenderData.description}
          onChange={(value) =>
            setTenderData((prev) => ({ ...prev, description: value }))
          }
          placeholder="Enter description"
          className="bg-white"
          required
        />
      </div>
    </>
  );
};

export default TendersDetails;
