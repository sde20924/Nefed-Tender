import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { callApiGet, callApiPost, uploadDocApi } from "@/utils/FetchApi"; // Import API call functions
import { ToastContainer, toast } from "react-toastify";

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
  // console.log("formData", formdata);

  useEffect(() => {
    if (id) {
      const fetchTenderDetails = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("data")); // Assuming the user object is stored as JSON
          const userIdBuyer = user.data.user_id;

          // Fetch tender details by ID
          const tenderData = await callApiGet(`common/tender/${id}`);
          setEditableSheet(tenderData.data);
          setTender(tenderData.data);
          calculateTimeLeft(tenderData.data.app_end_time);

          // Fetch applications from server to check if any application is submitted
          const applicationsData = await callApiGet("tender/tender-applications");

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
            const uploadedFilesDataTender = await callApiGet(
              `common/tender/${id}/files-status`
            );

            console.log("-----837458---", uploadedFilesDataTender);

            // Filter files by tender_id and user_id
            const uploadedFilesData = uploadedFilesDataTender.data.filter(
              (data) => {
                return data.tender_id === id && data.user_id === userIdBuyer;
              }
            );

            console.log("Filtered Uploaded Files Data :", uploadedFilesData);

            // Set the uploaded files only if they exist
            if (uploadedFilesData && uploadedFilesData.length > 0) {
              setUploadedFiles(uploadedFilesData); // Update the state with the filtered files
            } else {
              console.log("No matching uploaded files found");
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
  // const handleFileChange = async (event, docKey, tender_doc_id) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const formData = new FormData();
  //     formData.append("file", file); // Append the file to the form data

  //     try {
  //       const response = await uploadDocApi("upload-doc", formData); // Correct endpoint for file upload
  //       if (response && response.uploaded_data) {
  //         const fileUrl = response.uploaded_data.doc_url; // Get the doc_url from the response
  //         const tenderDocId = tender_doc_id; // Get the tender_doc_id

  //         const newUploadedFiles = [
  //           ...uploadedFiles,
  //           { tender_doc_id: tenderDocId, doc_url: fileUrl },
  //         ];
  //         setUploadedFiles(newUploadedFiles); // Update state with new uploaded files

  //         toast.success("File uploaded successfully");
  //       } else {
  //         toast.error("Failed to upload file");
  //       }
  //     } catch (error) {
  //       console.error("Error uploading file:", error.message);
  //       toast.error("Error uploading file");
  //     }
  //   }
  // };
  const handleFileChange = async (event, docKey, tender_doc_id) => {
    const files = Array.from(event.target.files);

    const newFiles = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await uploadDocApi("upload-doc", formData);
          if (response && response.uploaded_data) {
            const fileUrl = response.uploaded_data.doc_url;

            return {
              tender_doc_id,
              doc_key: docKey,
              name: file.name,
              file,
              previewUrl: URL.createObjectURL(file),
              doc_url: fileUrl,
            };
          }
        } catch (error) {
          console.error("Error uploading file:", error.message);
          toast.error("Error uploading file");
          return null;
        }
      })
    );

    // Filter out null (failed uploads) and update state
    setUploadedFiles((prevFiles) => [
      ...prevFiles,
      ...newFiles.filter((file) => file !== null),
    ]);

    toast.success("Files uploaded successfully");
  };

  const handleFileDelete = async (tender_doc_id, fileIndex) => {
    const updatedFiles = uploadedFiles.filter(
      (file, index) =>
        !(file.tender_doc_id === tender_doc_id && index === fileIndex)
    );

    setUploadedFiles(updatedFiles);

    // Optionally, send a delete request to the server
    try {
      await deleteDocApi("delete-doc", { tender_doc_id });
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error.message);
      toast.error("Error deleting file");
    }
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
      const apiResponse = await callApiPost("tender/submit-file-url", {
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
      const apiResponse = await callApiPost("tender/submit-file-url", {
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
              {/* <h5 className="text-lg font-bold mb-2">Submit Application</h5> */}

              {/* Attached Files Section */}
              <div className="mb-6">
                <h6 className="text-lg font-semibold text-gray-800 mb-3">
                  Attached Files
                </h6>
                <p className="text-sm text-gray-600 mb-4">
                  Please upload the following documents and details. All
                  documents to be uploaded.
                </p>

                {/* Map through tender documents */}
                {tender.tenderDocuments && tender.tenderDocuments.length > 0 ? (
                  tender.tenderDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        {/* Icon */}
                        <i className="fas fa-file-alt text-blue-500 text-xl mr-4"></i>

                        {/* Content */}
                        <div className="flex items-center justify-between flex-grow">
                          <span className="font-medium text-gray-800 text-sm mr-4">
                            {doc.doc_label}
                          </span>
                          <p className="text-sm text-gray-500 whitespace-nowrap">
                            {doc.doc_ext} - {doc.doc_size} MB Allowed
                          </p>
                        </div>
                      </div>

                      {/* Display uploaded images */}
                      <div className="flex flex-wrap gap-4">
                        {[
                          ...new Map(
                            uploadedFiles
                              .filter(
                                (file) =>
                                  file.tender_doc_id === doc.tender_doc_id
                              )
                              .map((file) => [file.doc_url, file]) // Remove duplicates by `doc_url`
                          ).values(),
                        ].map((file, fileIndex) => (
                          <div
                            key={fileIndex}
                            className="relative group w-24 h-24"
                          >
                            {/* Image */}
                            <img
                              src={file.doc_url}
                              alt="Preview"
                              className="w-full h-full border border-gray-300 rounded-md object-cover transition-opacity hover:opacity-90"
                              onClick={() =>
                                window.open(
                                  file.doc_url || file.previewUrl,
                                  "_blank"
                                )
                              }
                            />

                            {/* Delete Icon */}
                            <i
                              className="fas fa-times-circle text-red-500 text-lg absolute top-1 right-1 cursor-pointer hidden group-hover:block"
                              onClick={() =>
                                handleFileDelete(doc.tender_doc_id, fileIndex)
                              }
                            ></i>
                          </div>
                        ))}
                      </div>

                      {/* Upload Button */}
                      <div className="flex items-center mt-4">
                        <label
                          htmlFor={`file-input-${doc.tender_doc_id}`}
                          className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
                        >
                          Upload Files
                        </label>
                        <input
                          id={`file-input-${doc.tender_doc_id}`}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(e, doc.doc_key, doc.tender_doc_id)
                          }
                          disabled={isCountdownComplete}
                        />
                        {isCountdownComplete && (
                          <p className="ml-4 text-sm text-gray-400">
                            File upload is disabled
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No documents required for this tender.
                  </p>
                )}
              </div>

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
          {iseditableSheet?.sub_tenders?.map((subTender) => (
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
