const db = require('../../config/config'); // Database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Async error handler middleware

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

        // Fetch subtenders and all possible rows, including empty ones
        const headersWithSubTendersQuery = `
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
            WHERE s.tender_id = ?
            ORDER BY s.subtender_id, r.row_number, r.order
        `;
        const [headersWithSubTendersResult] = await db.query(headersWithSubTendersQuery, [tenderId]);

        // Parse tender details
        let tenderDetails = {
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
     //      Parse attachments
         tenderDetails = {
            ...tenderDetails, // Base tender details from the first row
            tenderDocuments: tenderDetailsResult.map(row => ({
              doc_key: row.doc_key,
              tender_doc_id: row.tender_doc_id,
              doc_label: row.doc_label,
              doc_ext: row.doc_ext,
              doc_size: row.doc_size,
            })).filter(doc => doc.doc_key) // Filter out any rows without documents
          }
       

        tenderDetails.headers = headers;

        // Parse subtenders and group rows by row_number
        const subTendersArray = [];
        const subTenderMap = new Map();

        headersWithSubTendersResult.forEach(row => {
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

            // Ensure all rows, even empty ones, are included
            const rowGroup = subTender.rows[row.row_number - 1] || [];
            rowGroup[row.order - 1] = {
                data: row.row_data || "", // Use empty string for missing data
                type: row.type || "edit", // Default to editable for missing rows
            };
            subTender.rows[row.row_number - 1] = rowGroup;
        });

        tenderDetails.sub_tenders = subTendersArray;

        // Return the result
        res.status(200).json({
            msg: 'Tender details fetched successfully',
            success: true,
            data: tenderDetails,
        });
    } catch (error) {
        console.error('Error fetching tender details:', error.message);
        res.status(500).json({
            msg: 'Error fetching tender details',
            success: false,
            error: error.message,
        });
    }
});

module.exports = {
    getTenderDetailsController,
};
