const db = require('../../config/config'); // Database configuration
const asyncErrorHandler = require('../../utils/asyncErrorHandler'); // Async error handler middleware
const { SuggestedPrice } = require('../../utils/SuggestedPrice');

const getAccessBidWithSuggestedPrice = asyncErrorHandler(async (req, res) => {
    try {
        const tenderId = req.params.id; // Extract tender ID from request parameters
        const { user_id } = req.user;

        // Check if the buyer has participated in the tender
        const bidParticipationQuery = `
            SELECT COUNT(*) AS bid_count
            FROM tender_bid_room
            WHERE tender_id = ? AND user_id = ?
        `;
        const [bidParticipationResult] = await db.query(bidParticipationQuery, [tenderId, user_id]);
        const hasParticipated = bidParticipationResult[0].bid_count > 0;

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

        // Parse tender details
        let tenderDetails = {
            tender_title: tenderDetailsResult[0].tender_title,
            tender_slug: tenderDetailsResult[0].tender_slug,
            tender_desc: tenderDetailsResult[0].tender_desc,
            tender_cat: tenderDetailsResult[0].tender_cat,
            tender_opt: tenderDetailsResult[0].tender_opt,
            // emd_amt: tenderDetailsResult[0].emd_amt,
            // emt_lvl_amt: tenderDetailsResult[0].emt_lvl_amt,
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
            access_position: tenderDetailsResult[0].access_position,
        };
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


        // Fetch headers and identify those with type "edit"
        const headersQuery = `
            SELECT 
                header_id, 
                table_head, 
                \`order\`,
                type
            FROM tender_header
            WHERE tender_id = ?
            ORDER BY \`order\`
        `;
        const [headers] = await db.query(headersQuery, [tenderId]);

        // Fetch the latest data for "edit" type headers from buyer_header_row_data
        const editableHeaderIds = headers.filter(h => h.type === "edit").map(h => h.header_id);
        let headerRowData = [];

        if (editableHeaderIds.length > 0) {
            const editableHeaderDataQuery = `
                SELECT 
                    DISTINCT header_id, 
                    row_data, 
                    row_number, 
                    subtender_id
                FROM buyer_header_row_data AS bhrd
                JOIN (
                    SELECT 
                        MAX(row_data_id) AS latest_id
                    FROM buyer_header_row_data
                    WHERE header_id IN (?) AND buyer_id = ?
                    GROUP BY header_id, row_number, subtender_id
                ) AS latest ON bhrd.row_data_id = latest.latest_id
            `;
            [headerRowData] = await db.query(editableHeaderDataQuery, [editableHeaderIds, user_id]);
        }

        // Fetch subtenders and group rows
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

            const rowGroup = subTender.rows[row.row_number - 1] || [];
            rowGroup[row.order - 1] = {
                data: row.row_data || "", // Use empty string for missing data
                type: row.type || "edit", // Default to editable for missing rows
            };

            // Override data for editable headers if available
            const matchingHeaderData = headerRowData.find(
                d => d.header_id === row.header_id && d.row_number === row.row_number && d.subtender_id === row.subtender_id
            );

            if (matchingHeaderData) {
                rowGroup[row.order - 1].data = matchingHeaderData.row_data;
            }

            subTender.rows[row.row_number - 1] = rowGroup;
        });

        tenderDetails.headers = headers;
        tenderDetails.sub_tenders = subTendersArray;

         // Calculate suggested prices
         const suggestedPrices = await SuggestedPrice(tenderId,user_id)
         tenderDetails.headers = headers;
         tenderDetails.sub_tenders = subTendersArray;
         tenderDetails.suggested_prices = suggestedPrices;
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
    getAccessBidWithSuggestedPrice,
};
