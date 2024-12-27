// pages/AddTender.js
import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import UserDashboard from "@/layouts/UserDashboard";
import React, { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { DragDropContext } from "react-beautiful-dnd";
import { callApiPost } from "@/utils/FetchApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditableSheet from "@/components/add-tander/EditableSheet";
import TendersDetails from "@/components/add-tander/TenderDetails";
import ImageUpload from "@/components/add-tander/ImageUpload";
import QuickOptions from "@/components/add-tander/QuickOptions";
import EMDDetails from "@/components/add-tander/EMDDetails";
import Attachments from "@/components/add-tander/Attachments";
import AuctionItems from "@/components/add-tander/AuctionItems";
import CustomFormBuilder from "@/components/add-tander/CustomForm";
import FullDetails from "@/components/add-tander/FullDetails";

// Importing newly created components

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
  const router = useRouter();

  // Tenders Details
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

  // Image Upload
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

  // Quick Options
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleFeaturedChange = () => {
    setIsFeatured(!isFeatured);
  };

  const handlePublishChange = () => {
    setIsPublished(!isPublished);
  };

  // EMD Details
  const [emdAmount, setEmdAmount] = useState("");
  const [emdLevelAmount, setEmdLevelAmount] = useState("");

  // Attachments
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

  // Auction Items
  const [auctionFields, setAuctionFields] = useState([
    { name: "", quantity: "" },
  ]);

  const [auctionType, setAuctionType] = useState("");

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

  // Custom Form Builder
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

  // Tender Details Form
  const [currency, setCurrency] = useState("INR(₹)");
  const [startingPrice, setStartingPrice] = useState("");
  // const [quantity, setQuantity] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [bagSize, setBagSize] = useState("");
  const [bagType, setBagType] = useState("");
  // const [measurmentUnit, setMeasurmentUnit] = useState("");
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
  const [headers, setHeaders] = useState([
    "S.No",                   
    "Item",
    "Item Description",
    "UOM",
    "Total Qty",
    "Rate",
  ]);
  const [subTenders, setSubTenders] = useState([]); 

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

  // Handle Submit
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
      // qty: quantity, // Quantity
      dest_port: destinationPort, // Destination port
      bag_size: bagSize, // Size of the bag
      bag_type: bagType, // Type of the bag
      // measurement_unit: measurmentUnit, // Measurement unit
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
      // auct_field: auctionFields,
      editable_sheet: {
        headers, // Headers from EditableSheet
        sub_tenders: subTenders, // SubTender data with rows
      },
    };

    console.log("form data here 1", formData);

    try {
      const response = await callApiPost("create_new_tender", formData);
      console.log("responses: ", response);
      toast.success(response.msg);
      // router.push("/tender");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to create tender.");
    }
  };

  return (
    <>
      <HeaderTitle
        padding={"p-4"}
        subTitle={"Add new tenders, set visibility etc."}
        title={"Create new tenders"}
      />

      <div className="container mx-auto px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-md p-6 md:p-10 mb-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-2 p-6 rounded-md">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Tenders Details */}
              <TendersDetails
                name={name}
                setName={setName}
                slug={slug}
                description={description}
                handleDescriptionChange={handleDescriptionChange}
              />

              {/* Image Upload */}
              <ImageUpload
                image={image}
                error={error}
                getRootProps={getRootProps}
                getInputProps={getInputProps}
              />

              {/* Quick Options */}
              <QuickOptions
                isFeatured={isFeatured}
                handleFeaturedChange={handleFeaturedChange}
                isPublished={isPublished}
                handlePublishChange={handlePublishChange}
              />

              {/* EMD Details */}
              <EMDDetails
                emdAmount={emdAmount}
                setEmdAmount={setEmdAmount}
                emdLevelAmount={emdLevelAmount}
                setEmdLevelAmount={setEmdLevelAmount}
              />

              {/* Attachments */}
              <Attachments
                attachments={attachments}
                handleAddAttachment={handleAddAttachment}
                handleRemoveAttachment={handleRemoveAttachment}
                handleInputChange={handleInputChange}
              />

              {/* Auction Items */}
              <AuctionItems
                handleRemoveAuction={handleRemoveAuction}
                handleAuctionInputChange={handleAuctionInputChange}
                auctionType={auctionType}
                handleAuctionTypeChange={handleAuctionTypeChange}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Custom Form Builder */}
              {/* Uncomment and use as needed */}
              {/* <CustomFormBuilder
              formFields={formFields}
              onDragEnd={onDragEnd}
              renderField={renderField}
              initialFields={initialFields}
            /> */}

              {/* Tender Details Form */}
              <FullDetails
                currency={currency}
                setCurrency={setCurrency}
                startingPrice={startingPrice}
                setStartingPrice={setStartingPrice}
                // quantity={quantity}
                // setQuantity={setQuantity}
                destinationPort={destinationPort}
                setDestinationPort={setDestinationPort}
                bagSize={bagSize}
                setBagSize={setBagSize}
                bagType={bagType}
                setBagType={setBagType}
                // measurmentUnit={measurmentUnit}
                // setMeasurmentUnit={setMeasurmentUnit}
                applicationStart={applicationStart}
                handleApplicationStartChange={handleApplicationStartChange}
                applicationEnd={applicationEnd}
                handleApplicationEndChange={handleApplicationEndChange}
                auctionStart={auctionStart}
                setAuctionStart={setAuctionStart}
                auctionEnd={auctionEnd}
                setAuctionEnd={setAuctionEnd}
                extensionMinutes={extensionMinutes}
                setExtensionMinutes={setExtensionMinutes}
                extendedAt={extendedAt}
                setExtendedAt={setExtendedAt}
                timeExtension={timeExtension}
                setTimeExtension={setTimeExtension}
                extensionBeforeEndtime={extensionBeforeEndtime}
                setExtensionBeforeEndtime={setExtensionBeforeEndtime}
                minDecrementValue={minDecrementValue}
                setMinDecrementValue={setMinDecrementValue}
                timerExtendedValue={timerExtendedValue}
                setTimerExtendedValue={setTimerExtendedValue}
                qtySplittingCriteria={qtySplittingCriteria}
                setQtySplittingCriteria={setQtySplittingCriteria}
                counterOfferTimer={counterOfferTimer}
                setCounterOfferTimer={setCounterOfferTimer}
              />
            </div>
          </div>
          {/* Submit Button */}
           {/* Sticky Submit Button */}
           <div className="fixed bottom-8 right-4 p-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create
            </button>
            </div>

          <EditableSheet 
          headers={headers}
          setHeaders={setHeaders}
          subTenders={subTenders}
          setSubTenders={setSubTenders}/>

        </form>
        {/* Sticky Submit Button */}
        
      </div>

      <ToastContainer />
    </>
  );
};

AddTender.layout = UserDashboard;
export default AddTender;
