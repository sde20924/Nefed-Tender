const db = require('../../config/config'); // Database configuration
const asyncErrorHandler = require("../../utils/asyncErrorHandler"); // Async error handler middleware

// Controller to fetch auction items for a specific tender
const getTenderAuctionItemsController = asyncErrorHandler(async (req, res) => {
    const { tender_id } = req.params; // Getting tender_id from request params

    // Validation to ensure tender_id is provided
    if (!tender_id) {
        return res.status(400).send({ msg: 'tender_id is required' });
    }

    try {
        // Query to fetch all auction items related to the tender_id
        const auctionItems = await db.query(
            `SELECT * FROM tender_auct_items WHERE tender_id LIKE $1`,
            [`%${tender_id.replace('tender_', '')}%`]
        );

        // If no auction items found, send a 404 response
        if (auctionItems.rows.length === 0) {
            return res.status(404).send({ msg: 'No auction items found for the provided tender_id' });
        }

        // Return the list of auction items
        return res.status(200).send({
            msg: 'Auction items fetched successfully',
            auction_items: auctionItems.rows
        });

    } catch (error) {
        console.error("Error fetching auction items:", error.message); // Log error for debugging
        return res.status(500).send({ msg: 'Error fetching auction items', error: error.message });
    }
});

module.exports = {getTenderAuctionItemsController};
