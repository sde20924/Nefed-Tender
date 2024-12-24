 const uniqueFieldMessages = {
    'email': 'The email address is already in use. Please use a different email address.',
    'pan_number': 'The PAN number is already in use. Please use a different PAN number.',
    'gst_number': 'The GST number is already in use. Please use a different GST number.',
    'adhaar_number': 'The Aadhaar number is already in use. Please use a different Aadhaar number.',
    'phone_number': 'The phone number is already in use. Please use a different phone number.',
  };

  const extractFieldName = (detail) => {
    const match = detail.match(/Key \(([^)]+)\)=/);
    return match ? match[1] : null;
  };
  module.exports = {uniqueFieldMessages, extractFieldName}
  