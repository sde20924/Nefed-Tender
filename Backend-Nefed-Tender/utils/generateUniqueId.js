const { v4: uuidv4 } = require('uuid');

module.exports = function generateUniqueId() {
    const uniqueId = uuidv4().replace(/-/g, '').slice(0, 12);
    return uniqueId;
}