// components/edit-tender/EditTenderForm.jsx
import React, { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import "react-datepicker/dist/react-datepicker.css";
import UserDashboard from "@/layouts/UserDashboard";
import HeaderTitle from "@/components/HeaderTitle/HeaderTitle";
import { callApiGet, callApiPost } from "@/utils/FetchApi";
import TenderDetails from "@/components/edit-tender/TenderDetails";
import ImageUpload from "@/components/edit-tender/ImageUpload";
import QuickOptions from "@/components/edit-tender/QuickOptions";
import EMDDetails from "@/components/edit-tender/EMDDetails";
import Attachments from "@/components/edit-tender/Attachments";
import FullDetails from "@/components/edit-tender/FullDetails";
import EditTAble from "@/components/edit-tender/EditTAble";
import AuctionItems from "@/components/edit-tender/AuctionItems";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });

const initialFields = [
  { id: "textarea-1", type: "textarea", content: "Text Area" },
  { id: "textfield-1", type: "textfield", content: "Text Field" },
  { id: "number-1", type: "number", content: "Number" },
  { id: "datefield-1", type: "datefield", content: "Date Field" },
  { id: "checkboxgroup-1", type: "checkboxgroup", content: "Checkbox Group" },
  { id: "radiogroup-1", type: "radiogroup", content: "Radio Group" },
  { id: "select-1", type: "select", content: "Select" },
];

const EditTenderForm = () => {
  const [headers, setHeaders] = useState([]);
  const [subTenders, setSubTenders] = useState([]);
  const [data, setData] = useState();
  const router = useRouter();
  const { id } = router.query;

  // ---------- TENDER DATA STATE ----------
  const [tenderData, setTenderData] = useState({
    name: "",
    slug: "",
    description: "",
    isFeatured: false,
    isPublished: false,
    attachments: [],
    currency: "",
    startingPrice: "",
    quantity: "",
    destinationPort: "",
    bagSize: "",
    bagType: "",
    measurementUnit: "",
    applicationStart: null,
    applicationEnd: null,
    auctionStart: null,
    auctionEnd: null,
    extensionMinutes: "",
    extendedAt: null,
    timeExtension: "",
    extensionBeforeEndtime: "",
    minDecrementValue: "",
    timerExtendedValue: "",
    qtySplittingCriteria: "",
    counterOfferTimer: "",
    customForm: {},
    accessPosition: "",
    ShowItems:"",
    formula: "",
  });

  // ---------- IMAGE UPLOAD STATE ----------
  const [error, setError] = useState("");

  // ---------- DRAG & DROP FORM BUILDER STATE ----------
  const [formFields, setFormFields] = useState([]);

  // ---------- AUCTION STATE ----------
  const [auctionType, setAuctionType] = useState("reverse");
  const [accessType, setAccessType] = useState("public");
  const [selectedBuyers, setSelectedBuyers] = useState([]);
  const [accessPosition, setAccessPosition] = useState("yes");
  const [ShowItems, setShowItems] = useState("yes");

  // ---------- DRAG & DROP HANDLER FOR FORM BUILDER ----------
  const onDragEnd = (result) => {
    const { source, destination } = result;

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

  // ---------- FETCH TENDER DATA ON LOAD ----------
  useEffect(() => {
    if (id) {
      const fetchTenderDetails = async () => {
        try {
          const response = await callApiGet(`tender/${id}`);
          const data = response.data || {};
          setHeaders(response.data.headers);
          setSubTenders(response.data.sub_tenders);
          console.log("hasdjxdd", response.data);

          setTenderData((prev) => ({
            ...prev,
            name: data.tender_title?.trim() || "",
            slug: data.tender_slug?.trim() || "",
            description: data.tender_desc?.trim() || "",
            isFeatured: data.tender_opt === "true",
            isPublished: data.tender_opt === "true",
            attachments: Array.isArray(data.tenderDocuments)
              ? data.tenderDocuments.map((att) => ({
                  ...att,
                  file: null, // Handle existing files as needed
                }))
              : [
                  {
                    key: "",
                    extension: "",
                    size: "",
                    label: "",
                    file: null,
                  },
                ],
            currency: data.currency?.trim() || "INR(₹)",
            startingPrice: data.start_price?.toString() || "",
            quantity: data.qty?.toString() || "",
            destinationPort: data.dest_port?.trim() || "",
            bagSize: data.bag_size?.trim() || "",
            bagType: data.bag_type?.trim() || "",
            measurementUnit: data.measurement_unit?.trim() || "",
            applicationStart: data.app_start_time
              ? new Date(parseInt(data.app_start_time) * 1000)
              : null,
            applicationEnd: data.app_end_time
              ? new Date(parseInt(data.app_end_time) * 1000)
              : null,
            auctionStart: data.auct_start_time
              ? new Date(parseInt(data.auct_start_time) * 1000)
              : null,
            auctionEnd: data.auct_end_time
              ? new Date(parseInt(data.auct_end_time) * 1000)
              : null,
            extensionMinutes: data.time_frame_ext?.toString() || "",
            extendedAt: data.extended_at
              ? new Date(parseInt(data.extended_at) * 1000)
              : null,
            timeExtension: data.amt_of_ext?.toString() || "",
            extensionBeforeEndtime:
              data.aut_auct_ext_bfr_end_time?.toString() || "",
            minDecrementValue: data.min_decr_bid_val?.toString() || "",
            timerExtendedValue: data.timer_ext_val?.toString() || "",
            qtySplittingCriteria: data.qty_split_criteria?.trim() || "",
            counterOfferTimer: data.counter_offr_accept_timer?.toString() || "",
            // Add auction-related data
            auction_type: data.auction_type || "reverse",
            accessType: data.accessType || "public",
            selected_buyers: data.selected_buyers || [],
            ShowItems:data.show_items || "yes",
            formula: data.generatedFormula|| "",
          }));
          // Set auction states
          setAuctionType(data.auction_type || "reverse");
          setAccessType(data.accessType || "public");
          setSelectedBuyers(data.selected_buyers || []);
          setAccessPosition(data.access_position);
          setShowItems(data.show_items);
        } catch (error) {
          console.error("Error fetching tender details:", error);
          toast.error("Failed to fetch tender details.");
        }
      };

      fetchTenderDetails();
    }
  }, [id]);
  const handleSelectedBuyersChange = (buyers) => {
    const buyerIds = buyers.map((buyer) => buyer.user_id);
    setSelectedBuyers(buyerIds);
    console.log(selectedBuyers); // Store only IDs in the state
  };
  // ---------- SUBMIT HANDLER ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      tender_title: tenderData.name, // Title of the tender
      tender_slug: tenderData.slug, // URL-friendly version of the title
      tender_desc: tenderData.description, // Description of the tender
      tender_cat: "testing", // Default to 'testing' if not applicable
      tender_opt: tenderData.isPublished, // Tender option, e.g., publish status
      // emd_amt: tenderData.emdAmount, // EMD Amount
      // emt_lvl_amt: tenderData.emdLevelAmount, // EMD Level Amount
      attachments: tenderData.attachments, // Attachments if needed
      custom_form: JSON.stringify(tenderData.customForm), // Stringify custom form fields if needed
      currency: tenderData.currency, // Currency type
      start_price: tenderData.startingPrice, // Starting price for the tender
      qty: tenderData.quantity, // Quantity
      dest_port: tenderData.destinationPort, // Destination port
      bag_size: tenderData.bagSize, // Size of the bag
      bag_type: tenderData.bagType, // Type of the bag
      measurement_unit: tenderData.measurementUnit, // Measurement unit
      app_start_time: tenderData.applicationStart
        ? Math.floor(new Date(tenderData.applicationStart).getTime() / 1000)
        : null, // Application start time as Unix timestamp
      app_end_time: tenderData.applicationEnd
        ? Math.floor(new Date(tenderData.applicationEnd).getTime() / 1000)
        : null, // Application end time as Unix timestamp
      auct_start_time: tenderData.auctionStart
        ? Math.floor(new Date(tenderData.auctionStart).getTime() / 1000)
        : null, // Auction start time as Unix timestamp
      auct_end_time: tenderData.auctionEnd
        ? Math.floor(new Date(tenderData.auctionEnd).getTime() / 1000)
        : null, // Auction end time as Unix timestamp
      time_frame_ext: tenderData.extensionMinutes, // Time frame for extension
      extended_at: tenderData.extendedAt
        ? Math.floor(new Date(tenderData.extendedAt).getTime() / 1000)
        : null, // Extended time in Unix timestamp or null
      amt_of_ext: tenderData.timeExtension, // Amount of time extension
      aut_auct_ext_bfr_end_time: tenderData.extensionBeforeEndtime, // Auction extension before end time
      min_decr_bid_val: tenderData.minDecrementValue, // Minimum decrement bid value
      timer_ext_val: tenderData.timerExtendedValue, // Timer extended value
      qty_split_criteria: tenderData.qtySplittingCriteria, // Quantity splitting criteria
      counter_offr_accept_timer: tenderData.counterOfferTimer, // Counter offer acceptance timer
      img_url: tenderData.image ? URL.createObjectURL(tenderData.image) : " ", // Image URL created from the uploaded file
      auction_type: auctionType, // Updated to use auctionType state
      accessType: accessType, // Access Type (public/private)
      selected_buyers: selectedBuyers, // Array of selected buyer IDs or objects
      audi_key: tenderData.audiKey,
      headers: headers,
      sub_tender: subTenders, // Audio key, set to null if not applicable
      access_position:accessPosition,
      ShowItems:ShowItems,
 

    };

    console.log("form data here 1", formData);
    console.log(accessType);
    console.log("++++++++++++", selectedBuyers);
    try {
      const response = await callApiPost(`update-tender/${id}`, formData);
      toast.success("Tender Updated");
      router.push("/tenders");
      setData(response.data);
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error("Failed to update tender.");
    }
  };

  return (
    <>
      <HeaderTitle
        padding="p-4"
        subTitle="Add new tenders, set visibility, etc."
        title="Create new tenders"
      />

      <div className="container mx-auto px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 relative"
        >
          {/* Grid Layout with 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ----- LEFT COLUMN ----- */}
            <div>
              {/* Tenders Details */}
              <TenderDetails
                tenderData={tenderData}
                setTenderData={setTenderData}
              />

              {/* Image Upload */}
              <ImageUpload
                tenderData={tenderData}
                setTenderData={setTenderData}
                error={error}
                setError={setError}
              />

              {/* Quick Options */}
              <QuickOptions
                tenderData={tenderData}
                setTenderData={setTenderData}
              />

              {/* EMD Details */}
              {/* <EMDDetails
                tenderData={tenderData}
                setTenderData={setTenderData}
              /> */}

              {/* Attachments */}
              <Attachments
                attachments={tenderData.attachments}
                setAttachments={(updatedAttachments) =>
                  setTenderData((prev) => ({
                    ...prev,
                    attachments: updatedAttachments,
                  }))
                }
              />

              {/* Auction Items */}
              <AuctionItems
                auctionType={auctionType}
                setAuctionType={setAuctionType}
                accessType={accessType}
                setAccessType={setAccessType}
                accessPosition={accessPosition}
                setAccessPosition={setAccessPosition}
                ShowItems={ShowItems}
                setShowItems={setShowItems}
                onSelectedBuyersChange={() => handleSelectedBuyersChange}
                initialSelectedBuyersIds={tenderData.selected_buyers}
              />
            </div>

            {/* ----- RIGHT COLUMN ----- */}
            <div>
              {/* Full Details */}
              <FullDetails
                tenderData={tenderData}
                setTenderData={setTenderData}
              />
            </div>
          </div>

          <EditTAble
            headers={headers}
            setHeaders={setHeaders}
            subTenders={subTenders}
            setSubTenders={setSubTenders}
          />

          {/* Sticky Submit Button */}
          <div className="fixed bottom-8 right-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Edit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

EditTenderForm.layout = UserDashboard;
export default EditTenderForm;
