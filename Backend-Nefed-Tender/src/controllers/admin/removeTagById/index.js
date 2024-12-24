const db = require('../../../config/config');
const asyncErrorHandler = require('../../../utils/asyncErrorHandler');
const sendEmail = require('../../../utils/sentCustomEmail'); 

const removeTagById
 = asyncErrorHandler(async (req, res) => {
  const { tag_id } = req.params;

  // Start a transaction
  await db.query('BEGIN');

  try {
    // Check if the tag exists
    const tagCheckQuery = 'SELECT * FROM tags WHERE id = $1';
    const tagCheckResult = await db.query(tagCheckQuery, [tag_id]);
    if (tagCheckResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Tag not found', success: false });
    }

    // Update buyer and seller tables with default tag_ids and set status to 'not_verified'
    const updateBuyerQuery = `UPDATE buyer SET tag_id = 2, status = 'not_verified' WHERE tag_id = $1 RETURNING email`;
    const updateSellerQuery = `UPDATE seller SET tag_id = 1, status = 'not_verified' WHERE tag_id = $1 RETURNING email`;

    const updatedBuyers = await db.query(updateBuyerQuery, [tag_id]);
    const updatedSellers = await db.query(updateSellerQuery, [tag_id]);

    // Delete from required_documents and user_documents tables
    const deleteRequiredDocsQuery = 'DELETE FROM required_documents WHERE tag_id = $1';
    const deleteUserDocsQuery = 'DELETE FROM user_documents WHERE tag_id = $1';

    await db.query(deleteRequiredDocsQuery, [tag_id]);
    await db.query(deleteUserDocsQuery, [tag_id]);

    // Delete the tag
    const deleteTagQuery = 'DELETE FROM tags WHERE id = $1';
    await db.query(deleteTagQuery, [tag_id]);

    // Commit the transaction
    await db.query('COMMIT');

    // Fetch required documents for new tag_ids
    const requiredDocsBuyerQuery = 'SELECT name FROM required_documents WHERE tag_id = 2';
    const requiredDocsSellerQuery = 'SELECT name FROM required_documents WHERE tag_id = 1';

    const requiredDocsBuyer = await db.query(requiredDocsBuyerQuery);
    const requiredDocsSeller = await db.query(requiredDocsSellerQuery);

    // Send email notifications
    const sendEmails = async (recipients, userType, requiredDocs) => {
      const subject = 'Document Upload Required';
      const text = `Dear ${userType},\n\nYour documents need to be re-uploaded. Here is the list of required documents:\n${requiredDocs.join('\n')}`;

      await Promise.all(recipients.map(async (recipient) => {
        await sendEmail({
          to: recipient,
          subject,
          text
        });
      }));
    };

    await sendEmails(updatedBuyers.rows.map(buyer => buyer.email), 'Buyer', requiredDocsBuyer.rows.map(doc => doc.name));
    await sendEmails(updatedSellers.rows.map(seller => seller.email), 'Seller', requiredDocsSeller.rows.map(doc => doc.name));

    return res.status(200).json({ msg: 'Tag deleted and associated records updated successfully', success: true });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error deleting tag:', error);
    return res.status(500).json({ msg: 'Internal server error', success: false });
  }
});

module.exports = removeTagById
;
