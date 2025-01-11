import db from "../models/index.js";


const SuggestedPrice = async (tenderId, userId) => {
  try {
    // Count unique buyers for the tender
    const [uniqueBuyerResult] = await db.sequelize.query(
      `
      SELECT COUNT(DISTINCT buyer_id) AS uniqueBuyers
      FROM buyer_header_row_data
      WHERE subtender_id IN (
        SELECT subtender_id
        FROM subtender
        WHERE tender_id = :tenderId
      )
      `,
      {
        replacements: { tenderId },
      }
    );

    

    const uniqueBuyers = uniqueBuyerResult[0]?.uniqueBuyers || 0;

    if (uniqueBuyers < 2) {
      // Less than 2 unique buyers
      return {
        success: false,
        message: "Suggested data not available. Less than two unique buyers.",
      };
    }

    // Get the Rate column header_id
    const [rateHeaders] = await db.sequelize.query(
      `
      SELECT header_id
      FROM tender_header
      WHERE tender_id = :tenderId
        AND cal_col = 'R'
      LIMIT 1
      `,
      {
        replacements: { tenderId },
      }
    );

    if (!rateHeaders.length) {
      throw new Error(
        'No Rate column found in tender_header with cal_col="R".'
      );
    }
    const rateHeaderId = rateHeaders[0].header_id;

    // Get the Item column header_id
    const [itemHeaders] = await db.sequelize.query(
      `
      SELECT header_id
      FROM tender_header
      WHERE tender_id = :tenderId
        AND table_head = 'Item'
      LIMIT 1
      `,
      {
        replacements: { tenderId },
      }
    );

    if (!itemHeaders.length) {
      throw new Error(
        'No "Item" column found in tender_header (table_head="Item").'
      );
    }
    const itemHeaderId = itemHeaders[0].header_id;

    // Fetch subtender details, items, and rates
    const [rows] = await db.sequelize.query(
      `
      SELECT
        s.subtender_id,
        s.subtender_name,
        i.row_number AS rowNumber,
        i.row_data   AS itemName,
        r.row_data   AS rate
      FROM subtender s
      LEFT JOIN seller_header_row_data i
             ON s.subtender_id = i.subtender_id
            AND i.header_id = :itemHeaderId
      LEFT JOIN seller_header_row_data r
             ON s.subtender_id = r.subtender_id
            AND r.header_id = :rateHeaderId
            AND r.row_number = i.row_number
      WHERE s.tender_id = :tenderId
      ORDER BY s.subtender_id, i.row_number
      `,
      {
        replacements: { tenderId, itemHeaderId, rateHeaderId },
      }
    );

    if (!rows.length) {
      throw new Error(
        "No rows found for Item and Rate columns in seller_header_row_data."
      );
    }

    const subtenderMap = {};
    for (const row of rows) {
      const { subtender_id, subtender_name, rowNumber, itemName, rate } = row;

      if (!subtenderMap[subtender_id]) {
        subtenderMap[subtender_id] = {
          subtender_name,
          items: [],
        };
      }
      subtenderMap[subtender_id].items.push({
        row_number: rowNumber,
        item_name: itemName,
        seller_rate: parseFloat(rate) || null, // Ensure rate is numeric
      });
    }

    // Generate suggested prices
    const suggestedPrices = [];
    const EPSILON = 1e-6; // Tolerance for floating-point comparison

    for (const subtenderId in subtenderMap) {
      const st = subtenderMap[subtenderId];
      const subtenderResult = {
        subtender_name: st.subtender_name,
        items: [],
      };

      for (const itemObj of st.items) {
        const { row_number, item_name, seller_rate } = itemObj;

        // Fetch all rates for the item
        const [userTotals] = await db.sequelize.query(
          `
          SELECT
            buyer_id,
            CAST(row_data AS DECIMAL) AS rate
          FROM buyer_header_row_data
          WHERE subtender_id = :subtenderId
            AND row_number   = :rowNumber
            AND header_id    = :rateHeaderId
          `,
          {
            replacements: { subtenderId, rowNumber: row_number, rateHeaderId },
          }
        );

        if (!userTotals.length) {
          continue;
        }

        let lowestRate = Infinity;
        let userRate = null;

        userTotals.forEach((u) => {
          const rate = parseFloat(u.rate);
          if (isNaN(rate)) return;

          if (u.buyer_id === userId) {
            userRate = rate;
          }
          if (rate < lowestRate) {
            lowestRate = rate;
          }
        });

        // Log rates for debugging
        console.log(`Subtender ID: ${subtenderId}, Item: ${item_name}`);
        console.log(`Lowest Rate: ${lowestRate}, User Rate: ${userRate}`);

        // Skip if the logged-in user has the lowest rate (within tolerance)
        if (userRate !== null && Math.abs(userRate - lowestRate) < EPSILON) {
          console.log("User has the lowest rate. No suggested price.");
          continue;
        }

        // Calculate suggested price as 90% of the lowest rate
        const suggestedPrice = lowestRate * 0.9;

        // Show suggested price only if the user's rate is null or greater than the suggested price
        const showSuggestedPrice =
          userRate === null || userRate > suggestedPrice;

        if (showSuggestedPrice) {
          subtenderResult.items.push({
            item_name,
            suggested_price: suggestedPrice.toFixed(2),
            user_rate: userRate,
          });
        }
      }

      if (subtenderResult.items.length) {
        suggestedPrices.push(subtenderResult);
      }
    }

    return { success: true, suggestedPrices };
  } catch (error) {
    console.error("Error calculating suggested prices:", error.message);
    return { success: false, message: error.message };
  }
};

export default SuggestedPrice


