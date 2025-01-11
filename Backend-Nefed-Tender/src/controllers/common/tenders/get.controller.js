import db from "../../../models/index.js";
import asyncErrorHandler from "../../../utils/asyncErrorHandler.js";

export const getTenderDetailsController = asyncErrorHandler(
  async (req, res) => {
    try {
      const tenderId = req.params.id; // Extract tender ID from request parameters
      const { login_as } = req.user;

      // Fetch tender details from the manage_tender table
      const [tenderDetailsResult] = await db.sequelize.query(
        `
      SELECT 
        mt.*, 
        trd.doc_key, 
        trd.tender_doc_id, 
        trd.doc_label, 
        trd.doc_ext, 
        trd.doc_size
      FROM manage_tender mt
      LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
      WHERE mt.tender_id = :tenderId
      `,
        {
          replacements: { tenderId },
        }
      );

      if (tenderDetailsResult.length === 0) {
        return res.status(404).json({
          msg: "Tender not found",
          success: false,
        });
      }
     
      // Parse tender details
      let tenderDetails = {
        tender_title: tenderDetailsResult[0].tender_title,
        tender_slug: tenderDetailsResult[0].tender_slug,
        tender_desc: tenderDetailsResult[0].tender_desc,
        tender_cat: tenderDetailsResult[0].tender_cat,
        tender_opt: tenderDetailsResult[0].tender_opt,
        save_as: tenderDetailsResult[0].save_as,
        custom_form: tenderDetailsResult[0].custom_form,
        currency: tenderDetailsResult[0].currency,
        start_price: tenderDetailsResult[0].start_price,
        dest_port: tenderDetailsResult[0].dest_port,
        bag_size: tenderDetailsResult[0].bag_size,
        bag_type: tenderDetailsResult[0].bag_type,
        app_start_time: tenderDetailsResult[0].app_start_time,
        app_end_time: tenderDetailsResult[0].app_end_time,
        auct_start_time: tenderDetailsResult[0].auct_start_time,
        auct_end_time: tenderDetailsResult[0].auct_end_time,
        time_frame_ext: tenderDetailsResult[0].time_frame_ext,
        extended_at: tenderDetailsResult[0].extended_at,
        amt_of_ext: tenderDetailsResult[0].amt_of_ext,
        aut_auct_ext_bfr_end_time:
          tenderDetailsResult[0].aut_auct_ext_bfr_end_time,
        min_decr_bid_val: tenderDetailsResult[0].min_decr_bid_val,
        timer_ext_val: tenderDetailsResult[0].timer_ext_val,
        qty_split_criteria: tenderDetailsResult[0].qty_split_criteria,
        counter_offr_accept_timer:
          tenderDetailsResult[0].counter_offr_accept_timer,
        img_url: tenderDetailsResult[0].img_url,
        auction_type: tenderDetailsResult[0].auction_type,
        tender_id: tenderDetailsResult[0].tender_id,
        audi_key: tenderDetailsResult[0].audi_key,
        access_position: tenderDetailsResult[0].access_position,
        show_items: tenderDetailsResult[0].show_items,
        category: tenderDetailsResult[0].category,
        formula: tenderDetailsResult[0].cal_formula,
      };

      tenderDetails = {
        ...tenderDetails,
        tenderDocuments: tenderDetailsResult
          .map((row) => ({
            doc_key: row.doc_key,
            tender_doc_id: row.tender_doc_id,
            doc_label: row.doc_label,
            doc_ext: row.doc_ext,
            doc_size: row.doc_size,
          }))
          .filter((doc) => doc.doc_key),
      };

      // Fetch headers
      const headers = await db.sequelize.query(
        `
      SELECT 
        header_id, 
        table_head, 
        \`order\`
      FROM tender_header
      WHERE tender_id = :tenderId
      ORDER BY \`order\`
      `,
        {
          replacements: { tenderId },
        }
      );

      tenderDetails.headers = headers;

      // Fetch subtenders and all possible rows if the user is a seller or buyer with show_items enabled
      if (
        login_as === "seller" ||
        (login_as === "buyer" && tenderDetails.show_items === "yes")
      ) {
        const headersWithSubTendersResult = await db.sequelize.query(
          `
        SELECT 
          s.subtender_id,
          s.subtender_name,
          r.row_data_id,
          r.header_id,
          r.row_data,
          r.type,
          r.order,
          r.row_number
        FROM subtender s
        LEFT JOIN seller_header_row_data r ON s.subtender_id = r.subtender_id
        WHERE s.tender_id = :tenderId
        ORDER BY s.subtender_id, r.row_number, r.order
        `,
          {
            replacements: { tenderId },
          }
        );

        const subTendersArray = [];
        const subTenderMap = new Map();

        headersWithSubTendersResult.forEach((row) => {
          const subTenderId = row.subtender_id;
          const subTenderName = row.subtender_name;

          if (!subTenderMap.has(subTenderId)) {
            const newSubTender = {
              id: subTenderId,
              name: subTenderName,
              rows: [],
            };
            subTenderMap.set(subTenderId, newSubTender);
            subTendersArray.push(newSubTender);
          }

          const subTender = subTenderMap.get(subTenderId);
          const rowGroup = subTender.rows[row.row_number - 1] || [];
          rowGroup[row.order - 1] = {
            data: row.row_data || "",
            type: row.type || "edit",
          };
          subTender.rows[row.row_number - 1] = rowGroup;
        });

        tenderDetails.sub_tenders = subTendersArray;
      }

      // Fetch selected buyers for private tenders
      if (tenderDetails.accessType === "private") {
        const selectedBuyers = await db.sequelize.query(
          `
        SELECT buyer_id
        FROM tender_access
        WHERE tender_id = :tenderId
        `,
          {
            replacements: { tenderId },
          }
        );
        tenderDetails.selected_buyers = selectedBuyers.map(
          (buyer) => buyer.buyer_id
        );
      }

      // Return the result
      res.status(200).json({
        msg: "Tender details fetched successfully",
        success: true,
        data: tenderDetails,
      });
    } catch (error) {
      console.error("Error fetching tender details:", error.message);
      res.status(500).json({
        msg: "Error fetching tender details",
        success: false,
        error: error.message,
      });
    }
  }
);

export const getAllDemoExcelSheetsController = asyncErrorHandler(
  async (req, res) => {
    try {
      // SQL query to fetch demo tender sheets and their headers
      const query = `
       SELECT 
        dts.demo_tender_sheet_id,
        dts.tender_table_name,
        dts.created_at AS sheet_created_at,
        dth.demo_tender_header_id,
        dth.header_display_name,
        dth.created_at AS header_created_at,
        dth.type AS type,
        sts.sub_tender_sheet_id,
        sts.sub_tender_table_name,
        sts.created_at AS sub_tender_created_at
      FROM 
        demo_tender_sheet dts
      LEFT JOIN 
        demo_tender_header dth 
      ON 
        dts.demo_tender_sheet_id = dth.demo_tender_sheet_id
      LEFT JOIN 
        sub_tender_sheet sts
      ON 
        dts.demo_tender_sheet_id = sts.demo_tender_sheet_id
      ORDER BY 
        dts.demo_tender_sheet_id, dth.demo_tender_header_id, sts.sub_tender_sheet_id;
    `;

      // Execute the query using Sequelize
      const [results] = await db.sequelize.query(query);

      const formattedData = results.reduce((acc, row) => {
        const sheetId = row.demo_tender_sheet_id;
        if (!acc[sheetId]) {
          acc[sheetId] = {
            tender_table_name: row.tender_table_name,
            created_at: row.sheet_created_at,
            headers: [], // Initialize headers array
            subcategories: [], // Initialize subcategories array
          };
        }

        // Add headers if they exist, ensuring headers are added only once
        if (
          row.demo_tender_header_id &&
          !acc[sheetId].headers.some(
            (header) =>
              header.demo_tender_header_id === row.demo_tender_header_id
          )
        ) {
          acc[sheetId].headers.push({
            demo_tender_header_id: row.demo_tender_header_id,
            header_display_name: row.header_display_name,
            created_at: row.header_created_at,
            type: row.type,
          });
        }

        // Add subcategories if they exist, ensuring subcategories are added only once
        if (
          row.sub_tender_sheet_id &&
          !acc[sheetId].subcategories.some(
            (subcategory) =>
              subcategory.sub_tender_sheet_id === row.sub_tender_sheet_id
          )
        ) {
          acc[sheetId].subcategories.push({
            sub_tender_sheet_id: row.sub_tender_sheet_id,
            sub_tender_table_name: row.sub_tender_table_name,
            created_at: row.sub_tender_created_at,
          });
        }

        return acc;
      }, {});

      // Convert object to array
      const responseData = Object.keys(formattedData).map((key) => ({
        demo_tender_sheet_id: key,
        ...formattedData[key],
      }));

      // Return the structured data
      res.status(200).json({
        success: true,
        data: responseData,
        message:
          "Demo tender sheets with headers and subcategories fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching demo tender sheets:", error.message);

      // Respond with error details
      res.status(500).json({
        success: false,
        message: "Failed to fetch demo tender sheets",
        error: error.message,
      });
    }
  }
);

export const getTenderFilesAndStatus = asyncErrorHandler(async (req, res) => {
  const { id: tenderId } = req.params; // Extract tender ID from request parameters

  try {
    // SQL query to fetch tender files and application status
    const query = `
      SELECT 
        tud.*, 
        ta.status AS application_status
      FROM 
        tender_user_doc tud
      LEFT JOIN 
        tender_application ta 
      ON 
        tud.tender_id = ta.tender_id
      WHERE 
        tud.tender_id = :tenderId;
    `;

    // Execute the query with Sequelize's query method
    const [rows] = await db.sequelize.query(query, {
      replacements: { tenderId },
    });

    // Respond with the data or a 404 error if no records are found
    if (rows.length > 0) {
      return res.status(200).json({
        success: true,
        data: rows,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No data found for this tender",
      });
    }
  } catch (error) {
    console.error(
      "Error fetching uploaded files and application status:",
      error.message
    );

    // Respond with a 500 error for server issues
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data",
      error: error.message,
    });
  }
});
