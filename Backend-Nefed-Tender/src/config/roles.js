const allRoles = {
  user: ["viewTender", "bid", "placeBid"],
  admin: ["createTender", "viewTender", "viewBid"],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
