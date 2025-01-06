const db = require("../../config/config");

const getBidDetails = async (req, res) => {
  const user_id = req.user.user_id; // Extract the user ID from the middleware
  const { tender_id } = req.query; // Get the tender ID from query params

  if (!tender_id) {
    return res.status(400).json({
      msg: "Tender ID is required.",
      success: false,
    });
  }

  try {
    // Fetch all bids for the given tender ID, ordered by bid amount ASC (lowest to highest)
    const [allBids] = await db.query(
      `SELECT * FROM tender_bid_room WHERE tender_id = ? ORDER BY bid_amount ASC`,
      [tender_id]
    );

    if (allBids.length === 0) {
      return res.status(404).json({
        msg: "No bids found for this tender.",
        success: false,
      });
    }

    // Filter the current user's bids
    const userBids = allBids.filter((bid) => bid.user_id === user_id);

    if (userBids.length === 0) {
      return res.status(404).json({
        msg: "No bids found for this buyer on the given tender.",
        success: false,
      });
    }

    // Get the user's latest bid (most recent by created_at)
    const latestUserBid = userBids.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];

    const latestUserBidAmount = latestUserBid.bid_amount;

    // Check where the user's latest bid stands compared to others
    const rank = allBids
      .filter((bid) => bid.user_id !== user_id) // Exclude user's bids
      .reduce((currentRank, otherBid) => {
        if (otherBid.bid_amount < latestUserBidAmount) {
          currentRank++;
        }
        return currentRank;
      }, 1); // Start rank from 1

    // Determine the status based on rank
    let position;
    if (rank === 1) {
      position = "L1";
    } else {
      position = `Not L1`;
    }

    // Respond with the bid details and status
    res.status(200).json({
      msg: "Bid comparison fetched successfully.",
      success: true,
      data: {
        tender_id,
        latestUserBid,
        position,
      },
    });
  } catch (error) {
    console.error("Error fetching bid comparison:", error.message);
    res.status(500).json({
      msg: "Error fetching bid comparison.",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { getBidDetails };
