 module.exports = (error, req, res, next)=>{
    error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error'
  console.log("Error", error);
    res.status(error.statusCode).json({
      status: error.statusCode, 
      msg: error.message
    })
  }