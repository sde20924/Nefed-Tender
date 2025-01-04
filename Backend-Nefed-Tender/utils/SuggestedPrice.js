const db = require('../config/config'); // Database configuration

const SuggestedPrice = async (tenderId, userId) => {
    try {
        // Fetch subtenders and rows, focusing on the "item" column (assumed second column)
        const subtendersQuery = `
            SELECT 
                s.subtender_id,
                s.subtender_name,
                r.row_data_id,
                r.header_id,
                r.row_data AS item,
                r.row_number,
                r.type
            FROM subtender s
            LEFT JOIN seller_header_row_data r ON s.subtender_id = r.subtender_id
            WHERE s.tender_id = ? AND r.order = 2 -- Assuming "item" column is the second column
            ORDER BY s.subtender_id, r.row_number
        `;
        const [subtenders] = await db.query(subtendersQuery, [tenderId]);

        if (subtenders.length === 0) {
            throw new Error('No subtenders or items found for the given tender.');
        }

        // Group items by subtender
        const subtenderItems = {};
        subtenders.forEach((row) => {
            const subtenderId = row.subtender_id;
            if (!subtenderItems[subtenderId]) {
                subtenderItems[subtenderId] = {
                    subtender_name: row.subtender_name,
                    items: [],
                };
            }
            subtenderItems[subtenderId].items.push({
                item: row.item,
                row_number: row.row_number,
            });
        });

        const suggestedPrices = [];

        for (const subtenderId in subtenderItems) {
            const subtender = subtenderItems[subtenderId];

            for (const item of subtender.items) {
                const { row_number, item: itemName } = item;

                // Fetch total amounts for the specific item for all users
                const userTotalAmountQuery = `
                    SELECT 
                        buyer_id,
                        CAST(row_data AS DECIMAL) AS rate
                    FROM buyer_header_row_data
                    WHERE subtender_id = ? AND row_number = ?
                `;
                const [userTotals] = await db.query(userTotalAmountQuery, [subtenderId, row_number]);

                if (userTotals.length === 0) {
                    continue;
                }

                // Calculate suggested price for all users
                let lowestRate = Infinity;
                let userRate = null;

                userTotals.forEach((user) => {
                    if (user.buyer_id === userId) {
                        userRate = user.rate;
                    }
                    if (user.rate < lowestRate) {
                        lowestRate = user.rate;
                    }
                });

                // If user's rate is less than or equal to the suggested price, do not show suggested price
                const suggestedPrice = lowestRate * 0.9;
                const showSuggestedPrice = userRate === null || userRate > suggestedPrice;

                suggestedPrices.push({
                    subtender_name: subtender.subtender_name,
                    item_name: itemName,
                    suggested_price: showSuggestedPrice ? suggestedPrice.toFixed(2) : null,
                    user_rate: userRate,
                   
                });
            }
        }

        return suggestedPrices;
    } catch (error) {
        console.error('Error calculating suggested prices:', error.message);
        throw new Error('Failed to calculate suggested prices.');
    }
};

module.exports = { SuggestedPrice };
