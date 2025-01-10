// components/AddTender/ImageUpload.js
import React from 'react';
import { useDropzone } from "react-dropzone";

const ImageUpload = ({ image, error, getRootProps, getInputProps }) => {
  return (
    <div className="  mt-10">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Tenders Image</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Banner Image{" "}
            <span className="text-gray-400 text-sm">
              (Recommended Image in Dimension 458*458)
            </span>
          </label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-400 p-10 text-center cursor-pointer rounded-lg"
          >
            <input {...getInputProps()} />
            {!image ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 16l6-6m0 0l6 6m-6-6v12"
                  />
                </svg>
                <p className="text-gray-500 mt-2">
                  Drag & Drop product images here or click to browse
                </p>
              </>
            ) : (
              <div className="flex justify-center">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Uploaded"
                  className="max-h-32"
                />
              </div>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
