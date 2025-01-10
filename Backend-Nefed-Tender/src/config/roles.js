const allRoles = {
  user: ["viewTender", "bid", "placeBid"],
  admin: ["createTender", "viewTender", "viewBid"],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
