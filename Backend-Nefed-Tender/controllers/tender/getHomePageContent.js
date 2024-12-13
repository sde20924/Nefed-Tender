const db = require('../../config/config'); 

const getHomepageContent = async (req,res) => {
  try {
    // Selecting the last row based on the primary key (id)
    const result = await db.query('SELECT * FROM homepage_content ORDER BY id DESC LIMIT 1');
    // console.log("Data retrieved from table by id:", result.rows[0]);
    return res.send({ data :result.rows[0] ,success : true});

  } catch (error) {
    //throw new Error('Error fetching homepage content: ' + error.message);
    return res.send({ msg : error.message ,success : false});
  }
};

module.exports = { getHomepageContent };
