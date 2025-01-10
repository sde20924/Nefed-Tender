import { v4 as uuidv4 } from "uuid";

const generateUniqueId = () => {
  const uniqueId = uuidv4().replace(/-/g, "").slice(0, 12);
  return uniqueId;
};

export default generateUniqueId;
