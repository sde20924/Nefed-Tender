// const db = require('../../config/config'); // Database configuration
// const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Async error handler middleware

// // Controller to get details of a specific tender by tender ID
// const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
//     try {
//         const tenderId = req.params.id; // Extract tender ID from request parameters

//         // Fetch tender details from the manage_tender table
//         const tenderDetailsQuery = `
//             SELECT 
//                 mt.*, 
//                 trd.doc_key, 
//                 trd.tender_doc_id, 
//                 trd.doc_label, 
//                 trd.doc_ext, 
//                 trd.doc_size
//             FROM manage_tender mt
//             LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
//             WHERE mt.tender_id = ?
//         `;
//         const [tenderDetailsResult] = await db.query(tenderDetailsQuery, [tenderId]);

//         if (tenderDetailsResult.length === 0) {
//             return res.status(404).json({
//                 msg: 'Tender not found',
//                 success: false,
//             });
//         }

//         // Extract main tender details
//         const tenderDetails = tenderDetailsResult[0];

//         // Fetch headers associated with the tender
//         const headersQuery = `
//             SELECT 
//                 header_id, 
//                 table_head, 
//                 \`order\`
//             FROM tender_header
//             WHERE tender_id = ?
//             ORDER BY \`order\`
//         `;
//         const [headers] = await db.query(headersQuery, [tenderId]);
//   b              // Fetch subtenders and their row data for each header
//         const subTendersQuery = `
//             SELECT 
//                 s.subtender_id AS id, 
//                 s.subtender_name AS name, 
//                 r.header_id, 
//                 r.row_data, 
//                 r.type, 
//                 r.\`order\`
//             FROM subtender s
//             JOIN seller_header_row_data r ON s.subtender_id = r.subtender_id
//             WHERE r.header_id = ?
//             ORDER BY r.\`order\`
//         `;

//         // Initialize headers and subtenders structure
//         const headersWithSubTenders = headers.map(header => ({
//             header_id: header.header_id,
//             header_name: header.table_head,
//             subtenders: [],
//         }));

//         for (const header of headersWithSubTenders) {
//             const [subTendersResult] = await db.query(subTendersQuery, [header.header_id]);

//             const subtenderDetails = subTendersResult.reduce((acc, row) => {
//                 const existingSubTender = acc.find(sub => sub.id === row.id);
//                 if (existingSubTender) {
//                     // Append rows to the existing subtender
//                     existingSubTender.rows.push(parseRowData(row.row_data, row.type, row.order));
//                 } else {
//                     // Create a new subtender entry
//                     acc.push({
//                         id: row.id,
//                         name: row.name,
//                         rows: [parseRowData(row.row_data, row.type, row.order)],
//                     });
//                 }
//                 return acc;
//             }, []);

//             header.subtenders = subtenderDetails;
//         }

//         // Helper function to parse row_data and handle invalid JSON
//         function parseRowData(rowData, type, order) {
//             try {
//                 const parsedData = JSON.parse(rowData);
//                 return { ...parsedData, type, order };
//             } catch (err) {
//                 console.error('Error parsing row_data:', rowData, err);
//                 return { row_data: rowData, type, order }; // Return raw row_data if parsing fails
//             }
//         }

//         // Combine the results
//         const combinedData = {
//             ...tenderDetails,
//             tenderDocuments: tenderDetailsResult
//                 .filter(row => row.doc_key)
//                 .map(doc => ({
//                     doc_key: doc.doc_key,
//                     tender_doc_id: doc.tender_doc_id,
//                     doc_label: doc.doc_label,
//                     doc_ext: doc.doc_ext,
//                     doc_size: doc.doc_size,
//                 })),
//             headers: headersWithSubTenders.map(header => ({
//                 id: header.header_id,
//                 name: header.header_name,
//                 subtenders: header.subtenders.map(sub => ({
//                     id: sub.id,
//                     name: sub.name,
//                     rows: sub.rows.map(row => Object.values(row)), // Return rows as arrays
//                 })),
//             })),
//         };

//         // Return the combined data
//         return res.status(200).json({
//             data: combinedData,
//             msg: 'Tender details fetched successfully',
//             success: true,
//         });
//     } catch (error) {
//         console.error('Error fetching tender details:', error.message);
//         return res.status(500).send({
//             msg: 'Error fetching tender details',
//             error: error.message,
//             success: false,
//         });
//     }
// });

// module.exports = {
//     getTenderDetailsController,
// };


const db = require('../../config/config'); // Database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Async error handler middleware

// Controller to get details of a specific tender by tender ID
const getTenderDetailsController = asyncErrorHandler(async (req, res) => {
    try {
        const tenderId = req.params.id; // Extract tender ID from request parameters

        // Fetch tender details from the manage_tender table
        const tenderDetailsQuery = `
            SELECT 
                mt.*, 
                trd.doc_key, 
                trd.tender_doc_id, 
                trd.doc_label, 
                trd.doc_ext, 
                trd.doc_size
            FROM manage_tender mt
            LEFT JOIN tender_required_doc trd ON mt.tender_id = trd.tender_id
            WHERE mt.tender_id = ?
        `;
        const [tenderDetailsResult] = await db.query(tenderDetailsQuery, [tenderId]);

        if (tenderDetailsResult.length === 0) {
            return res.status(404).json({
                msg: 'Tender not found',
                success: false,
            });
        }

        const headersQuery = `
                     SELECT 
                         header_id, 
                         table_head, 
                         \`order\`
                     FROM tender_header
                     WHERE tender_id = ?
                     ORDER BY \`order\`
                 `;
                 const [headers] = await db.query(headersQuery, [tenderId]);
                        
            
        // Fetch headers and subtenders with a single query
        const headersWithSubTendersQuery = `
            SELECT 
                s.subtender_id,
                s.subtender_name,
                r.row_data_id,
                r.header_id,
                r.row_data,
                r.type,
                r.order,
                r.header_id
            FROM subtender s
            LEFT JOIN seller_header_row_data r ON s.subtender_id = r.subtender_id
            WHERE s.tender_id = ?
            ORDER BY r.order
        `;
        const [headersWithSubTendersResult] = await db.query(headersWithSubTendersQuery, [tenderId]);

        // Parse tender details
        const tenderDetails = {
            tender_title: tenderDetailsResult[0].tender_title,
            tender_slug: tenderDetailsResult[0].tender_slug,
            tender_desc: tenderDetailsResult[0].tender_desc,
            tender_cat: tenderDetailsResult[0].tender_cat,
            tender_opt: tenderDetailsResult[0].tender_opt,
            emd_amt: tenderDetailsResult[0].emd_amt,
            emt_lvl_amt: tenderDetailsResult[0].emt_lvl_amt,
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
            aut_auct_ext_bfr_end_time: tenderDetailsResult[0].aut_auct_ext_bfr_end_time,
            min_decr_bid_val: tenderDetailsResult[0].min_decr_bid_val,
            timer_ext_val: tenderDetailsResult[0].timer_ext_val,
            qty_split_criteria: tenderDetailsResult[0].qty_split_criteria,
            counter_offr_accept_timer: tenderDetailsResult[0].counter_offr_accept_timer,
            img_url: tenderDetailsResult[0].img_url,
            auction_type: tenderDetailsResult[0].auction_type,
            tender_id: tenderDetailsResult[0].tender_id,
            audi_key: tenderDetailsResult[0].audi_key,
        };

        // Parse attachments
        tenderDetails.attachments = tenderDetailsResult
            .filter(row => row.doc_key)
            .map(doc => ({
                key: doc.doc_key,
                extension: doc.doc_ext,
                maxFileSize: doc.doc_size,
                label: doc.doc_label,
            }));

            
            tenderDetails.headers = headers


            const subTendersArray = [];

            const subTenderMap = new Map();

            headersWithSubTendersResult.forEach((row) => {
              const subTenderId = row.subtender_id;
              const subTenderName = row.subtender_name;
      
              // Check if the sub-tender already exists in the map
              if (!subTenderMap.has(subTenderId)) {
                  const newSubTender = {
                      id: subTenderId,
                      name: subTenderName,
                      rows: [],
                  };
                  subTenderMap.set(subTenderId, newSubTender);
                  subTendersArray.push(newSubTender);
              }
      
              // Process and deduplicate row_data
              if (row.row_data) {
                  const subTender = subTenderMap.get(subTenderId);
                  const rowDataArray = row.row_data; // Parse if stored as JSON
      
                  // Check if the row is already in the array (to avoid duplicates)
                  const isDuplicate = subTender.rows.some((existingRow) =>
                      existingRow === rowDataArray
                  );
      
                  if (!isDuplicate) {
                      subTender.rows.push(rowDataArray);
                  }
              }
          });
      
          tenderDetails.sub_tenders = subTendersArray
     
// headersWithSubTendersResult.forEach(row => {
//     if (row.header_id) {
//         if (!headersMap[row.header_id]) {
//             headersMap[row.header_id] = {
//                 id: row.header_id,
//                 name: row.header_name,
//                 subtenders: {}, // Store subtenders
//             };
//         }

//         if (row.sub_id) {
//             if (!headersMap[row.header_id].subtenders[row.sub_id]) {
//                 headersMap[row.header_id].subtenders[row.sub_id] = {
//                     id: row.sub_id,
//                     name: row.sub_name,
//                     rows: [],
//                 };
//             }

//             // Handle row_data parsing
//             let parsedRow;
//             try {
//                 parsedRow = JSON.parse(row.row_data); // Try parsing as JSON
//             } catch (err) {
//                 console.error('Invalid JSON in row_data:', row.row_data); // Log error
//                 parsedRow = { value: row.row_data }; // Fallback to raw data
//             }

//             const rowValues = parsedRow
//                 ? Object.values({ ...parsedRow, type: row.row_type, order: row.row_order })
//                 : [row.row_data];

//             headersMap[row.header_id].subtenders[row.sub_id].rows.push(rowValues);
//         }
//     }
// });

// // Build editable_sheet
// tenderDetails.editable_sheet = {
//     headers: Object.values(headersMap).map(header => header.name), // Extract header names
//     sub_tenders: Object.values(headersMap).flatMap(header =>
//         Object.values(header.subtenders).map(subtender => ({
//             id: subtender.id,
//             name: subtender.name,
//             rows: subtender.rows,
//         }))
//     ),
// };


        // Return the formatted response
        return res.status(200).json({
            data: tenderDetails,
            msg: 'Tender details fetched successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error fetching tender details:', error.message);
        return res.status(500).send({
            msg: 'Error fetching tender details',
            error: error.message,
            success: false,
        });
    }
});

module.exports = {
    getTenderDetailsController,
};
