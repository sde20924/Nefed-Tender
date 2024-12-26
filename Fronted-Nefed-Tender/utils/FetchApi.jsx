const BASE_URL_LOCAL = "https://api.tender.shippingbaba.com/";
const BASE_URL_TENDER = "https://tenderapi.nafedtrackandtrace.com/";
const BASE_URL_VESSEL = "https://tender-vessel-module.nafedtrackandtrace.com/";
const AUTH_URL = "https://tender-auth-module.nafedtrackandtrace.com/";

const callApiBase = async ({
  route,
  method = "GET",
  body,
  headers = {},
  baseUrl = BASE_URL_LOCAL,
}) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...headers,
      },
    };

    if (body && method !== "GET") {
      options.body = body instanceof FormData ? body : JSON.stringify(body);
      // Remove Content-Type header for FormData (it sets its own boundary)
      if (body instanceof FormData) delete options.headers["Content-Type"];
    }

    const response = await fetch(`${baseUrl}${route}`, options);

    const data = await response.json();
    console.log("Response Data:", data);
    return data;
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

// Specialized functions for different APIs
const callApi = (route, method, body) =>
  callApiBase({ route, method, body, baseUrl: BASE_URL_TENDER });
const authApi = (route, method, body) =>
  callApiBase({ route, method, body, baseUrl: AUTH_URL });
const callApiGet = (route) => callApiBase({ route });
const callApiPost = (route, body) =>
  callApiBase({ route, method: "POST", body });
const callApiDelete = (route) => callApiBase({ route, method: "DELETE" });
const uploadDocApi = (route, formData) =>
  callApiBase({
    route,
    method: "POST",
    body: formData,
    baseUrl: BASE_URL_VESSEL,
  });

// Vessel-specific APIs
const vesselCallApi = (route, method, body) =>
  callApiBase({ route, method, body, baseUrl: BASE_URL_VESSEL });
const vesselGetApi = (route) =>
  callApiBase({ route, baseUrl: BASE_URL_VESSEL });

// Commodity-specific APIs
const commodityGetApi = (route) =>
  callApiBase({ route, baseUrl: BASE_URL_VESSEL });
const commoditySearchGetApi = (route) =>
  callApiBase({ route, baseUrl: BASE_URL_VESSEL });
const commodityCallApi = (route, method, body) =>
  callApiBase({ route, method, body, baseUrl: BASE_URL_VESSEL });

// Port-specific APIs
const portGetApi = (route) => callApiBase({ route, baseUrl: BASE_URL_VESSEL });

// View offerings API
const viewOfferingGetApi = (route) =>
  callApiBase({ route, baseUrl: BASE_URL_VESSEL });

export {
  callApi,
  authApi,
  callApiGet,
  callApiPost,
  callApiDelete,
  uploadDocApi,
  vesselCallApi,
  vesselGetApi,
  commodityGetApi,
  commoditySearchGetApi,
  commodityCallApi,
  portGetApi,
  viewOfferingGetApi,
};
