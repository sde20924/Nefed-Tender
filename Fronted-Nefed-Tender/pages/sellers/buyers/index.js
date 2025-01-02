import UserDashboard from "@/layouts/UserDashboard";
import React, { useState, useEffect } from "react";
import {
  brokerGetApi,
  createBrokerApi,
  deleteBrokerApi,
} from "@/utils/FetchApi";
import ViButton from "@/components/Input/ViButton";
import ViDialog from "@/components/Input/ViDialog";
import { debounce } from "lodash";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaTrashAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import Withauth from "@/components/Higher-Order Component/admin/withAuth";

function Brokers() {
  const [brokersData, setBrokersData] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [brokerList, setBrokerList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState(null);
  const [newBroker, setNewBroker] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
  });

  // Fetch the broker list for the table on component mount
  const fetchBrokerList = async () => {
    try {
      setIsLoading(true);
      const response = await brokerGetApi("get-vessel-brokers");
      if (response && response.brokers) {
        setBrokerList(response.brokers);
      } else {
        setBrokerList([]);
      }
    } catch (error) {
      setError("Failed to fetch brokers for table. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerList();
  }, []);

  // Debounced function to handle search
  const debouncedFetchBrokers = debounce(async (searchQuery) => {
    if (searchQuery.length < 3) {
      setBrokersData([]); // Clear if less than 3 characters
      return;
    }

    setIsLoading(true);
    try {
      const response = await brokerGetApi(
        "get-vessel-broker-lists",
        searchQuery
      );
      if (response && response.broker_data) {
        setBrokersData(response.broker_data);
      } else {
        setBrokersData([]);
      }
    } catch (err) {
      setError("Failed to fetch brokers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Function to delete a broker
  const deleteBroker = async () => {
    try {
      setIsLoading(true);
      const response = await deleteBrokerApi(
        `delete-vessel-broker/${brokerToDelete.broker_user_id}`,
        "DELETE"
      );
      if (response.success) {
        toast.success("Broker deleted successfully", {
          icon: false,
        });
        setBrokerList(
          brokerList.filter(
            (broker) => broker.broker_user_id !== brokerToDelete.broker_user_id
          )
        );
        setOpenConfirmDialog(false);
      } else {
        toast.error("Failed to delete broker.", {
          icon: false,
        });
      }
    } catch (error) {
      toast.error("Error deleting broker. Please try again.", {
        icon: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle delete click and open confirmation dialog
  const handleDeleteClick = (broker) => {
    setBrokerToDelete(broker);
    setOpenConfirmDialog(true);
  };

  // Function to create a new broker using the modal data
  const createBroker = async () => {
    setIsLoading(true);
    setError("");

    // Check if broker already exists
    const duplicateBroker = brokerList.some(
      (broker) =>
        broker.email === newBroker.email &&
        broker.company_name === newBroker.company_name
    );
    if (duplicateBroker) {
      toast.error("Broker already added.", { icon: false });
      setIsLoading(false);
      return;
    }

    if (
      !newBroker.first_name ||
      !newBroker.last_name ||
      !newBroker.email ||
      !newBroker.company_name
    ) {
      toast.error("All fields are required to create a broker.", {
        icon: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const newBrokerResponse = await createBrokerApi(
        "add-vessel-broker",
        "POST",
        newBroker
      );
      if (newBrokerResponse && newBrokerResponse.data.id) {
        toast.success("Broker Successfully Created", {
          icon: false,
        });
        setNewBroker({
          first_name: "",
          last_name: "",
          email: "",
          company_name: "",
        });
        setOpenModal(false);
        fetchBrokerList(); // Refetch broker list after adding a new broker
      } else {
        toast.error("Failed to create broker. Please try again.", {
          icon: false,
        });
      }
    } catch (err) {
      toast.error("Failed to create broker. Please try again.", {
        icon: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add selected broker to the list
  const addBroker = async () => {
    setIsLoading(true);
    setError("");

    // Check if broker already exists
    const duplicateBroker = brokerList.some(
      (broker) => broker.email === selectedBroker.email
    );
    if (duplicateBroker) {
      toast.error("Broker already added.", { icon: false });
      setSearchTerm("");
      setBrokersData([]);
      setIsLoading(false);
      return;
    }

    try {
      const newBrokerResponse = await createBrokerApi(
        "add-vessel-broker",
        "POST",
        selectedBroker
      );
      if (newBrokerResponse && newBrokerResponse.data.id) {
        toast.success("Broker Successfully Added", {
          icon: false,
        });
        setSelectedBroker(null);
        setSearchTerm("");
        setBrokersData([]);
        fetchBrokerList();
      } else {
        toast.error("Failed to add broker. Please try again.", {
          icon: false,
        });
      }
    } catch (err) {
      toast.error("Failed to add broker. Please try again.", {
        icon: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening/closing of the modal
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Handle closing the confirmation dialog
  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

  // Handle input change for search term and trigger debounced search
  const handleSearchTermChange = (e) => {
    const searchQuery = e.target.value;
    setSearchTerm(searchQuery);

    if (searchQuery.length >= 3) {
      debouncedFetchBrokers(searchQuery);
    } else {
      setBrokersData([]);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">
        Add Buyers to Your List
      </h2>

      <div className="w-full mb-4 flex items-center justify-between">
        <div className="flex w-full relative">
          <Input
            id="broker-search"
            name="broker"
            label="Search Broker"
            value={searchTerm}
            onChange={handleSearchTermChange}
            placeholder="Search by Name, Email, or Company"
            className="w-full max-w-md rounded-md shadow-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
          />

          {/* Autocomplete dropdown with reduced width */}
          {brokersData.length > 0 && searchTerm.length >= 3 && (
            <div className="absolute top-full left-0 w-full max-w-md bg-white shadow-lg rounded-md z-10 mt-2 max-h-60 overflow-y-auto border border-gray-200">
              {brokersData.map((broker) => (
                <div
                  key={broker.email}
                  className="p-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => {
                    setSelectedBroker(broker);
                    setSearchTerm(
                      `${broker.first_name} ${broker.last_name} | ${broker.email}`
                    );
                    setBrokersData([]);
                  }}
                >
                  {`${broker.first_name} ${broker.last_name} | ${broker.email} | ${broker.company_name}`}
                </div>
              ))}
            </div>
          )}

          {selectedBroker && (
            <Button
              color="primary"
              onClick={addBroker}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all"
            >
              Add Buyer
            </Button>
          )}
        </div>

        <Button
          color="secondary"
          onClick={handleOpenModal}
          className=" bg-green-500 hover:bg-green-600 text-white font-semibold  rounded-md shadow-lg transition-all"
        >
          Add New Buyer
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-600">
          Your Buyers
        </h3>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                First Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {brokerList.map((broker, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{broker.first_name}</td>
                <td className="px-6 py-4">{broker.last_name}</td>
                <td className="px-6 py-4">{broker.email}</td>
                <td className="px-6 py-4">{broker.company_name}</td>
                <td className="px-6 py-4">
                  <FaTrashAlt
                    className="cursor-pointer text-red-500 hover:text-red-600 transition"
                    onClick={() => handleDeleteClick(broker)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ViDialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <div className="p-0 w-90">
          <h3 className="text-lg font-semibold  text-gray-700">
            Confirm Delete
          </h3>
          <p className="text-gray-600">
            Are you sure you want to delete this Buyer?
          </p>
          <div className="flex justify-start mt-4">
            <ViButton
              onClick={handleCloseConfirmDialog}
              color="secondary"
              className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-md transition"
            >
              Cancel
            </ViButton>
            <ViButton
              onClick={deleteBroker}
              color="primary"
              disabled={isLoading}
              className="mr-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </ViButton>
          </div>
        </div>
      </ViDialog>

      {/* Add Broker Dialog */}
      <ViDialog open={openModal} onClose={handleCloseModal}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Create a New Buyer
          </h3>
          {["first_name", "last_name", "email", "company_name"].map(
            (field, idx) => (
              <div className="relative mb-4" key={idx}>
                <Input
                  id={field}
                  name={field}
                  value={newBroker[field]}
                  onChange={(e) =>
                    setNewBroker({ ...newBroker, [field]: e.target.value })
                  }
                  placeholder={field
                    .replace("_", " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <label
                  htmlFor={field}
                  className={`absolute left-3 -top-2.5 text-sm text-gray-500 bg-white px-1 transform -translate-y-1/2 transition-all ${
                    newBroker[field] ? "top-0" : "top-4"
                  }`}
                >
                  {field
                    .replace("_", " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </label>
              </div>
            )
          )}
          <div className="flex justify-end mt-4">
            <ViButton
              onClick={handleCloseModal}
              color="secondary"
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md shadow-md transition"
            >
              Cancel
            </ViButton>
            <ViButton
              onClick={createBroker}
              color="primary"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition"
            >
              {isLoading ? "Creating..." : "Create Buyer"}
            </ViButton>
          </div>
        </div>
      </ViDialog>
      {/* <ToastContainer /> */}
    </div>
  );
}

Brokers.layout = UserDashboard;

export default Brokers;
