module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server error";
  const data = err.data;

  res.status(statusCode).json({ message, data });
};
