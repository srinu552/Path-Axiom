const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: "Server Error",
    error: err.message
  });
};

module.exports = errorHandler;