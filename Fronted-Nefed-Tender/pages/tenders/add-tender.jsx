import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaPlus, FaTrash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { callApiPost } from "@/utils/FetchApi";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const initialFields = [
  { id: "textarea-1", type: "textarea", content: "Text Area" },
  { id: "textfield-1", type: "textfield", content: "Text Field" },
  { id: "number-1", type: "number", content: "Number" },
  { id: "datefield-1", type: "datefield", content: "Date Field" },
  { id: "checkboxgroup-1", type: "checkboxgroup", content: "Checkbox Group" },
  { id: "radiogroup-1", type: "radiogroup", content: "Radio Group" },
  { id: "select-1", type: "select", content: "Select" },
];

const AddTender = () => {
  // for user-details

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const handleDescriptionChange = (value) => {
    setDescription(value);
  };

  useEffect(() => {
    const generateSlug = (name) => {
      return name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    };
    setSlug(generateSlug(name));
  }, [name]);

  // for tender-image-upload

  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width !== 458 || img.height !== 458) {
        setError("Image dimensions must be 458x458 pixels.");
        setImage(null);
      } else {
        setError("");
        setImage(file);
      }
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png",
    maxFiles: 1,
  });

  // for option-button

  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleFeaturedChange = () => {
    setIsFeatured(!isFeatured);
    // console.log("Featured:", !isFeatured); // Log or store the updated value
  };

  const handlePublishChange = () => {
    setIsPublished(!isPublished);
    // console.log("Publish:", !isPublished); // Log or store the updated value
  };

  // EMD-Detalis

  const [emdAmount, setEmdAmount] = useState("");
  const [emdLevelAmount, setEmdLevelAmount] = useState("");

  // Attachments-of-form

  const [attachments, setAttachments] = useState([
    { key: "", extension: "", maxFileSize: "", label: "" },
  ]);

  const handleAddAttachment = () => {
    setAttachments([
      ...attachments,
      { key: "", extension: "", maxFileSize: "", label: "" },
    ]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const newAttachments = [...attachments];
    newAttachments[index][field] = value;
    setAttachments(newAttachments);
  };

  // Auction for section

  const [auctionFields, setAuctionFields] = useState([
    { name: "", quantity: ""},
  ]);

  const [auctionType, setAuctionType] = useState(""); // State to track auction type

  const handleAuctionInputChange = (index, field, value) => {
    const updatedFields = [...auctionFields];
    updatedFields[index][field] = value;
    setAuctionFields(updatedFields);
  };

  const handleAddAuction = () => {
    setAuctionFields([...auctionFields, { name: "", quantity: "" }]);
  };

  const handleRemoveAuction = (index) => {
    const updatedFields = auctionFields.filter((_, i) => i !== index);
    setAuctionFields(updatedFields);
  };

  const handleAuctionTypeChange = (e) => {
    setAuctionType(e.target.value);
  };

  // custom-form

  const [formFields, setFormFields] = useState([]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    // If the item is dropped in the same place, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Add the dragged field to the form area
    const draggedField = initialFields[source.index];
    setFormFields([...formFields, draggedField]);
  };

  const renderField = (field, index) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            key={index}
            placeholder="Enter text"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "textfield":
        return (
          <input
            key={index}
            type="text"
            placeholder="Enter text"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "number":
        return (
          <input
            key={index}
            type="number"
            placeholder="Enter number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "datefield":
        return (
          <input
            key={index}
            type="date"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "checkboxgroup":
        return (
          <div key={index} className="mb-2">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Checkbox</span>
            </label>
          </div>
        );
      case "radiogroup":
        return (
          <div key={index} className="mb-2">
            <label className="inline-flex items-center">
              <input type="radio" name="radio" className="form-radio" />
              <span className="ml-2">Radio</span>
            </label>
          </div>
        );
      case "select":
        return (
          <select
            key={index}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          >
            <option>Select option</option>
          </select>
        );
      default:
        return null;
    }
  };
  // full-details for form

  const [currency, setCurrency] = useState("INR(₹)");
  const [startingPrice, setStartingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [bagSize, setBagSize] = useState("");
  const [bagType, setBagType] = useState("");
  const [measurmentUnit, setMeasurmentUnit] = useState("");
  const [auctionStart, setAuctionStart] = useState(null);
  const [auctionEnd, setAuctionEnd] = useState(null);
  const [extensionMinutes, setExtensionMinutes] = useState("");
  const [extendedAt, setExtendedAt] = useState(null);
  const [timeExtension, setTimeExtension] = useState("");
  const [extensionBeforeEndtime, setExtensionBeforeEndtime] = useState("");
  const [minDecrementValue, setMinDecrementValue] = useState("");
  const [timerExtendedValue, setTimerExtendedValue] = useState("");
  const [qtySplittingCriteria, setQtySplittingCriteria] = useState("");
  const [counterOfferTimer, setCounterOfferTimer] = useState("");
  const [applicationStart, setApplicationStart] = useState(null);
  const [applicationEnd, setApplicationEnd] = useState(null);

  const parseDate = (date) => (date ? new Date(date) : null);
  const handleApplicationStartChange = (date) => {
    setApplicationStart(date);
    if (applicationEnd && date >= applicationEnd) {
      setApplicationEnd(null); // Reset application end date if the start date is after the end date
    }
  };

  const handleApplicationEndChange = (date) => {
    setApplicationEnd(parseDate(date));
  };

  // Helper function to get the minimum time for the end date picker
  const getMinTime = () => {
    if (!applicationStart) return null;
    const now = new Date();
    if (applicationStart.toDateString() === now.toDateString()) {
      return applicationStart; // Same day as start, so time should be after start time
    }
    return new Date().setHours(0, 0, 0, 0); // Any time is allowed on future days
  };

  // Helper function to get the maximum time for the end date picker
  const getMaxTime = () => {
    if (!applicationStart) return null;
    return new Date().setHours(23, 59, 59, 999); // End of the day
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate a random tender_id using current time
    const tender_id = `tender_${new Date().getTime()}`; // Prefixing with 'tender_' to ensure uniqueness

    // Prepare form data to send to backend
    const formData = {
      tender_title: name, // Title of the tender
      tender_slug: slug, // URL-friendly version of the title
      tender_desc: description, // Description of the tender
      tender_cat: "testing", // Default to 'testing' if not applicable
      tender_opt: isPublished, // Tender option, e.g., publish status
      emd_amt: emdAmount, // EMD Amount
      emt_lvl_amt: emdLevelAmount, // EMD Level Amount
      attachments: attachments, // attachments if needed
      custom_form: JSON.stringify(formFields), // Stringify custom form fields if needed
      currency, // Currency type
      start_price: startingPrice, // Starting price for the tender
      qty: quantity, // Quantity
      dest_port: destinationPort, // Destination port
      bag_size: bagSize, // Size of the bag
      bag_type: bagType, // Type of the bag
      measurement_unit: measurmentUnit, // Measurement unit
      app_start_time: Math.floor(new Date(applicationStart).getTime() / 1000), // Application start time as Unix timestamp
      app_end_time: Math.floor(new Date(applicationEnd).getTime() / 1000), // Application end time as Unix timestamp
      auct_start_time: Math.floor(new Date(auctionStart).getTime() / 1000), // Auction start time as Unix timestamp
      auct_end_time: Math.floor(new Date(auctionEnd).getTime() / 1000), // Auction end time as Unix timestamp
      time_frame_ext: extensionMinutes, // Time frame for extension
      extended_at: extendedAt
        ? Math.floor(new Date(extendedAt).getTime() / 1000)
        : null, // Extended time in Unix timestamp or null
      amt_of_ext: timeExtension, // Amount of time extension
      aut_auct_ext_bfr_end_time: extensionBeforeEndtime, // Auction extension before end time
      min_decr_bid_val: minDecrementValue, // Minimum decrement bid value
      timer_ext_val: timerExtendedValue, // Timer extended value
      qty_split_criteria: qtySplittingCriteria, // Quantity splitting criteria
      counter_offr_accept_timer: counterOfferTimer, // Counter offer acceptance timer
      img_url: image ? URL.createObjectURL(image) : " ", // Image URL created from the uploaded file
      auction_type: auctionType, // Set to null if not applicable
      tender_id: tender_id, // Generate a random tender ID based on the current timestamp if not provided
      audi_key: null, // Set to null if not applicable
      auct_field: auctionFields,
    };

    console.log("form data here 1", formData);

    try {
      const response = await callApiPost("create_new_tender", formData);
      console.log("responses: ", response);
      alert(response.msg);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create tender.");
    }
  };

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"Add new tenders, set visiblity etc."}
        title={"Create new tenders"}
      />

      <div>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="flex flex-row border-2 justify-between  ">
            <div className="max-w-2xl mx-auto mt-10">
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
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="description"
                >
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
              <div className="mb-4"></div>

              {/* for the tender-image upload */}

              <div className="max-w-lg mx-auto mt-10">
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

              {/* for the option-button */}
              <div className="max-w-lg mx-auto mt-10">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                  <h2 className="text-2xl font-bold mb-4">Quick Options</h2>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <label htmlFor="featured" className="mr-3 text-gray-700">
                        Featured
                      </label>
                      <button
                        onClick={handleFeaturedChange}
                        className={`${
                          isFeatured ? "bg-blue-500" : "bg-gray-300"
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
                      >
                        <span
                          className={`${
                            isFeatured ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <label htmlFor="publish" className="mr-3 text-gray-700">
                        Publish
                      </label>
                      <button
                        onClick={handlePublishChange}
                        className={`${
                          isPublished ? "bg-blue-500" : "bg-gray-300"
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
                      >
                        <span
                          className={`${
                            isPublished ? "translate-x-6" : "translate-x-1"
                          } inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* EMD Details Section */}
              <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold mb-4">EMD Details</h2>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="emdAmount"
                  >
                    EMD Amount<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="emdAmount"
                    value={emdAmount}
                    onChange={(e) => setEmdAmount(e.target.value)}
                    placeholder="Enter EMD Amount"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    onFocus={(e) =>
                      e.target.addEventListener("wheel", (event) =>
                        event.preventDefault()
                      )
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="emdLevelAmount"
                  >
                    EMD Level Amount<span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Use ^^ to add multiple amounts ex: (100^^40^^...n)
                  </p>
                  <input
                    type="number"
                    id="emdLevelAmount"
                    value={emdLevelAmount}
                    onChange={(e) => setEmdLevelAmount(e.target.value)}
                    placeholder="Enter EMD Amount"
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

              {/* Attachments */}

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

              {/* Auction For */}
              <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h2 className="text-2xl font-bold mb-4">Auction items</h2>

                {auctionFields.map((auction, index) => (
                  <div key={index} className="mb-6 border-b pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Auction Details<span className="text-red-500">*</span>
                      </h3>
                      <button
                        type="button"
                        onClick={
                          index === 0
                            ? handleAddAuction
                            : () => handleRemoveAuction(index)
                        }
                        className={`${
                          index === 0 ? "bg-green-500" : "bg-red-500"
                        } text-white p-2 rounded-full`}
                      >
                        {index === 0 ? <FaPlus /> : <FaTrash />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Auction Item
                        </label>
                        <input
                          type="text"
                          placeholder="Enter auction item"
                          value={auction.name}
                          onChange={(e) =>
                            handleAuctionInputChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Quantity of Auction
                        </label>
                        <input
                          type="number"
                          placeholder="Enter auction quantity"
                          value={auction.quantity}
                          onChange={(e) =>
                            handleAuctionInputChange(
                              index,
                              "quantity",
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
                  </div>
                ))}

                {/* Auction Type Section */}
                <div>
                  <h3 className="text-lg font-semibold">
                    Auction Type<span className="text-red-500">*</span>
                  </h3>
                  <div className="mt-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="auctionType"
                        value="reverse"
                        checked={auctionType === "reverse"}
                        onChange={handleAuctionTypeChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2">Reverse</span>
                    </label>

                    <label className="inline-flex items-center ml-6">
                      <input
                        type="radio"
                        name="auctionType"
                        value="forward"
                        checked={auctionType === "forward"}
                        onChange={handleAuctionTypeChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2">Forward</span>
                    </label>

                    <label className="inline-flex items-center ml-6">
                      <input
                        type="radio"
                        name="auctionType"
                        value="other"
                        checked={auctionType === "other"}
                        onChange={handleAuctionTypeChange}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2">Other</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <>
                {/* Editable-form  */}
                <div className="flex p-6 space-x-6">
                  <DragDropContext onDragEnd={onDragEnd}>
                    {/* Form Fields Area */}
                    <Droppable droppableId="formFields">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="flex-1 border-2 border-dashed border-gray-400 p-4 rounded-lg min-h-[400px] h-auto"
                        >
                          <h2 className="text-lg font-semibold mb-4">
                            Create Forms
                          </h2>
                          <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            {formFields.length === 0 && (
                              <p>Drag a field from the right to this area</p>
                            )}
                            {formFields.map((field, index) => (
                              <div key={index} className="w-full">
                                {renderField(field, index)}
                              </div>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>

                    {/* Options List */}
                    <Droppable droppableId="fields" isDropDisabled={true}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="w-64 bg-white border border-gray-300 rounded-lg shadow-md p-4"
                        >
                          {initialFields.map((field, index) => (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-gray-50 p-2 mb-2 border border-gray-300 rounded-lg cursor-pointer"
                                >
                                  {field.content}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
                {/* full-detail */}
                <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                  <h2 className="text-2xl font-bold mb-6">Details</h2>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="currency"
                    >
                      Currency<span className="text-red-500">*</span>
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="INR(₹)">INR(₹)</option>
                      <option value="USD($)">USD($)</option>
                      <option value="EUR(€)">EUR(€)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="startingPrice"
                    >
                      Starting Price<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="startingPrice"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      placeholder="Enter Starting Price"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="quantity"
                    >
                      Quantity<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter Quantity"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="destinationPort"
                    >
                      Destination Port<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="destinationPort"
                      value={destinationPort}
                      onChange={(e) => setDestinationPort(e.target.value)}
                      placeholder="Enter Destination Port"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="bagSize"
                    >
                      Bag Size<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="bagSize"
                      value={bagSize}
                      onChange={(e) => setBagSize(e.target.value)}
                      placeholder="Enter Bag Size"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="bagType"
                    >
                      Bag Type<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="bagType"
                      value={bagType}
                      onChange={(e) => setBagType(e.target.value)}
                      placeholder="Enter Bag Type"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="measurmentUnit"
                    >
                      Measurement Unit<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="measurmentUnit"
                      value={measurmentUnit}
                      onChange={(e) => setMeasurmentUnit(e.target.value)}
                      placeholder="Enter Measurment Unit"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Application Start Date/Time
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <DatePicker
                        selected={applicationStart}
                        onChange={handleApplicationStartChange}
                        showTimeSelect
                        dateFormat="MM/dd/yyyy hh:mm aa"
                        placeholderText="mm/dd/yyyy --:-- --"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        wrapperClassName="w-full"
                        required
                        // minDate={new Date()} // Prevent selecting past dates
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Application End Date/Time
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <DatePicker
                        selected={applicationEnd}
                        onChange={handleApplicationEndChange}
                        showTimeSelect
                        dateFormat="MM/dd/yyyy hh:mm aa"
                        placeholderText="mm/dd/yyyy --:-- --"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        wrapperClassName="w-full"
                        required
                        minDate={applicationStart || new Date()} // Prevent selecting dates before the start date
                        // minTime={getMinTime()} // Set the minimum time for the end date picker
                        // maxTime={getMaxTime()} // Set the maximum time for the end date picker
                        disabled={!applicationStart} // Disable until start date is selected
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Auction Start Date/Time
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Set proper date and time (AM/PM) - From this date and time
                      auction actually starts. Allow applicants to start
                      bidding.
                    </p>
                    <div className="w-full">
                      <DatePicker
                        selected={auctionStart}
                        onChange={(date) => setAuctionStart(date)}
                        showTimeSelect
                        dateFormat="MM/dd/yyyy hh:mm aa"
                        placeholderText="mm/dd/yyyy --:-- --"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        wrapperClassName="w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Auction End Date/Time
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Set proper date and time (AM/PM) - From this date and time
                      auction actually stops. Restricts applicants from bidding.
                      (Based on the condition, our system auto increments the
                      deadline)
                    </p>
                    <div className="w-full">
                      <DatePicker
                        selected={auctionEnd}
                        onChange={(date) => setAuctionEnd(date)}
                        showTimeSelect
                        dateFormat="MM/dd/yyyy hh:mm aa"
                        placeholderText="mm/dd/yyyy --:-- --"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        wrapperClassName="w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Timeframe For Extension (Check from last in minutes)
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This time extends on auction_end_date and time
                      automatically when a bid happens in the last
                      auto_extension_minutes
                    </p>
                    <input
                      type="number"
                      value={extensionMinutes}
                      onChange={(e) => setExtensionMinutes(e.target.value)}
                      placeholder="Enter Auto Auction Extension Minutes"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Extended At
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This time extends on extended at and time automatically
                      extended
                    </p>
                    <div className="w-full">
                      <DatePicker
                        selected={extendedAt}
                        onChange={(date) => setExtendedAt(date)}
                        showTimeSelect
                        dateFormat="MM/dd/yyyy hh:mm aa"
                        placeholderText="mm/dd/yyyy --:-- --"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Amount of Time Extension
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This value is (time in min) used in extending when a bid
                      occurs in the last movement
                    </p>
                    <input
                      type="number"
                      value={timeExtension}
                      onChange={(e) => setTimeExtension(e.target.value)}
                      placeholder="Enter Auto Auction Extension Number Time"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Auto Auction Extension before end time
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This value defines the number of times the timer can be
                      extended when the last movement bid happens.
                    </p>
                    <input
                      type="number"
                      value={extensionBeforeEndtime}
                      onChange={(e) =>
                        setExtensionBeforeEndtime(e.target.value)
                      }
                      placeholder="Enter Auto Auction Extension Before Endtime"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Minimum Decrement Bid Value
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This value defines the amount of decrement in each bid
                      request.
                    </p>
                    <input
                      type="number"
                      value={minDecrementValue}
                      onChange={(e) => setMinDecrementValue(e.target.value)}
                      placeholder="Enter Counter Offer Acceptance Timer"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Timer Extended Value
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This value defines how many times the timer is extended
                      (if you are starting again, keep this value 0).
                    </p>
                    <input
                      type="number"
                      value={timerExtendedValue}
                      onChange={(e) => setTimerExtendedValue(e.target.value)}
                      placeholder="Enter Timer Extended Value"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Qty Splitting Criteria
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This value defines chunks of qty available for the main
                      auction or counter rounds. (100^^40^^...n) First qty is
                      always round one, and then all are Level Qty.
                    </p>
                    <input
                      type="number"
                      value={qtySplittingCriteria}
                      onChange={(e) => setQtySplittingCriteria(e.target.value)}
                      placeholder="Enter Qty Splitting Criteria"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      onFocus={(e) =>
                        e.target.addEventListener("wheel", (event) =>
                          event.preventDefault()
                        )
                      }
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Counter Offer Acceptance Timer
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      This value defines the amount of decrement in each bid
                      request.
                    </p>
                    <input
                      type="number"
                      value={counterOfferTimer}
                      onChange={(e) => setCounterOfferTimer(e.target.value)}
                      placeholder="Enter Counter Offer Acceptance Timer"
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
              </>
            </div>
          </div>

          {/* Sticky Submit Button */}
          <div className="fixed bottom-8 right-4 p-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

AddTender.layout = UserDashboard;
export default AddTender;