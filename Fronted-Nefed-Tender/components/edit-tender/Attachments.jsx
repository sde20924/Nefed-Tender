// components/edit-tender/Attachments.jsx
import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Attachments = ({ attachments, setAttachments }) => {
  /**
   * Updates a single attachment by index when a field changes.
   */
  const handleInputChange = (index, key, value) => {
    const updatedAttachments = [...attachments];
    updatedAttachments[index][key] = value;
    setAttachments(updatedAttachments);
  };

  /**
   * Updates a single attachment's file by index.
   */
  const handleFileChange = (index, file) => {
    if (file) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"]; // Example types

      if (file.size > MAX_SIZE) {
        toast.error("File size exceeds the 10MB limit.");
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file type.");
        return;
      }

      const updatedAttachments = [...attachments];
      updatedAttachments[index].file = file;
      setAttachments(updatedAttachments);
    }
  };

  /**
   * Adds a new blank attachment to the array.
   */
  const addAttachment = () => {
    setAttachments([
      ...attachments,
      { key: "", extension: "", maxFileSize: "", label: "", file: null },
    ]);
  };

  /**
   * Removes the attachment at a given index.
   */
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div></div>
  );
};

export default Attachments;
