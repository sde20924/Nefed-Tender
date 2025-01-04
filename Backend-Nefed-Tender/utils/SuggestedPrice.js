const db = require('../config/config'); // Your DB config

const SuggestedPrice = async (tenderId, userId) => {
  try {
    const rateHeaderSql = `
      SELECT header_id
      FROM tender_header
      WHERE tender_id = ?
        AND cal_col = 'R'
      LIMIT 1
    `;
    const [rateHeaders] = await db.query(rateHeaderSql, [tenderId]);
    if (!rateHeaders.length) {
      throw new Error('No Rate column found in tender_header with cal_col="R".');
    }
    const rateHeaderId = rateHeaders[0].header_id;
    const itemHeaderSql = `
      SELECT header_id
      FROM tender_header
      WHERE tender_id = ?
        AND table_head = 'Item'
      LIMIT 1
    `;
    const [itemHeaders] = await db.query(itemHeaderSql, [tenderId]);
    if (!itemHeaders.length) {
      throw new Error('No "Item" column found in tender_header (table_head="Item").');
    }
    const itemHeaderId = itemHeaders[0].header_id;
    const sql = `
      SELECT
        s.subtender_id,
        s.subtender_name,
        i.row_number AS rowNumber,
        i.row_data   AS itemName,
        r.row_data   AS rate
      FROM subtender s
      LEFT JOIN seller_header_row_data i
             ON s.subtender_id = i.subtender_id
            AND i.header_id = ?
      LEFT JOIN seller_header_row_data r
             ON s.subtender_id = r.subtender_id
            AND r.header_id = ?
            AND r.row_number = i.row_number
      WHERE s.tender_id = ?
      ORDER BY s.subtender_id, i.row_number
    `;
    const [rows] = await db.query(sql, [itemHeaderId, rateHeaderId, tenderId]);

    if (!rows.length) {
      throw new Error('No rows found for Item and Rate columns in seller_header_row_data.');
    }
    const subtenderMap = {};
    for (const row of rows) {
      const {
        subtender_id,
        subtender_name,
        rowNumber,
        itemName,
        rate,
      } = row;

      if (!subtenderMap[subtender_id]) {
        subtenderMap[subtender_id] = {
          subtender_name,
          items: [],
        };
      }
      subtenderMap[subtender_id].items.push({
        row_number: rowNumber,
        item_name: itemName,
        seller_rate: rate, 
      });
    }

    // 5) For each (subtender, row_number), find buyers' rates from buyer_header_row_data
    //    and compute suggested price, skipping if the user's rate is the lowest
    const suggestedPrices = [];

    for (const subtenderId in subtenderMap) {
      const st = subtenderMap[subtenderId];
      const subtenderResult = {
        subtender_name: st.subtender_name,
        items: [],
      };

      // For each row in this subtender, gather buyer rates and compute
      for (const itemObj of st.items) {
        const { row_number, item_name } = itemObj;

        // Query all buyer rates for (subtenderId, row_number, rateHeaderId)
        const userTotalAmountQuery = `
          SELECT
            buyer_id,
            CAST(row_data AS DECIMAL) AS rate
          FROM buyer_header_row_data
          WHERE subtender_id = ?
            AND row_number   = ?
            AND header_id    = ?
        `;
        const [userTotals] = await db.query(userTotalAmountQuery, [
          subtenderId,
          row_number,
          rateHeaderId,
        ]);

        if (!userTotals.length) {
          // no buyers entered a rate => skip
          continue;
        }

        // Determine lowestRate and the current user's rate
        let lowestRate = Infinity;
        let userRate = null;

        userTotals.forEach((u) => {
          if (u.buyer_id === userId) {
            userRate = u.rate;
          }
          if (u.rate < lowestRate) {
            lowestRate = u.rate;
          }
        });

        // If the user's rate is exactly the lowest rate, skip this item
        if (userRate !== null && userRate === lowestRate) {
          // Do not push anything about this item into the results
          continue;
        }

        // Otherwise, compute suggested price = 90% of lowestRate
        const suggestedPrice = lowestRate * 0.9;
        // Show it only if user has no rate or userRate > suggestedPrice
        const showSuggestedPrice = userRate === null || userRate > suggestedPrice;

        subtenderResult.items.push({
          item_name, // from the "Item" column
          suggested_price: showSuggestedPrice ? suggestedPrice.toFixed(2) : null,
          user_rate: userRate,
        });
      }

      // Push this subtender’s results if it has any items left
      suggestedPrices.push(subtenderResult);
    }

    return suggestedPrices;
  } catch (error) {
    console.error('Error calculating suggested prices:', error.message);
    throw new Error('Failed to calculate suggested prices.');
  }
};

module.exports = { SuggestedPrice };
