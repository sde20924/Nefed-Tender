import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { callApiGet, callApiPost, uploadDocApi } from "@/utils/FetchApi"; // Import API call functions
import { ToastContainer, toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

const TenderDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Extract the tender ID from the route
  const [tender, setTender] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to keep track of uploaded files
  const [isApplicationSubmitted, setIsApplicationSubmitted] = useState(false); // State to track if the application is submitted
  const [isApplicationSaved, setIsApplicationSaved] = useState(false); // Track if the application is saved
  const [iseditableSheet, setEditableSheet] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  // console.log("formData", formdata);

  useEffect(() => {
    if (id) {
      const fetchTenderDetails = async () => {
        try {
          // Fetch tender details by ID
          const tenderData = await callApiGet(`tender/${id}`);
          setEditableSheet(tenderData.data);
          setTender(tenderData.data);
          calculateTimeLeft(tenderData.data.app_end_time);

          // Fetch applications from server to check if any application is submitted
          const applicationsData = await callApiGet("tender-applications");

          // Filter applications to find any with the status "submitted"
          const acceptedApplications = applicationsData.data.filter(
            (app) =>
              (app.status === "submitted" || app.status === "accepted") &&
              app.tender_id === id
          );

          if (acceptedApplications.length > 0) {
            setIsApplicationSubmitted(true); // If any submitted application exists, set the flag to true
          } else {
            // Fetch previously uploaded files for "draft" status
            const uploadedFilesData = await callApiGet(
              `tender/${id}/files-status`
            );
            console.log("-=-=-=-=-=uploadfile -=-=-=-=-=-=", uploadedFilesData);
            if (uploadedFilesData.success) {
              setUploadedFiles(uploadedFilesData.data); // Set the uploaded files from the server
            }
          }
        } catch (error) {
          console.error(
            "Error fetching tender details or applications:",
            error.message
          );
        }
      };

      fetchTenderDetails();
    }
  }, [id]);

  // Function to calculate countdown time
  const calculateTimeLeft = (endTime) => {
    const endTimeMs = endTime * 1000;
    const interval = setInterval(() => {
      const timeLeft = endTimeMs - new Date().getTime();
      if (timeLeft > 0) {
        const hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        setIsCountdownComplete(true); // Mark countdown as complete
        toast.error("Time is up! You can no longer upload files."); // Show toast notification
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  };

  // Function to handle file selection and upload
  const handleFileChange = async (event, docKey, tender_doc_id) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      // Find the corresponding tender document
      const matchingDocument = tender.tenderDocuments.find(
        (doc) => doc.tender_doc_id === tender_doc_id
      );

      if (matchingDocument) {
        const { doc_ext, doc_size } = matchingDocument;

        // Check file extension
        const fileExtension = file.name.split(".").pop().toLowerCase();
        if (
          !doc_ext
            .split(",")
            .map((ext) => ext.trim())
            .includes(fileExtension)
        ) {
          toast.error(`Invalid file type. Please upload a ${doc_ext} file.`);
          return;
        }

        // Check file size
        const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB
        if (fileSizeInMB > parseFloat(doc_size)) {
          toast.error(
            `File size exceeds limit. Maximum allowed size is ${doc_size} MB.`
          );
          return;
        }

        // If validation passes, proceed with the upload
        const formData = new FormData();
        formData.append("file", file); // Append the file to the form data

        try {
          const response = await uploadDocApi("upload-doc", formData); // Correct endpoint for file upload

          if (response && response.uploaded_data) {
            const fileUrl = response.uploaded_data.doc_url; // Get the doc_url from the response
            const newUploadedFiles = [
              ...uploadedFiles,
              { tender_doc_id, doc_url: fileUrl },
            ];
            setUploadedFiles(newUploadedFiles); // Update state with new uploaded files

            toast.success("File uploaded successfully");
          } else {
            toast.error("Failed to upload file");
          }
        } catch (error) {
          console.error("Error uploading file:", error.message);
          toast.error("Error uploading file");
        }
      } else {
        toast.error("Invalid tender document configuration.");
      }
    }
  };

  // handel remove file
  const removeFile = (tenderDocId, fileIndex) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter(
        (file, index) =>
          !(file.tender_doc_id === tenderDocId && index === fileIndex)
      )
    );
  };

  // Handle Save Application Button Click
  const handleSaveApplication = async () => {
    if (isCountdownComplete) {
      toast.error("You cannot save the application after the deadline.");
      return;
    }

    // Check if all required files are uploaded
    if (
      uploadedFiles.length <
      (tender.tenderDocuments ? tender.tenderDocuments.length : 0)
    ) {
      toast.error("Please upload all required documents before saving.");
      return;
    }

    try {
      console.log(uploadedFiles);
      const apiResponse = await callApiPost("submit-file-url", {
        file_url: uploadedFiles,
        tender_id: id,
        status: "draft",
        tender_application_id: uploadedFiles[0]?.tender_application_id || null,
        tender_user_doc_id: uploadedFiles[0]?.tender_user_doc_id || null,
      }); // Send all uploaded file URLs to your backend
      if (apiResponse.success) {
        toast.success("Your application has been saved successfully.");
        setIsApplicationSaved(true); // Set the application as saved
      } else {
        toast.error("Failed to save the application.");
      }
    } catch (error) {
      console.error("Error saving application:", error.message);
      toast.error("Error saving application.");
    }
  };

  // Handle Submit Application Button Click
  const handleSubmitApplication = async () => {
    if (isCountdownComplete) {
      toast.error("You cannot submit the application after the deadline.");
      return;
    }

    try {
      console.log(uploadedFiles);
      const apiResponse = await callApiPost("submit-file-url", {
        file_url: uploadedFiles,
        tender_id: id,
        status: "submitted",
        tender_application_id: uploadedFiles[0]?.tender_application_id || null,
        tender_user_doc_id: uploadedFiles[0]?.tender_user_doc_id || null,
      }); // Send all uploaded file URLs to your backend with status submitted

      if (apiResponse.success) {
        toast.success("Your application has been submitted successfully.");
        setIsApplicationSubmitted(true); // Mark the application as submitted
      } else {
        toast.error("Failed to submit the application.");
      }
    } catch (error) {
      console.log(error);
      console.error("Error submitting application:", error.message);
      toast.error("Error submitting application.");
    }
  };

  // state to store the table data

  if (!tender) {
    return <p>Loading...</p>; // Show loading state while fetching data
  }

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"View tender details and apply"}
        title={"Tender Details"}
      />

      <div className="bg-white m-4">
        <h1 className="p-4 text-lg">
          <b>{tender.tender_title}</b>
        </h1>
      </div>

      <div className="flex md:flex-row flex-col container mx-auto p-4 ">
        <div className="l:w-2/4 w-full bg-white shadow-md rounded p-6 max-w-xl mx-auto divide-y ">
          {/* Application Schedule Section */}
          <h5 className="text-lg font-bold mb-2 text-center">
            Application Schedule
          </h5>
          <div className="mb-2">
            <div className="flex justify-between mb-2 divide-y">
              <span>Start Date/Time:</span>
              <span>
                {new Date(tender.app_start_time * 1000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>End Date/Time:</span>
              <span>
                {new Date(tender.app_end_time * 1000).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Auction Schedule Section */}
          <h5 className="text-lg font-bold mb-2 text-center">
            Auction Schedule
          </h5>
          <div className="mb-2 divide-y">
            <div className="flex justify-between mb-2">
              <span>Start Date/Time:</span>
              <span>
                {new Date(tender.auct_start_time * 1000).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span>End Date/Time:</span>
              <span>
                {new Date(tender.auct_end_time * 1000).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tender Details Section */}
          <h5 className="text-lg font-bold mb-2 text-center">Tender Details</h5>
          <div className="mb-2 divide-y">
            <div className="flex justify-between mb-2">
              <span>Quantity:</span>
              <span>{tender.qty}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Currency:</span>
              <span>{tender.currency}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Destination Port:</span>
              <span>{tender.dest_port}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Bag Size:</span>
              <span>{tender.bag_size}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Bag Type:</span>
              <span>{tender.bag_type}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Timeframe For Extension:</span>
              <span>{tender.time_frame_ext}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Amount of Time Extension:</span>
              <span>{tender.amt_of_ext}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Auto Auction Extension before end time:</span>
              <span>{tender.aut_auct_ext_bfr_end_time}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Minimum Decrement Bid value:</span>
              <span>₹{tender.min_decr_bid_val.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="l    :w-2/4 w-full container mx-auto p-4">
          {/* Application Closing Countdown */}
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center">
            <span className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              Application Closing At
            </span>
            <span className="font-bold text-xl">{timeLeft}</span>
          </div>

          {/* Conditionally show file upload section or success UI */}
          {isApplicationSubmitted ? (
            <div className="text-center">
              <img
                src="/img/check-mark.webp"
                alt="Success"
                className="mx-auto mb-4 h-56 w-56"
              />
              <h3 className="text-lg font-bold">Application Submitted!</h3>
              <p>Your Application has been submitted!</p>
              <p className="text-sm text-gray-600 mt-2">
                For further information, visit <strong>My Tenders</strong>.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h5 className="text-lg font-bold mb-2">Submit Application</h5>

              {/* Attached Files Section */}
              <div className="mb-4">
                <h6 className="text-lg font-semibold mb-3 text-gray-800">
                  Attached Files
                </h6>
                <p className="text-sm text-gray-600 mb-4">
                  Please upload the following documents. All documents are
                  mandatory.
                </p>

                {tender.tenderDocuments && tender.tenderDocuments.length > 0 ? (
                  tender.tenderDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 mb-4 bg-gradient-to-r from-blue-50 to-white shadow-md"
                    >
                      {/* Document Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-file-alt text-blue-500"></i>
                          <span className="font-medium text-gray-800">
                            {doc.doc_label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {doc.doc_ext} | Max Size: {doc.doc_size} MB
                        </p>
                      </div>

                      {/* Uploaded Files Preview */}
                      <div className="flex flex-wrap mt-4 gap-3">
                        {uploadedFiles
                          .filter(
                            (file) => file.tender_doc_id === doc.tender_doc_id
                          )
                          .map((file, fileIndex) => (
                            <div
                              key={fileIndex}
                              className="relative w-28 h-28 border rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-all"
                            >
                              {file.doc_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img
                                  src={file.doc_url}
                                  alt="Preview"
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => setPreviewImage(file.doc_url)}
                                />
                              ) : (
                                <a
                                  href={file.doc_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center text-blue-500 text-sm underline h-full"
                                >
                                  View File
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  removeFile(file.tender_doc_id, fileIndex)
                                }
                                className="absolute top-1 right-1 bg-gray-600 text-white rounded-full p-1 hover:bg-red-600"
                                title="Remove File"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>

                      {/* Upload Input */}
                      <div className="flex items-center space-x-4 mt-4">
                        <label
                          htmlFor={`file-upload-${index}`}
                          className="cursor-pointer bg-gray-500 text-white px-4 py-2 rounded-lg text-sm shadow-md transition-all"
                        >
                          Upload Files
                        </label>
                        <input
                          id={`file-upload-${index}`}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(e, doc.doc_key, doc.tender_doc_id)
                          }
                          disabled={isCountdownComplete}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mb-4">
                    No documents are required for this tender.
                  </p>
                )}
              </div>

              {/* Modal for Image Preview */}
              {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white p-4 rounded-md shadow-lg max-w-full max-h-full relative">
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-3 py-1 hover:bg-red-600 transition"
                    >
                      Close
                    </button>
                    <img
                      src={previewImage}
                      alt="Full Preview"
                      className="max-w-full max-h-screen"
                    />
                  </div>
                </div>
              )}

              {/* Save Application Button */}
              <button
                onClick={handleSaveApplication}
                className={`bg-${!uploadedFiles[0]?.doc_url ? "gray" : "blue"}-500 text-white font-bold py-2 px-4 rounded-lg mt-4 mr-4`}
                disabled={!uploadedFiles[0]?.doc_url}
              >
                Save Application
              </button>

              {/* Show Submit Application Button only if the application is saved */}
              {/* {isApplicationSaved && ( */}
              <button
                onClick={handleSubmitApplication}
                className={`bg-${!uploadedFiles[0]?.doc_url ? "gray" : "green"}-500 text-white font-bold py-2 px-4 rounded-lg mt-4`}
                disabled={!uploadedFiles[0]?.doc_url}
              >
                Submit Application
              </button>
              {/* )} */}
            </div>
          )}
        </div>
        {/* Table Data Shown From Here in buyer Side  */}

        {/*  */}
      </div>
      <div className="space-y-8">
        <div className="space-y-8">
          {iseditableSheet.sub_tenders.map((subTender) => (
            <div
              key={subTender.id}
              className="border border-gray-300 p-4 rounded"
            >
              <h2 className="text-lg font-bold mb-4">{subTender.name}</h2>
              <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm text-left">
                  <thead className="bg-blue-100 text-gray-700">
                    <tr>
                      {iseditableSheet.headers.map((header, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-4 py-2 font-bold"
                        >
                          {header.table_head}
                        </th>
                      ))}
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
                          >
                            {cell.data}
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
      </div>

      {/* Toast Container */}
    </>
  );
};

TenderDetail.layout = UserDashboard;
export default TenderDetail;
